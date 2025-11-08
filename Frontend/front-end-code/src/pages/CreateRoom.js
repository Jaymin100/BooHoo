import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API_BASE_URL from '../config/api';

// CreateRoom page - shows player list and start button for room host
function CreateRoom() {
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const playerId = searchParams.get('player_id') || '';
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const navigate = useNavigate();

  // Fetch room data and players
  useEffect(() => {
    if (!roomCode) {
      navigate('/');
      return;
    }

    const fetchRoomData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/room/${roomCode}`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPlayers(data.players || []);
        } else {
          console.error('Failed to fetch room data');
        }
      } catch (error) {
        console.error('Error fetching room data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();

    // Poll for updates every 2 seconds to see new players joining
    const interval = setInterval(fetchRoomData, 2000);
    return () => clearInterval(interval);
  }, [roomCode, navigate]);

  // Handle start game
  const handleStartGame = async () => {
    if (players.length <= 2) {
      alert('You need more than 2 players to start the game!');
      return;
    }

    setStarting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/start_game/${roomCode}`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.ok) {
        // Navigate to room page which will show the Playing component
        navigate(`/room?code=${roomCode}&player_id=${playerId}`);
      } else {
        const errorData = await response.json();
        alert('Failed to start game: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please check if the backend is running.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-orange-500 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Main container */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl border-2 border-orange-600/30 p-8 space-y-8">
          
          {/* Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 mb-2">
              Room Lobby
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto mb-4"></div>
            <p className="text-orange-400 text-sm font-semibold">
              Room Code: <span className="text-orange-300 text-lg">{roomCode}</span>
            </p>
            <p className="text-orange-400/70 text-xs mt-2">
              {players.length} {players.length === 1 ? 'player' : 'players'} in lobby
            </p>
          </div>

          {/* Players List */}
          <div className="space-y-4">
            <h2 className="text-orange-400 text-sm font-semibold uppercase tracking-wide">
              Players
            </h2>
            
            {players.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-orange-400/70">Waiting for players to join...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {players.map((player, index) => (
                  <div
                    key={player.player_id}
                    className="bg-black border-2 border-orange-600/30 rounded-lg p-4 flex items-center justify-between hover:border-orange-500/50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Player number/icon */}
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-500 rounded-full flex items-center justify-center text-black font-bold shadow-lg">
                        {index + 1}
                      </div>
                      {/* Player name */}
                      <div>
                        <p className="text-orange-100 font-semibold">{player.name}</p>
                        {player.costume_uploaded && (
                          <p className="text-orange-500/70 text-xs">✓ Costume ready</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Start Game Button - Only show if more than 3 players */}
          {players.length > 3 && (
            <div className="pt-4">
              <button
                onClick={handleStartGame}
                disabled={starting}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-lg shadow-lg shadow-orange-600/50 hover:shadow-orange-500/70 transition-all duration-200 transform hover:scale-105 active:scale-95 uppercase tracking-wide text-lg"
              >
                {starting ? 'Starting Game...' : 'Start Game 🎃'}
              </button>
            </div>
          )}

          {/* Waiting message if not enough players */}
          {players.length <= 3 && (
            <div className="text-center pt-4">
              <p className="text-orange-400/70 text-sm">
                Need more than 3 players to start
              </p>
              <p className="text-orange-500/50 text-xs mt-1">
                {4 - players.length} more {4 - players.length === 1 ? 'player' : 'players'} needed
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default CreateRoom;

