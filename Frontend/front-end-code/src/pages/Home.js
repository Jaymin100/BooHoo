import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Home page component - this is your main landing page (url.com/)
function Home() {
  // Step 1: Create state to store the room code input value
  const [roomCode, setRoomCode] = useState('');

  // Step 2: useNavigate hook allows us to navigate to different pages
  // This is React Router's way of programmatically changing the URL
  const navigate = useNavigate();

  // Step 3: Handler function for "Join Room" form submission
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ RoomCode: roomCode }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Step 4: Navigate to /room page after successful join
        // navigate('/room') changes the URL to url.com/room
        navigate(`/room?code=${roomCode}`);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to join room. Please check if the backend is running.');
    }
  };

  // Step 5: Handler function for "Create Room" form submission
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      const data = await response.json();
      
      if (response.ok) {

        const roomCode = data.code;
        // Step 6: Navigate to /room page after successful room creation
        navigate(`/room?code=${roomCode}`);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create room. Please check if the backend is running.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Main container with spooky glow effect */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl border-2 border-orange-600/30 p-8 space-y-8">
          
          {/* Title with Halloween styling */}
          <div className="text-center">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 mb-2 drop-shadow-[0_0_10px_rgba(255,107,53,0.5)]">
              Boo-Hoo
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto"></div>
          </div>

          {/* Join Room Form */}
          <form onSubmit={handleJoinRoom} className="space-y-6">
            <div>
              <label 
                htmlFor="RoomCode" 
                className="block text-sm font-semibold text-orange-400 mb-2 uppercase tracking-wide"
              >
                Room Code
              </label>
              <input 
                id="RoomCode" 
                type="text" 
                name="RoomCode" 
                placeholder="Enter Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full px-4 py-3 bg-black border-2 border-orange-600/50 rounded-lg text-orange-100 placeholder-orange-900/50 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all duration-200"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-black font-bold py-3 px-6 rounded-lg shadow-lg shadow-orange-600/50 hover:shadow-orange-500/70 transition-all duration-200 transform hover:scale-105 active:scale-95 uppercase tracking-wide"
            >
              Join Room
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-orange-600/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-orange-500 font-semibold">OR</span>
            </div>
          </div>

          {/* Create Room Button */}
          <form onSubmit={handleCreateRoom}>
            <button 
              type="submit"
              className="w-full bg-transparent border-2 border-orange-600 hover:bg-orange-600/10 text-orange-500 hover:text-orange-400 font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 uppercase tracking-wide shadow-lg shadow-orange-600/20 hover:shadow-orange-500/40"
            >
              Create Room
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default Home;

