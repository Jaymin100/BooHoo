import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Join Room page component - allows user to upload photo and enter name to join a room
function JoinRoom() {
  // Step 1: Get room code from URL query parameters
  // useSearchParams allows us to read URL parameters like ?code=123456
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('code') || '';

  // Step 2: useNavigate hook to navigate to different pages
  const navigate = useNavigate();

  // Step 3: State for form data
  const [playerName, setPlayerName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [fileSize, setFileSize] = useState(null);

  // Step 4: Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Step 5: Handle file selection for photo upload with size validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Maximum file size: 20 MB (20 * 1024 * 1024 bytes)
      const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB in bytes
      
      // Check if file is too large
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`File size (${formatFileSize(file.size)}) exceeds the 20 MB limit. Please choose a smaller image.`);
        setSelectedFile(null);
        setPreviewUrl(null);
        setFileSize(null);
        // Reset the file input
        e.target.value = '';
        return;
      }

      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setFileError('Please select an image file.');
        setSelectedFile(null);
        setPreviewUrl(null);
        setFileSize(null);
        e.target.value = '';
        return;
      }

      // File is valid - clear any previous errors
      setFileError(null);
      setSelectedFile(file);
      setFileSize(file.size);

      // Create preview URL and convert to base64 for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result contains the base64 encoded image
        setPreviewUrl(reader.result);
      };
      reader.onerror = () => {
        setFileError('Error reading file. Please try again.');
        setSelectedFile(null);
        setPreviewUrl(null);
        setFileSize(null);
      };
      // readAsDataURL converts the file to base64
      reader.readAsDataURL(file);
    }
  };

  // Step 5: Handle form submission - send POST request to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that name is provided
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    // Validate that room code exists
    if (!roomCode) {
      alert('Room code is missing');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 6: Prepare data to send to backend
      // Image is already converted to base64 in previewUrl (from handleFileChange)
      // previewUrl contains the base64 string like "data:image/jpeg;base64,/9j/4AAQ..."
      let imageData = null;
      if (selectedFile && previewUrl) {
        // previewUrl already contains the base64 encoded image
        // It's in the format: "data:image/jpeg;base64,<base64_string>"
        imageData = previewUrl;
        
        // Verify the image data is not too large (base64 is ~33% larger than original)
        // 20 MB file becomes ~26.7 MB in base64, but we'll use the previewUrl directly
        console.log('Image converted to base64, size:', formatFileSize(imageData.length));
      }

      // Step 7: Prepare JSON payload
      const payload = {
        room_code: roomCode,
        player_name: playerName,
      };

      // Add image data if available (backend can use this later)
      // imageData is already in base64 format from previewUrl
      if (imageData) {
        payload.image_data = imageData;
      }

      // Step 8: Send POST request to backend
      const response = await fetch('http://localhost:5000/api/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Step 9: Check if user is the host and navigate accordingly
        const playerId = data.player_id;
        const isHost = data.is_host || false;
        console.log(isHost);
        if (isHost) {
          // User is the host - navigate to CreateRoom page
          navigate(`/create-room?code=${roomCode}&player_id=${playerId}`);
        } else {
          // User is not the host - navigate to Room page (Waiting component)
          navigate(`/room?code=${roomCode}&player_id=${playerId}`);
        }
      } else {
        alert('Error: ' + (data.error || 'Failed to join room'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to join room. Please check if the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Main container with spooky glow effect - matching Home.js style */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl border-2 border-orange-600/30 p-8 space-y-8">
          
          {/* Title with Halloween styling */}
          <div className="text-center">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 mb-2 drop-shadow-[0_0_10px_rgba(255,107,53,0.5)]">
              Join Room
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto"></div>
            {roomCode && (
              <p className="text-orange-400 mt-4 text-sm font-semibold">
                Room Code: <span className="text-orange-300">{roomCode}</span>
              </p>
            )}
          </div>

          {/* Join Room Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* File Upload Section - styled for vertical phone photos */}
            <div>
              <label 
                htmlFor="photoUpload" 
                className="block text-sm font-semibold text-orange-400 mb-2 uppercase tracking-wide"
              >
                Upload Your Costume Photo
                <span className="text-xs text-orange-600/70 ml-2 font-normal normal-case">(Max 20 MB)</span>
              </label>
              
              {/* File input with custom styling */}
              <div className="relative">
                <input
                  id="photoUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="photoUpload"
                  className={`flex flex-col items-center justify-center w-full h-64 bg-black border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                    fileError 
                      ? 'border-red-500/50 hover:border-red-500' 
                      : 'border-orange-600/50 hover:border-orange-500 hover:bg-orange-600/5'
                  }`}
                >
                  {previewUrl ? (
                    // Show preview if image is selected
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-48 object-contain rounded-lg mb-2"
                      />
                      {fileSize && (
                        <p className="text-xs text-orange-400 mt-2">
                          Size: {formatFileSize(fileSize)}
                        </p>
                      )}
                    </div>
                  ) : (
                    // Show upload prompt if no image selected
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                      <svg
                        className="w-12 h-12 mb-4 text-orange-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-orange-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-orange-600/70">
                        Vertical photos work best (PNG, JPG, GIF)
                      </p>
                      <p className="text-xs text-orange-600/50 mt-1">
                        Maximum file size: 20 MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
              
              {/* File size error message */}
              {fileError && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {fileError}
                </p>
              )}
              
              {/* File size info when file is selected */}
              {selectedFile && !fileError && fileSize && (
                <p className="mt-2 text-xs text-orange-500">
                  ✓ File selected: {selectedFile.name} ({formatFileSize(fileSize)}) - Ready to upload as base64
                </p>
              )}
            </div>

            {/* Name Input Section */}
            <div>
              <label 
                htmlFor="playerName" 
                className="block text-sm font-semibold text-orange-400 mb-2 uppercase tracking-wide"
              >
                Your Name
              </label>
              <input 
                id="playerName" 
                type="text" 
                name="playerName" 
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black border-2 border-orange-600/50 rounded-lg text-orange-100 placeholder-orange-900/50 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all duration-200"
              />
            </div>

            {/* Join Button */}
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded-lg shadow-lg shadow-orange-600/50 hover:shadow-orange-500/70 transition-all duration-200 transform hover:scale-105 active:scale-95 uppercase tracking-wide"
            >
              {isSubmitting ? 'Joining...' : 'Join Room'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default JoinRoom;

