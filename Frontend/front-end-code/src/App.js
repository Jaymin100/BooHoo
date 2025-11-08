// Step 1: Import React Router components
// Routes - container for all route definitions
// Route - defines a single route (URL path -> component to show)
import { Routes, Route } from 'react-router-dom';

// Step 2: Import your page components
import Home from './pages/Home';
import Room from './pages/Room';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';

// Step 3: App component now acts as the router container
// It defines which component to show based on the URL path
function App() {
  return (
    // Step 4: Routes component contains all your route definitions
    <Routes>
      {/* Step 5: Route for home page - url.com/ or url.com */}
      {/* path="/" means this is the home/root URL */}
      {/* element={<Home />} means show the Home component when on this path */}
      <Route path="/" element={<Home />} />
      
      {/* Step 6: Route for room page - url.com/room */}
      {/* path="/room" means this URL shows the Room component */}
      <Route path="/room" element={<Room />} />
      <Route path="/create-room" element={<CreateRoom />} />
      <Route path="/join-room" element={<JoinRoom />} />
    </Routes>
  );
}

export default App;
