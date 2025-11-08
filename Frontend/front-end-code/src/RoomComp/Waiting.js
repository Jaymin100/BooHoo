// Waiting component - shown when room status is 'waiting'
function Waiting({ roomCode }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        
        {/* Room Code Display */}
        <div className="mb-8">
          <h2 className="text-orange-400 text-sm font-semibold uppercase tracking-wider mb-2">
            Room Code
          </h2>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600">
            {roomCode}
          </p>
        </div>

        {/* Animated Ghost - Simple Design */}
        <div className="flex justify-center items-center py-12">
          <div className="relative animate-float">
            {/* Simple ghost body */}
            <div className="relative w-48 h-56">
              {/* Main ghost shape */}
              <div className="w-full h-full bg-white rounded-t-full shadow-lg relative overflow-hidden">
                {/* Ghost eyes - longer and scarier */}
                <div className="absolute top-14 left-8 w-6 h-14 bg-black rounded-full animate-blink"></div>
                <div className="absolute top-14 right-8 w-6 h-14 bg-black rounded-full animate-blink" style={{ animationDelay: '0.1s' }}></div>
                
                {/* Ghost mouth - scary wide smile */}
                <div className="absolute top-32 left-1/2 transform -translate-x-1/2">
                  <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
                    <path
                      d="M5 15 Q15 8 30 15 Q45 22 55 15"
                      stroke="black"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </div>
                
                {/* Simple wavy bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden">
                  <svg width="100%" height="100%" viewBox="0 0 200 50" preserveAspectRatio="none">
                    <path
                      d="M0,30 Q50,15 100,30 T200,30 L200,50 L0,50 Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Waiting Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600">
            Waiting for Players...
          </h1>
          <p className="text-orange-400/80 text-lg">
            Share the room code with your friends to join!
          </p>
          
          {/* Loading dots animation */}
          <div className="flex justify-center space-x-2 pt-4">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Waiting;

