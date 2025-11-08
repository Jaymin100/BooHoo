import random as rd
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import random
import uuid
import os
import base64

class playerOBJ:
    def __init__(self, player_id, name, score=0, connected=False):
        self.player_id = player_id
        self.name = name
        self.score = score
        self.connected = connected
               
class roomOBJ:
    def __init__(self, status='waiting', costume_queue={}, player_id='', room_id='', players_in_room={}):
        self.room_id = room_id
        self.player_id = player_id
        self.status = status
        self.costume_queue = costume_queue
        self.players_in_room = players_in_room
          
    def room_id(self):
        if self.player_id == 0:
            for i in range(6):
                random_str = str(rd.randint(0, 9))
                self.room_id += random_str
                       
class costumeOBJ:
    def __init__(self, costume_id, image_url):
        self.costume_id = costume_id
        self.image_url = image_url
    
class leaderboardOBJ:
    def __init__(self, vote_amt, player_id, name):
        self.vote_amt = vote_amt
        self.player_id = player_id
        self.name = name




app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# In-memory storage
games = {}

def generate_room_code():
    """Generate a 6-digit room code"""
    code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    # Make sure it's unique
    while code in games:
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    return code

@app.route('/api/create_room', methods=['POST'])
def create_room():
    room_code = generate_room_code()
    
    # CREATE THE ROOM IN STORAGE!
    games[room_code] = {
        'room_code': room_code,
        'status': 'waiting',
        'players': {},
        'costumes': []
    }
    
    return jsonify({'room_code': room_code})

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