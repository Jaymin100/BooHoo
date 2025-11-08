// API Configuration
// Uses environment variable if available, otherwise falls back to default ngrok URL
// To change in Vercel: Project Settings → Environment Variables → Add REACT_APP_API_URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://heliographical-autonomous-kenyetta.ngrok-free.dev';

export default API_BASE_URL;

