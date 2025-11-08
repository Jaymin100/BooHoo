import { useState, useEffect } from 'react';

// Finished component - displays leaderboard with top 3 players
function Finished({ roomCode }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch leaderboard from backend
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/leaderboard/${roomCode}`);
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.leaderboard || []);
        } else {
          console.error('Failed to fetch leaderboard');
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (roomCode) {
      fetchLeaderboard();
    }
  }, [roomCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-orange-500 text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  // Get top 3 players
  const top3 = leaderboard.slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];
  const positions = ['1st', '2nd', '3rd'];
  
  // Podium heights for visual effect (1st tallest, 2nd medium, 3rd shortest)
  const podiumHeights = ['h-48', 'h-36', 'h-28'];

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 mb-4">
            🎃 Game Over! 🎃
          </h1>
          <p className="text-orange-400 text-xl">Final Results</p>
        </div>

        {/* Top 3 Podium Display */}
        {top3.length > 0 ? (
          <div className="flex items-end justify-center gap-4 mb-12 flex-wrap">
            {/* Render in order: 2nd, 1st, 3rd for visual podium effect */}
            {/* Only show positions that have players */}
            {top3.length >= 2 && top3[1] && (
              <div
                key={top3[1].player_id}
                className="flex flex-col items-center"
                style={{ flex: top3.length === 3 ? '1' : '0 1 auto', maxWidth: '300px', minWidth: '200px' }}
              >
                {/* Medal */}
                <div className="text-6xl mb-4">🥈</div>
                
                {/* Player Card */}
                <div className="bg-gray-900 rounded-2xl border-2 border-orange-600/30 p-6 w-full shadow-2xl">
                  {/* Player Photo */}
                  <div className="h-36 w-full rounded-xl overflow-hidden mb-4 bg-black flex items-center justify-center">
                    {top3[1].image_data ? (
                      <img
                        src={top3[1].image_data}
                        alt={top3[1].player_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-orange-400/50 text-lg">No Photo</div>
                    )}
                  </div>
                  
                  {/* Player Name */}
                  <h2 className="text-2xl font-bold text-orange-400 text-center mb-2">
                    {top3[1].player_name}
                  </h2>
                  
                  {/* Position */}
                  <p className="text-orange-500/70 text-sm text-center mb-3 uppercase tracking-wide">
                    2nd Place
                  </p>
                  
                  {/* Votes/Likes */}
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 bg-orange-600/20 px-4 py-2 rounded-full">
                      <span className="text-orange-400 text-2xl">❤️</span>
                      <span className="text-orange-300 text-xl font-bold">
                        {top3[1].votes}
                      </span>
                      <span className="text-orange-400/70 text-sm">
                        {top3[1].votes === 1 ? 'like' : 'likes'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 1st Place (Center - Tallest) */}
            {top3[0] && (
              <div
                key={top3[0].player_id}
                className="flex flex-col items-center transform -translate-y-4"
                style={{ flex: top3.length === 3 ? '1' : '0 1 auto', maxWidth: '300px', minWidth: '200px' }}
              >
                {/* Medal */}
                <div className="text-6xl mb-4">🥇</div>
                
                {/* Player Card */}
                <div className="bg-gray-900 rounded-2xl border-2 border-orange-600/30 p-6 w-full shadow-2xl">
                  {/* Player Photo */}
                  <div className="h-48 w-full rounded-xl overflow-hidden mb-4 bg-black flex items-center justify-center">
                    {top3[0].image_data ? (
                      <img
                        src={top3[0].image_data}
                        alt={top3[0].player_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-orange-400/50 text-lg">No Photo</div>
                    )}
                  </div>
                  
                  {/* Player Name */}
                  <h2 className="text-2xl font-bold text-orange-400 text-center mb-2">
                    {top3[0].player_name}
                  </h2>
                  
                  {/* Position */}
                  <p className="text-orange-500/70 text-sm text-center mb-3 uppercase tracking-wide">
                    1st Place
                  </p>
                  
                  {/* Votes/Likes */}
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 bg-orange-600/20 px-4 py-2 rounded-full">
                      <span className="text-orange-400 text-2xl">❤️</span>
                      <span className="text-orange-300 text-xl font-bold">
                        {top3[0].votes}
                      </span>
                      <span className="text-orange-400/70 text-sm">
                        {top3[0].votes === 1 ? 'like' : 'likes'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 3rd Place (Right) */}
            {top3.length >= 3 && top3[2] && (
              <div
                key={top3[2].player_id}
                className="flex flex-col items-center"
                style={{ flex: '1', maxWidth: '300px', minWidth: '200px' }}
              >
                {/* Medal */}
                <div className="text-6xl mb-4">🥉</div>
                
                {/* Player Card */}
                <div className="bg-gray-900 rounded-2xl border-2 border-orange-600/30 p-6 w-full shadow-2xl">
                  {/* Player Photo */}
                  <div className="h-28 w-full rounded-xl overflow-hidden mb-4 bg-black flex items-center justify-center">
                    {top3[2].image_data ? (
                      <img
                        src={top3[2].image_data}
                        alt={top3[2].player_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-orange-400/50 text-lg">No Photo</div>
                    )}
                  </div>
                  
                  {/* Player Name */}
                  <h2 className="text-2xl font-bold text-orange-400 text-center mb-2">
                    {top3[2].player_name}
                  </h2>
                  
                  {/* Position */}
                  <p className="text-orange-500/70 text-sm text-center mb-3 uppercase tracking-wide">
                    3rd Place
                  </p>
                  
                  {/* Votes/Likes */}
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 bg-orange-600/20 px-4 py-2 rounded-full">
                      <span className="text-orange-400 text-2xl">❤️</span>
                      <span className="text-orange-300 text-xl font-bold">
                        {top3[2].votes}
                      </span>
                      <span className="text-orange-400/70 text-sm">
                        {top3[2].votes === 1 ? 'like' : 'likes'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-orange-400 text-xl">No results yet</p>
          </div>
        )}

        {/* Full Leaderboard (if more than 3 players) */}
        {leaderboard.length > 3 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-orange-400 mb-6 text-center">
              Full Leaderboard
            </h2>
            <div className="space-y-3">
              {leaderboard.slice(3).map((player, index) => (
                <div
                  key={player.player_id}
                  className="bg-gray-900 rounded-lg border-2 border-orange-600/20 p-4 flex items-center justify-between hover:border-orange-500/50 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-orange-400 font-bold text-lg w-8">
                      #{index + 4}
                    </div>
                    {player.image_data && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-black flex-shrink-0">
                        <img
                          src={player.image_data}
                          alt={player.player_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-orange-300 font-semibold text-lg">
                        {player.player_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-400">❤️</span>
                    <span className="text-orange-300 font-bold text-lg">
                      {player.votes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Finished;

