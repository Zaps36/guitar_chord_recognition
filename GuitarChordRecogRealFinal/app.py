import os
import sys
import time
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import librosa
import numpy as np
import tensorflow as tf
import pickle

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create uploads folder if it doesn't exist
os.makedirs('uploads', exist_ok=True)

# Global variable to store debug logs
debug_logs = []

# Load the model at startup
model = None
label_encoder = None 
def load_model():
    global model, label_encoder
    try:
        print("Loading model: guitar_chord_crnn_tuned_model_random_state.h5")
        model = tf.keras.models.load_model('guitar_chord_crnn_tuned_model_random_state.h5')
        with open("label_encoder_tuned_random_state.pkl", "rb") as f:
            label_encoder = pickle.load(f)
        print("Model and label encoder loaded successfully")
        return True
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        traceback.print_exc()
        return False



def log_debug(message):
    """Add a timestamped debug message to the logs"""
    timestamp = time.strftime("%H:%M:%S", time.localtime())
    log_entry = f"[{timestamp}] {message}"
    print(log_entry)
    debug_logs.append(log_entry)
    return log_entry

@app.route('/check', methods=['GET'])
def check_server():
    """Simple endpoint to check if server is running"""
    global model
    log_debug("Server status check")
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None
    })

@app.route('/logs', methods=['GET'])
def get_logs():
    """Return current debug logs"""
    return jsonify({
        'logs': debug_logs
    })

@app.route('/step5', methods=['POST'])
def step5_real_prediction():
    """Step 5: Make a real prediction using the loaded model"""
    global model
    try:
        log_debug("Step 5: Making real prediction with model")
        
        # Check if model is loaded
        if model is None:
            success = load_model()
            if not success:
                return jsonify({'error': 'Failed to load model'}), 500
        

        if 'file' not in request.files:
            log_debug("Error: No file part in request")
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            log_debug("Error: No selected file")
            return jsonify({'error': 'No selected file'}), 400
        
        log_debug(f"File received: {file.filename}")
        
        # Create a temporary file to save the uploaded audio
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp:
            temp_path = temp.name
            file.save(temp_path)
            log_debug(f"File saved to temporary location: {temp_path}")
        
        try:
            # Import libraries here to isolate any import errors
            
            
            # Load the audio file
            log_debug("Loading audio file...")
            audio, sr = librosa.load(temp_path, sr=22050, duration=2.5, offset=0.5)
            log_debug(f"Audio loaded successfully: {len(audio)} samples, {sr}Hz sample rate")
            
            # Create mel spectrogram
            log_debug("Creating mel spectrogram...")
            mel_spec = librosa.feature.melspectrogram(y=audio, sr=sr, n_mels=128)
            mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
            mel_spec_db = (mel_spec_db - np.mean(mel_spec_db)) / (np.std(mel_spec_db) + 1e-6)
            log_debug(f"Mel spectrogram created: shape {mel_spec_db.shape}")
            
            target_time_frames = 200
            current_frames = mel_spec_db.shape[1]
            if current_frames < target_time_frames:
                pad_width = target_time_frames - current_frames
                mel_spec_db = np.pad(mel_spec_db, ((0, 0), (0, pad_width)), mode='constant')
            else:
                mel_spec_db = mel_spec_db[:, :target_time_frames]

            log_debug(f"Mel spectrogram final shape: {mel_spec_db.shape}")
            
            # Add channel dimension
            mel_spec_input = mel_spec_db[..., np.newaxis]
            log_debug(f"Channel dimension added: shape {mel_spec_db.shape}")
            
            # Add batch dimension
            mel_spec_input = np.expand_dims(mel_spec_input, axis=0)
            log_debug(f"Batch dimension added: shape {mel_spec_input.shape}")
            
            # Make prediction
            log_debug("Making prediction with model...")
            predictions = model.predict(mel_spec_input)
            log_debug(f"Prediction shape: {predictions.shape}")
            
            # Get the chord classes (assuming they're in order of model output)
            # You may need to adjust this based on your model's output format
            predicted_chord = label_encoder.inverse_transform([np.argmax(predictions[0])])[0]
     
            # Get top predictions
            top_indices = np.argsort(predictions[0])[::-1][:3]

# Use label encoder to decode class labels from indices
            top_predictions = [
                {"chord": label_encoder.inverse_transform([idx])[0], "confidence": float(predictions[0][idx])}
                for idx in top_indices
            ]

            # Predicted chord (highest confidence)
            predicted_chord = label_encoder.inverse_transform([top_indices[0]])[0]
            confidence = float(predictions[0][top_indices[0]])
            
            # Clean up the temporary file
            os.unlink(temp_path)
            log_debug("Temporary file deleted")
            
            # Return prediction result
            result = {
                "predicted_chord": predicted_chord,
                "confidence": confidence,
                "top_predictions": top_predictions
            }
            
            log_debug(f"Prediction result: {result}")
            return jsonify(result)
        except Exception as e:
            error_msg = f"Error in processing: {str(e)}"
            log_debug(error_msg)
            log_debug(traceback.format_exc())
            # Clean up the temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            return jsonify({'error': error_msg}), 500
    except Exception as e:
        error_msg = f"Error in step5: {str(e)}"
        log_debug(error_msg)
        log_debug(traceback.format_exc())
        return jsonify({'error': error_msg}), 500

if __name__ == '__main__':
    print("Starting Guitar Chord Predictor Server...")
    print(f"Python version: {sys.version}")
    print(f"Running on: {sys.platform}")
    
    # Try to load the model at startup
    load_model()
    
    app.run(debug=True)
