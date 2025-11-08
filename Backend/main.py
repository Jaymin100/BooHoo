import random as rd

        
class roomOBJ:
    def __init__(self, status, costume_queue, player_id='', room_id=''):
        self.room_id = room_id
        self.player_id = player_id
        self.status = status
        self.costume_queue = costume_queue
          
    def room_id(self):
        if self.player_id == 0:
            for i in range(6):
                random_str = str(rd.randint(0, 9))
                self.room_id += random_str
                
class playerOBJ:
    def __init__(self, player_id, room_id, name, score=0, connected=False):
        self.player_id = player_id
        self.room_id = room_id
        self.name = name
        self.score = score
        self.connected = connected
       
class costumeOBJ:
    def __init__(self, costume_id, image_url):
        self.costume_id = costume_id
        self.image_url = image_url
    
class leaderboardOBJ:
    def __init__(self, vote_amt, player_id, name):
        self.vote_amt = vote_amt
        self.player_id = player_id
        self.name = name