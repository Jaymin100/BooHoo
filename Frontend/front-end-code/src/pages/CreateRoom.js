import { useNavigate } from 'react-router-dom';

// Room page component - this displays when user goes to url.com/room
function CreateRoom() {
  // useNavigate hook to navigate back to home page
  const navigate = useNavigate();



  return (
    <div className="App">
      <header className="App-header">
        <h1>Create Room Page</h1>
        <p>Create a new room</p>
        </header>
    </div>
  );
}

export default CreateRoom;

