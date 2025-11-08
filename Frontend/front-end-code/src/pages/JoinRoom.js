import { useNavigate } from 'react-router-dom';

// Room page component - this displays when user goes to url.com/room
function JoinRoom() {
  // useNavigate hook to navigate back to home page
  const navigate = useNavigate();

  // Handler function to go back to home page

  return (
    <div className="App">
      <header className="App-header">
       <h1> Join Room Page </h1>
       </header>
    </div>
  );
}

export default JoinRoom;

