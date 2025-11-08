from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flasgger import Swagger
import random as rd
import uuid

app = Flask(__name__)
# Configure CORS to allow requests from ngrok and any origin
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Add Swagger configuration
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec',
            "route": '/apispec.json',
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/api/docs"  # Access Swagger UI at /api/docs
}

swagger = Swagger(app, config=swagger_config, template={
    "info": {
        "title": "Halloween Costume Rating API",
        "description": "API for Tinder-style costume rating game - Players join rooms, upload costumes, and vote on each other's costumes",
        "version": "1.0.0"
    }
})

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
    """
    Create a new game room
    ---
    tags:
      - Room Management
    responses:
      200:
        description: Room created successfully
        schema:
          properties:
            success:
              type: boolean
              example: true
            room_code:
              type: string
              example: "123456"
              description: 6-digit room code
    """
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

@app.route('/api/join', methods=['POST'])
def join_room():
    """
    Player joins a room with name and optional costume image
    ---
    tags:
      - Player Actions
    parameters:
      - in: body
        name: body
        required: true
        schema:
          required:
            - room_code
            - player_name
          properties:
            room_code:
              type: string
              example: "123456"
              description: 6-digit room code
            player_name:
              type: string
              example: "Alice"
              description: Player's display name
            image_data:
              type: string
              description: Base64 encoded costume image (optional)
    responses:
      200:
        description: Player joined successfully
        schema:
          properties:
            success:
              type: boolean
              example: true
            player_id:
              type: string
              example: "550e8400-e29b-41d4-a716-446655440000"
              description: Unique player identifier
            is_host:
              type: boolean
              example: true
              description: Whether this player is the room host
      404:
        description: Room not found
        schema:
          properties:
            success:
              type: boolean
              example: false
            error:
              type: string
              example: "Room not found"
    """
    data = request.get_json()
    
    # 1. Extract room_code, player_name from data
    room_code = data['room_code']
    player_name = data['player_name']
    image_data = data.get('image_data', None)  # Make image_data optional
    
    # 2. Check if room exists
    if room_code not in games:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    
    # 3. Generate player_id
    player_id = str(uuid.uuid4())
    
    # 4. Check if this is the first player (host) - set host_id if empty
    is_host = False
    if games[room_code]['host_id'] == '':
        games[room_code]['host_id'] = player_id
        is_host = True
    else:
        is_host = games[room_code]['host_id'] == player_id

    # 5. Add player to games[room_code]['players']
    games[room_code]['players'][player_id] = {
        "name": player_name,
        "costume_uploaded": image_data is not None,
        "has_finished_voting": False
    }

    # 6. Add costume entry
    costume_id = str(uuid.uuid4())
    games[room_code]['costumes'].append({
        "costume_id": costume_id,
        "player_id": player_id,
        "filename": "",
        "votes": 0,
        "image_data": image_data if image_data else ""
    })

    # 7. Double-check host status
    final_is_host = games[room_code]['host_id'] == player_id
    
    # 8. Return success with host status
    return jsonify({
        'success': True,
        'player_id': player_id,
        'is_host': final_is_host
    })

@app.route('/api/debug/rooms', methods=['GET'])
def debug_games():
    """
    Debug endpoint - View all rooms in memory
    ---
    tags:
      - Debug
    responses:
      200:
        description: All games/rooms currently in memory
        schema:
          type: object
          description: Dictionary of all rooms with their data
    """
    return jsonify(games)

@app.route('/debug', methods=['GET'])
def debug_page():
    """
    Debug page - HTML interface to view all rooms
    ---
    tags:
      - Debug
    responses:
      200:
        description: HTML page displaying all rooms
    """
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
    """
    Get room information including players and status
    ---
    tags:
      - Room Management
    parameters:
      - in: path
        name: room_code
        required: true
        schema:
          type: string
        description: 6-digit room code
        example: "123456"
    responses:
      200:
        description: Room information retrieved successfully
        schema:
          properties:
            room_code:
              type: string
              example: "123456"
            status:
              type: string
              example: "waiting"
              description: Room status (waiting, playing, finished)
            host_id:
              type: string
              example: "550e8400-e29b-41d4-a716-446655440000"
              description: Player ID of the room host
            players:
              type: array
              items:
                type: object
                properties:
                  player_id:
                    type: string
                  name:
                    type: string
                  costume_uploaded:
                    type: boolean
      404:
        description: Room not found
    """
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
        'host_id': room.get('host_id', ''),
        'players': players_list
    })

@app.route('/api/verifiy',  methods=['POST'])
def room_exists():
    """
    Verify if a room exists
    ---
    tags:
      - Room Management
    parameters:
      - in: body
        name: body
        required: true
        schema:
          required:
            - room_code
          properties:
            room_code:
              type: string
              example: "123456"
              description: 6-digit room code to verify
    responses:
      200:
        description: Room exists
        schema:
          properties:
            success:
              type: boolean
              example: true
      404:
        description: Room not found
        schema:
          properties:
            success:
              type: boolean
              example: false
            error:
              type: string
              example: "Room not found"
    """
    data = request.get_json()
    room_code = data['room_code']
    if room_code not in games:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    return jsonify({'success': True})

@app.route('/api/start_game/<room_code>', methods=['POST'])
def start_game(room_code):
    """
    Host starts the game (changes status to 'playing')
    ---
    tags:
      - Game Flow
    parameters:
      - in: path
        name: room_code
        required: true
        schema:
          type: string
        description: 6-digit room code
        example: "123456"
    responses:
      200:
        description: Game started successfully
        schema:
          properties:
            success:
              type: boolean
              example: true
      404:
        description: Room not found
    """
    # Check if room exists
    if room_code not in games:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    
    # Change status to playing
    games[room_code]['status'] = 'playing'
    
    # Return success
    return jsonify({'success': True})

@app.route('/api/costumes/<room_code>', methods=['GET'])
def get_costumes(room_code):
    """
    Get all costumes in a room with player names for voting
    ---
    tags:
      - Game Flow
    parameters:
      - in: path
        name: room_code
        required: true
        schema:
          type: string
        description: 6-digit room code
        example: "123456"
    responses:
      200:
        description: List of all costumes
        schema:
          properties:
            costumes:
              type: array
              items:
                type: object
                properties:
                  costume_id:
                    type: string
                  player_id:
                    type: string
                  player_name:
                    type: string
                  filename:
                    type: string
                  votes:
                    type: integer
                  image_data:
                    type: string
      404:
        description: Room not found
    """
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
    """
    Submit votes for costumes
    ---
    tags:
      - Game Flow
    parameters:
      - in: body
        name: body
        required: true
        schema:
          required:
            - room_code
            - player_id
            - votes
          properties:
            room_code:
              type: string
              example: "123456"
              description: 6-digit room code
            player_id:
              type: string
              example: "550e8400-e29b-41d4-a716-446655440000"
              description: Player's unique ID
            votes:
              type: object
              example: {"costume-id-1": 1, "costume-id-2": 0, "costume-id-3": 1}
              description: Dictionary mapping costume IDs to votes (1=like, 0=skip)
    responses:
      200:
        description: Votes submitted successfully
        schema:
          properties:
            success:
              type: boolean
              example: true
            all_finished:
              type: boolean
              example: false
              description: Whether all players have finished voting
      404:
        description: Room not found
    """
    data = request.get_json()
    room_code = data['room_code']
    player_id = data['player_id']
    votes = data['votes']  # Dictionary: {costume_id: score}
    
    # Check room exists
    if room_code not in games:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    
    # Loop through each costume and update votes
    for costume in games[room_code]['costumes']:
        costume_id = costume['costume_id']
        if costume_id in votes:
            costume['votes'] += votes[costume_id]
    
    # Mark player as finished voting
    games[room_code]['players'][player_id]["has_finished_voting"] = True
    
    # Check if all players have finished voting
    all_finished = all(
        player_data.get("has_finished_voting", False)
        for player_data in games[room_code]['players'].values()
    )
    
    # If all players have finished, change room status to 'finished'
    if all_finished:
        games[room_code]['status'] = 'finished'
    
    return jsonify({'success': True, 'all_finished': all_finished})

@app.route('/api/upload', methods=['POST'])
def costume_image():
    """
    Upload costume image (receives base64 encoded image)
    ---
    tags:
      - Player Actions
    parameters:
      - in: body
        name: body
        required: true
        schema:
          required:
            - image
          properties:
            image:
              type: string
              description: Base64 encoded image data
    responses:
      200:
        description: Image uploaded successfully
        schema:
          properties:
            status:
              type: string
              example: "success"
    """
    data = request.get_json()
    img_b64 = data['image']  # this is your base64 string from JS

    return {"status": "success"}, img_b64

@app.route('/api/leaderboard/<room_code>', methods=['GET'])
def get_leaderboard(room_code):
    """
    Get final leaderboard sorted by votes (highest first)
    ---
    tags:
      - Game Flow
    parameters:
      - in: path
        name: room_code
        required: true
        schema:
          type: string
        description: 6-digit room code
        example: "123456"
    responses:
      200:
        description: Leaderboard with all players sorted by votes
        schema:
          properties:
            leaderboard:
              type: array
              items:
                type: object
                properties:
                  player_id:
                    type: string
                  player_name:
                    type: string
                  votes:
                    type: integer
                  image_data:
                    type: string
                    description: Base64 encoded costume image
      404:
        description: Room not found
    """
    # Check room exists
    if room_code not in games:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    
    room = games[room_code]
    leaderboard = []
    
    # Build leaderboard with image_data included
    for costume in room['costumes']:
        player_id = costume['player_id']
        player_name = room['players'][player_id]['name']
        image_data = costume.get('image_data', '')
        
        leaderboard.append({
            'player_id': player_id,
            'player_name': player_name,
            'votes': costume['votes'],
            'image_data': image_data
        })
    
    # Sort by votes (highest first)
    leaderboard = sorted(leaderboard, key=lambda x: x['votes'], reverse=True)
    
    return jsonify({'leaderboard': leaderboard})

@app.route('/api/delete_room/<room_code>', methods=['DELETE'])
def delete_room(room_code):
    """
    Delete a room from memory
    ---
    tags:
      - Room Management
    parameters:
      - in: path
        name: room_code
        required: true
        schema:
          type: string
        description: 6-digit room code to delete
        example: "123456"
    responses:
      200:
        description: Room deleted successfully
        schema:
          properties:
            success:
              type: boolean
              example: true
      404:
        description: Room not found
    """
    # Check if room exists
    if room_code not in games:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    
    # Delete the room
    del games[room_code]
    
    return jsonify({'success': True})

if __name__ == '__main__':
    # Run on all interfaces (0.0.0.0) to allow ngrok to connect
    app.run(debug=True, host='0.0.0.0', port=5000)