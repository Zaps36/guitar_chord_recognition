# Guitar Chord Predictor

A web application that predicts guitar chords from audio files using a TensorFlow model.

## Setup Instructions

### 1. Backend Setup

1. Install Python dependencies:
\`\`\`
pip install flask flask-cors tensorflow librosa numpy opencv-python
\`\`\`

2. Place your `chord_classifier_model.h5` file in the root directory

3. Start the Flask server:
\`\`\`
python app.py
\`\`\`

### 2. Frontend Setup

1. Install Node.js dependencies:
\`\`\`
npm install
\`\`\`

2. Start the development server:
\`\`\`
npm run dev
\`\`\`

## How to Use

1. Open the application in your browser (typically at http://localhost:3000)
2. Upload a WAV file of a guitar chord
3. Click "Predict Chord" to process the audio
4. View the prediction results
5. Check your prediction history in the History tab

## Important Notes

- Make sure your `chord_classifier_model.h5` file is in the same directory as `app.py`
- The backend server must be running on port 5000 for the frontend to connect to it
- Only WAV files are supported for prediction
