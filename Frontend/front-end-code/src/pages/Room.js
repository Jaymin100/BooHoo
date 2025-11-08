import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Waiting from '../RoomComp/Waiting';
import Playing from '../RoomComp/Playing';

// Room page component - displays different components based on room status
function Room() {
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const playerId = searchParams.get('player_id') || '';
  const [roomStatus, setRoomStatus] = useState('waiting'); // Default to 'waiting'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch room status from backend
  useEffect(() => {
    if (!roomCode) {
      navigate('/');
      return;
    }

    // Fetch room data to get status
    const fetchRoomStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/room/${roomCode}`);
        if (response.ok) {
          const data = await response.json();
          setRoomStatus(data.status || 'waiting');
        } else {
          // If room not found, default to waiting
          setRoomStatus('waiting');
        }
      } catch (error) {
        console.error('Error fetching room status:', error);
        // Default to waiting on error
        setRoomStatus('waiting');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomStatus();

    // Optionally: Set up polling to check status every few seconds
    // const interval = setInterval(fetchRoomStatus, 3000);
    // return () => clearInterval(interval);
  }, [roomCode, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-orange-500 text-xl">Loading...</div>
      </div>
    );
  }

  // Render component based on room status
  // Default to Waiting component if status is 'waiting' or unknown
  if (roomStatus === 'waiting') {
    return <Waiting roomCode={roomCode} />;
  }

  // Show Playing component when status is 'playing'
  if (roomStatus === 'playing') {
    return <Playing roomCode={roomCode} playerId={playerId} />;
  }

  // Placeholder for other statuses (will be implemented later)
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-orange-500 text-xl">
        Status: {roomStatus} (Component coming soon)
      </div>
    </div>
  );
}

export default Room;

