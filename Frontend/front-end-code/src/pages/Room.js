import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Waiting from '../RoomComp/Waiting';
import Playing from '../RoomComp/Playing';
import Finished from '../RoomComp/Finished';
import API_BASE_URL from '../config/api';

// Room page component - displays different components based on room status
function Room() {
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const playerId = searchParams.get('player_id') || '';
  const [roomStatus, setRoomStatus] = useState('waiting'); // Default to 'waiting'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isFinishedRef = useRef(false); // Track if we've reached finished state
  const roomStatusRef = useRef('waiting'); // Track current status in ref

  // Keep ref in sync with state
  useEffect(() => {
    roomStatusRef.current = roomStatus;
    if (roomStatus === 'finished') {
      isFinishedRef.current = true;
    }
  }, [roomStatus]);

  // Fetch room status from backend
  useEffect(() => {
    if (!roomCode) {
      navigate('/');
      return;
    }

    // Reset finished ref when room code changes
    isFinishedRef.current = false;

    // Fetch room data to get status
    const fetchRoomStatus = async () => {
      // Don't poll if we're already in finished state
      if (isFinishedRef.current) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/room/${roomCode}`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        if (response.ok) {
          const data = await response.json();
          const newStatus = data.status || 'waiting';
          setRoomStatus(newStatus);
          
          // If status is finished, mark it and stop polling
          if (newStatus === 'finished') {
            isFinishedRef.current = true;
          }
        } else {
          // If room not found and we're already in finished state, keep it
          // (room is deleted after leaderboard is fetched)
          if (isFinishedRef.current || roomStatusRef.current === 'finished') {
            // Keep finished status - room was deleted after leaderboard was fetched
            setRoomStatus('finished');
            isFinishedRef.current = true;
            return;
          }
          // Otherwise, default to waiting (room doesn't exist yet or was deleted)
          setRoomStatus('waiting');
        }
      } catch (error) {
        console.error('Error fetching room status:', error);
        // If we're already finished, don't change status on error
        if (isFinishedRef.current || roomStatusRef.current === 'finished') {
          setRoomStatus('finished');
          isFinishedRef.current = true;
          return;
        }
        // Default to waiting on error
        setRoomStatus('waiting');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomStatus();

    // Poll for status updates when game is playing or waiting
    // Stop polling once the game is finished (room will be deleted after leaderboard fetch)
    // This allows automatic transition to 'finished' status when all players vote
    const interval = setInterval(() => {
      // Only poll if we haven't reached finished state
      if (!isFinishedRef.current) {
        fetchRoomStatus();
      }
    }, 2000);
    
    return () => clearInterval(interval);
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

  // Show Finished component when status is 'finished'
  if (roomStatus === 'finished') {
    return <Finished roomCode={roomCode} />;
  }

  // Placeholder for other statuses
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-orange-500 text-xl">
        Status: {roomStatus} (Component coming soon)
      </div>
    </div>
  );
}

export default Room;

