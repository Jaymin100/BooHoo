# Boo-Hoo

A Halloween costume voting game - Tinder/Kahoot style game for rating costumes.

## Setup

### Backend

1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask server:
   ```bash
   python app.py
   ```

   The backend will run on `http://localhost:5000`

### Frontend

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend/front-end-code
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`

## Configuration

- Update the API URL in `Frontend/front-end-code/src/config/api.js` if using a different backend URL (e.g., ngrok)
- For production, set the `REACT_APP_API_URL` environment variable
