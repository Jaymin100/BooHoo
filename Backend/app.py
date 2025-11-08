from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import random as rd
import uuid
import os

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# In-memory storage
games = {}

def generate_room_code():
    """Generate a 6-digit random room code"""
    code = ''.join([str(rd.randint(0, 9)) for _ in range(6)])
    # Make sure it's unique
    while code in games:
        code = ''.join([str(rd.randint(0, 9)) for _ in range(6)])
    return code

@app.route('/api/create_room', methods=['POST'])
def create_room():
    """Generates the room code and store it in storage."""
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
    """Logic to have the player join a precreated room."""
    data = request.get_json()
    
    # 1. Extract room_code, player_name from data
    room_code = data['room_code']
    player_name = data['player_name']
    image_data = data['image_data']
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
        "votes": 0,
        "image_data": image_data
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

@app.route('/debug', methods=['GET'])
def debug_page():
    """Simple HTML page to view games in a readable format"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Games Debug View</title>
        <style>
            body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #fff; }
            pre { background: #2a2a2a; padding: 15px; border-radius: 5px; overflow-x: auto; }
            button { padding: 10px 20px; margin: 10px 0; background: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 5px; }
            button:hover { background: #45a049; }
            .info { color: #4CAF50; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <h1>Games Debug View</h1>
        <div class="info">View all active games/rooms in memory</div>
        <button onclick="location.reload()">Refresh</button>
        <button onclick="fetch('/api/debug/rooms').then(r => r.json()).then(d => { document.getElementById('data').textContent = JSON.stringify(d, null, 2); })">Load Data</button>
        <pre id="data">Click "Load Data" to view games...</pre>
        <script>
            // Auto-load on page load
            fetch('/api/debug/rooms')
                .then(r => r.json())
                .then(d => {
                    document.getElementById('data').textContent = JSON.stringify(d, null, 2);
                })
                .catch(e => {
                    document.getElementById('data').textContent = 'Error: ' + e.message;
                });
        </script>
    </body>
    </html>
    """
    return html

@app.route('/api/room/<room_code>', methods=['GET'])
def get_room(room_code):
    """Logic to see if room code entered exsists and if not returns and error
    of Room not found"""
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
    """Same as get_room"""
    data = request.get_json()
    room_code = data['room_code']
    if room_code not in games:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    return jsonify({'success': True})

@app.route('/api/start_game/<room_code>', methods=['POST'])
def start_game(room_code):
    """Changes the status to playing"""
    # Check if room exists
    if room_code not in games:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    
    # Change status to playing
    games[room_code]['status'] = 'playing'
    
    # Return success
    return jsonify({'success': True})

@app.route('/api/costumes/<room_code>', methods=['GET'])
def get_costumes(room_code):
    """Get all costumes for a room, including player names"""
    # Check if room exists
    if room_code not in games:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    
    room = games[room_code]
    costumes_with_names = []
    
    # Loop through costumes and add player names
    for costume in room['costumes']:
        player_id = costume.get('player_id')
        player_name = None
        
        # Get player name from players dict
        if player_id and player_id in room['players']:
            player_name = room['players'][player_id].get('name')
        
        # Create costume object with name
        costume_with_name = costume.copy()
        costume_with_name['player_name'] = player_name
        costumes_with_names.append(costume_with_name)
    
    return jsonify({'costumes': costumes_with_names})

@app.route('/api/submit_votes', methods=['POST'])
def submit_votes():
    """Tracks who have voteded and add together votes per costume"""
    data = request.get_json()
    room_code = data['room_code']
    player_id = data['player_id']
    votes = data['votes']  # Dictionary: {costume_id: score}
    
    # Check room exists
    if room_code not in games:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    
    # Loop through each costume and update votes
    # votes is like: {"costume-id-1": 1, "costume-id-2": 0, "costume-id-3": 1}
    for costume in games[room_code]['costumes']:
        costume_id = costume['costume_id']
        if costume_id in votes:
            costume['votes'] += votes[costume_id]
    
    # Mark player as finished voting
    games[room_code]['players'][player_id]["has_finished_voting"] = True
    
    return jsonify({'success': True})

@app.route('/api/upload', methods=['POST'])
def costume_image():
    """Revices the base64 of the img from the frontend"""
    data = request.get_json()
    img_b64 = data['image']  # this is your base64 string from JS

    return {"status": "success"}, img_b64
    
if __name__ == '__main__':
    app.run(debug=True, port=5000)