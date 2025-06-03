import base64
import cv2
import numpy as np
import matplotlib.pyplot as plt
from keras.preprocessing.image import img_to_array
from keras.models import load_model
from model.Meso4 import meso
# Load Meso4 (already initialized as `meso` in your session)

# Load Haar cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

def check_video(video_path):
    # Load video
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise Exception("Error opening video file")

    frame_interval = 10
    predictions = []
    frame_count = 0
    extracted_frames = []
    detected_faces = []
    max_frames_to_collect = 8  # We only need first 8 frames and faces

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_interval == 0:
            # Save original frame (for display only, not for model)
            if len(extracted_frames) < max_frames_to_collect:
                # Keep original frame size but encode as JPEG to reduce size
                _, buffer = cv2.imencode('.jpg', frame)
                # Convert to base64 string for JSON serialization
                extracted_frames.append(base64.b64encode(buffer).decode('utf-8'))

            # Face detection
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

            if len(faces) > 0 and len(detected_faces) < max_frames_to_collect:
                (x, y, w, h) = faces[0]
                face_img = frame[y:y+h, x:x+w]
                
                # Save detected face (original size before model resize)
                _, face_buffer = cv2.imencode('.jpg', face_img)
                # Convert to base64 string for JSON serialization
                detected_faces.append(base64.b64encode(face_buffer).decode('utf-8'))

                # Prepare face for model (resize to 256x256)
                face_resized = cv2.resize(face_img, (256, 256))
                face_rgb = cv2.cvtColor(face_resized, cv2.COLOR_BGR2RGB)
                img_array = img_to_array(face_rgb) / 255.0
                img_array = np.expand_dims(img_array, axis=0)
                pred = meso.predict(img_array)[0][0]
                predictions.append(pred)

        frame_count += 1

        # Early exit if we've collected enough frames and faces
        if (len(extracted_frames) >= max_frames_to_collect and 
            len(detected_faces) >= max_frames_to_collect and
            len(predictions) >= max_frames_to_collect):
            break

    cap.release()

    avg_prediction = np.mean(predictions) if predictions else 0.5
    label = "Real" if round(avg_prediction) == 1 else "Fake"

    print(f"the avg prediction:${avg_prediction},label:${label}")

    return {
        "result": label,
        "confidence": float(avg_prediction),
        "extracted_frames": extracted_frames[:8],  # Ensure only first 8
        "detected_faces": detected_faces[:8]       # Ensure only first 8
    }