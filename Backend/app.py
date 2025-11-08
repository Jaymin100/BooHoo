from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import random as rd
import uuid
import os
import base64

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# In-memory storage
games = {}

def generate_room_code():
    """Generate a 6-digit room code"""
    code = ''.join([str(rd.randint(0, 9)) for _ in range(6)])
    # Make sure it's unique
    while code in games:
        code = ''.join([str(rd.randint(0, 9)) for _ in range(6)])
    return code

@app.route('/api/create_room', methods=['POST'])
def create_room():
    room_code = generate_room_code()
    
    # CREATE THE ROOM IN STORAGE!
    games[room_code] = {
        'room_code': room_code,
        'status': 'waiting',
        'host_id':'',
        'players': {},
        'costumes': []
    }
    
    return jsonify({'success': True, 'room_code': room_code})

#expects user in phase 2
@app.route('/api/join', methods=['POST'])
def join_room():
    data = request.get_json()
    
    # 1. Extract room_code, player_name from data
    room_code = data['room_code']
    player_name = data['player_name']
    # image_data = data['image_data']  # Save for later
    
    # 2. Check if room exists
    if room_code not in games:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    
    # 3. Generate player_id
    player_id = str(uuid.uuid4())
    
    if games[room_code]['host_id'] == '':
        games[room_code]['host_id'] = player_id

    # 4. Add player to games[room_code]['players']
    games[room_code]['players'][player_id] = {
        "name": player_name,
        "costume_uploaded": False,  # Changed to False since we're not saving images yet
        "has_finished_voting": False
    }

    
    # 5. For now, skip image saving, but add a placeholder costume
    costume_id = str(uuid.uuid4())
    games[room_code]['costumes'].append({
        "costume_id": costume_id,
        "player_id": player_id,
        "filename": "",  # Empty for now
        "votes": 0
    })

    # 6. Return success
    return jsonify({
        'success': True,
        'player_id': player_id
    })

@app.route('/api/debug/rooms', methods=['GET'])
def debug_games():
    """Shows all games in memory - useful for debugging"""
    return jsonify(games)

@app.route('/api/room/<room_code>', methods=['GET'])
def get_room(room_code):
    if room_code not in games:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    
    room = games[room_code]
    
    # Convert players dict to list
    players_list = []
    for player_id, player_data in room['players'].items():
        players_list.append({
            'player_id': player_id,
            'name': player_data['name'],
            'costume_uploaded': player_data['costume_uploaded']
        })
    
    return jsonify({
        'room_code': room_code,
        'status': room['status'],
        'players': players_list
    })

@app.route('/api/verifiy',  methods=['POST'])
def room_exists():
    data = request.get_json()
    room_code = data['room_code']
    if room_code not in games:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    return jsonify({'success': True})



@app.route('/upload', methods=['POST'])
def upload_image():
    data = request.get_json()
    img_b64 = data['image']  # this is your base64 string from JS
    img_bytes = base64.b64decode(img_b64)

    # Save to file
    with open('uploaded_image.png', 'wb') as f:
        f.write(img_bytes)

    return {"status": "success"}

    
if __name__ == '__main__':
    app.run(debug=True, port=5000)