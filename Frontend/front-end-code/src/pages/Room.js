import { useNavigate } from 'react-router-dom';

// Room page component - this displays when user goes to url.com/room
function Room() {
  // useNavigate hook to navigate back to home page
  const navigate = useNavigate();

  // Handler function to go back to home page
  const handleGoHome = () => {
    // Navigate back to the home page (url.com/)
    navigate('/');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Room Page</h1>
        <p>Welcome to the room!</p>
        {/* Button to navigate back to home page */}
        <button onClick={handleGoHome}>Go Back Home</button>
      </header>
    </div>
  );
}

export default Room;

