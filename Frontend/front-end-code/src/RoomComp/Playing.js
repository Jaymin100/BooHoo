import { useState, useEffect, useRef, useCallback } from 'react';
import API_BASE_URL from '../config/api';

// Playing component - allows users to swipe through costumes and vote
function Playing({ roomCode, playerId }) {
  const [costumes, setCostumes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Touch/swipe tracking for Tinder-like card motion
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const cardRef = useRef(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0, rotate: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const cardPositionRef = useRef({ x: 0, y: 0, rotate: 0 }); // Ref to track current position

  // Fetch costumes from backend
  useEffect(() => {
    const fetchCostumes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/costumes/${roomCode}`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        if (response.ok) {
          const data = await response.json();
          // Filter out the current player's costume
          const otherCostumes = data.costumes.filter(
            costume => costume.player_id !== playerId
          );
          setCostumes(otherCostumes);
        }
      } catch (error) {
        console.error('Error fetching costumes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (roomCode && playerId) {
      fetchCostumes();
    }
  }, [roomCode, playerId]);

  // Handle swipe left (no vote / skip)
  const handleSwipeLeft = useCallback(() => {
    if (currentIndex < costumes.length) {
      const currentCostume = costumes[currentIndex];
      // Set vote to 0 for this costume
      setVotes(prev => ({
        ...prev,
        [currentCostume.costume_id]: 0
      }));
      // Animate card off screen left, then move to next costume
      const exitPosition = { x: -500, y: 100, rotate: -30 };
      setCardPosition(exitPosition);
      cardPositionRef.current = exitPosition;
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300);
    }
  }, [currentIndex, costumes]);

  // Handle swipe right (vote / like)
  const handleSwipeRight = useCallback(() => {
    if (currentIndex < costumes.length) {
      const currentCostume = costumes[currentIndex];
      // Set vote to 1 for this costume
      setVotes(prev => ({
        ...prev,
        [currentCostume.costume_id]: 1
      }));
      // Animate card off screen right, then move to next costume
      const exitPosition = { x: 500, y: 100, rotate: 30 };
      setCardPosition(exitPosition);
      cardPositionRef.current = exitPosition;
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300);
    }
  }, [currentIndex, costumes]);

  // Mouse event handlers for desktop drag
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
  };

  // Update ref when card position changes
  useEffect(() => {
    cardPositionRef.current = cardPosition;
  }, [cardPosition]);

  // Global mouse move handler (attached to document)
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - touchStartX.current;
      const deltaY = e.clientY - touchStartY.current;
      const rotate = deltaX * 0.1; // Rotation based on horizontal drag
      
      const newPosition = {
        x: deltaX,
        y: deltaY * 0.3, // Less vertical movement
        rotate: rotate
      };
      
      setCardPosition(newPosition);
      cardPositionRef.current = newPosition;
    };

    const handleGlobalMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      
      const currentX = cardPositionRef.current.x;
      const threshold = 100; // Minimum swipe distance
      
      if (Math.abs(currentX) > threshold) {
        if (currentX > 0) {
          // Swiped right - vote
          handleSwipeRight();
        } else {
          // Swiped left - skip
          handleSwipeLeft();
        }
      } else {
        // Snap back to center with smooth animation
        setCardPosition({ x: 0, y: 0, rotate: 0 });
        cardPositionRef.current = { x: 0, y: 0, rotate: 0 };
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, handleSwipeLeft, handleSwipeRight]);

  // Touch event handlers for mobile swipe gestures
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent scrolling while swiping
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX.current;
    const deltaY = touchY - touchStartY.current;
    const rotate = deltaX * 0.1;
    
    const newPosition = {
      x: deltaX,
      y: deltaY * 0.3,
      rotate: rotate
    };
    
    setCardPosition(newPosition);
    cardPositionRef.current = newPosition;
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    const currentX = cardPositionRef.current.x;
    const threshold = 100; // Minimum swipe distance

    if (Math.abs(currentX) > threshold) {
      if (currentX > 0) {
        // Swiped right - vote
        handleSwipeRight();
      } else {
        // Swiped left - skip
        handleSwipeLeft();
      }
    } else {
      // Snap back to center
      setCardPosition({ x: 0, y: 0, rotate: 0 });
      cardPositionRef.current = { x: 0, y: 0, rotate: 0 };
    }
  };

  // Reset card position when moving to next costume
  useEffect(() => {
    setCardPosition({ x: 0, y: 0, rotate: 0 });
    cardPositionRef.current = { x: 0, y: 0, rotate: 0 };
  }, [currentIndex]);

  // Note: Room component polls for status updates, so when status changes to 'finished',
  // it will automatically show the Finished component. No need to poll here.

  // Submit votes to backend
  const submitVotes = useCallback(async () => {
    setSubmitting(true);
    try {
      // Ensure all costumes have votes (default to 0 if not voted)
      const allVotes = {};
      costumes.forEach(costume => {
        allVotes[costume.costume_id] = votes[costume.costume_id] ?? 0;
      });

      const response = await fetch(`${API_BASE_URL}/api/submit_votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          room_code: roomCode,
          player_id: playerId,
          votes: allVotes
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
      } else {
        const errorData = await response.json();
        alert('Failed to submit votes: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting votes:', error);
      alert('Failed to submit votes. Please check if the backend is running.');
    } finally {
      setSubmitting(false);
    }
  }, [roomCode, playerId, costumes, votes]);

  // Submit votes when all costumes are viewed
  useEffect(() => {
    if (currentIndex >= costumes.length && costumes.length > 0 && !submitting && !submitSuccess) {
      // Wait a moment to ensure votes state is updated, then submit
      const timer = setTimeout(() => {
        submitVotes();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, costumes.length, submitting, submitSuccess, submitVotes]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-orange-500 text-xl">Loading costumes...</div>
      </div>
    );
  }

  // No costumes to vote on
  if (costumes.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-orange-500 text-xl">No costumes to vote on yet!</p>
        </div>
      </div>
    );
  }

  // All costumes viewed - show success message
  if (submitSuccess || currentIndex >= costumes.length) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600">
            Votes Submitted! 🎃
          </h1>
          <p className="text-orange-400 text-lg">
            Waiting for other players to finish voting...
          </p>
        </div>
      </div>
    );
  }

  // Display current costume
  const currentCostume = costumes[currentIndex];
  const progress = ((currentIndex + 1) / costumes.length) * 100;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-8">
      {/* Progress bar */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between text-sm text-orange-400 mb-2">
          <span>Costume {currentIndex + 1} of {costumes.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-600 to-orange-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Swipeable costume card - Tinder style */}
      <div className="w-full max-w-md flex-1 flex items-center justify-center relative">
        {/* Stack of cards effect - next card in background */}
        {currentIndex + 1 < costumes.length && (
          <div className="absolute w-full max-w-sm bg-gray-900 rounded-2xl shadow-xl border-2 border-orange-600/20 overflow-hidden opacity-50 scale-95 -z-10">
            <div className="w-full aspect-[3/4] bg-black flex items-center justify-center">
              <div className="text-orange-400/50">Next</div>
            </div>
          </div>
        )}
        
        {/* Main swipable card */}
        <div
          ref={cardRef}
          className="w-full max-w-sm bg-gray-900 rounded-2xl shadow-2xl border-2 border-orange-600/30 overflow-hidden cursor-grab active:cursor-grabbing relative select-none"
          style={{
            transform: `translate(${cardPosition.x}px, ${cardPosition.y}px) rotate(${cardPosition.rotate}deg)`,
            opacity: isDragging ? Math.max(0.3, 1 - Math.abs(cardPosition.x) / 400) : 1,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
            zIndex: 10,
            willChange: isDragging ? 'transform' : 'auto'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onDragStart={(e) => e.preventDefault()} // Prevent image drag
        >
          {/* Swipe indicators */}
          {isDragging && (
            <>
              {/* Left swipe indicator (skip) */}
              {cardPosition.x < -50 && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-2xl z-20 pointer-events-none">
                  <div className="text-red-500 text-4xl font-bold transform -rotate-12">
                    NOPE
                  </div>
                </div>
              )}
              
              {/* Right swipe indicator (like/vote) */}
              {cardPosition.x > 50 && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-2xl z-20 pointer-events-none">
                  <div className="text-green-500 text-4xl font-bold transform rotate-12">
                    LIKE
                  </div>
                </div>
              )}
            </>
          )}
          {/* Costume Image */}
          <div className="w-full aspect-[3/4] bg-black flex items-center justify-center relative">
            {currentCostume.image_data ? (
              <img
                src={currentCostume.image_data}
                alt={`Costume by ${currentCostume.player_name}`}
                className="w-full h-full object-contain pointer-events-none"
                draggable="false"
              />
            ) : (
              <div className="text-orange-400">No image available</div>
            )}
          </div>

          {/* Player Name */}
          <div className="p-6 bg-gray-900">
            <h2 className="text-2xl font-bold text-orange-400 text-center">
              {currentCostume.player_name || 'Unknown Player'}
            </h2>
          </div>
        </div>
      </div>

      {/* Swipe Instructions and Action Buttons */}
      <div className="mt-8 text-center space-y-4">
        <p className="text-orange-400/70 text-sm">
          Drag left to skip • Drag right to vote
        </p>
        
        {/* Action buttons (for desktop/click) - Tinder style */}
        <div className="flex justify-center space-x-8">
          <button
            onClick={() => {
              // Animate card left with rotation for Tinder effect
              const pos = { x: -150, y: 0, rotate: -25 };
              setCardPosition(pos);
              cardPositionRef.current = pos;
              setTimeout(() => handleSwipeLeft(), 150);
            }}
            className="w-20 h-20 bg-gray-800 hover:bg-gray-700 text-red-400 font-bold rounded-full border-4 border-red-500/70 transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-xl shadow-red-500/30 flex items-center justify-center text-3xl"
          >
            ✕
          </button>
          <button
            onClick={() => {
              // Animate card right with rotation for Tinder effect
              const pos = { x: 150, y: 0, rotate: 25 };
              setCardPosition(pos);
              cardPositionRef.current = pos;
              setTimeout(() => handleSwipeRight(), 150);
            }}
            className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold rounded-full shadow-xl shadow-green-500/50 transition-all duration-200 transform hover:scale-110 active:scale-95 flex items-center justify-center text-3xl"
          >
            ♥
          </button>
        </div>
      </div>
    </div>
  );
}

export default Playing;
