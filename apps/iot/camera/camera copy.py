# Copyright 2023 The MediaPipe Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# References: 
# https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/object_detection/raspberry_pi
# https://github.com/raspberrypi/picamera2/blob/main/examples/mjpeg_server.py

import io
import logging
import socketserver
from http import server
from threading import Condition, Thread
import time
import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from utils import visualize
import os
from dotenv import load_dotenv
import sqlite3
import argparse
from datetime import datetime
from picamera2 import Picamera2
from picamera2.encoders import JpegEncoder
from picamera2.outputs import FileOutput
import matplotlib.pyplot as plt
import pytz

# Load environment variables from .env file
load_dotenv()
CAMERA_IDENTIFIER_NO = os.getenv("CAMERA_IDENTIFIER_NO")

#####
# MJPEG Web Server
#####

PAGE = """\
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Camera Feed</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f0f2f5;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }}
        .container {{
            background-color: white;
            border-radius: 15px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 30px;
            text-align: center;
            max-width: 800px;
            width: 90%;
        }}
        h1 {{
            color: #1a73e8;
            margin-bottom: 15px;
            font-size: 2.5em;
        }}
        h2 {{
            color: #5f6368;
            margin-bottom: 25px;
            font-size: 1.3em;
            font-weight: normal;
        }}
        .stream-container {{
            position: relative;
            width: 100%;
            padding-bottom: 75%; /* 4:3 aspect ratio */
            overflow: hidden;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }}
        .stream-container img {{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }}
        .camera-info {{
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px;
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            font-size: 0.9em;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Live Camera Feed</h1>
        <h2>Real-time surveillance from Camera {camera_identifier}</h2>
        <div class="stream-container">
            <img src="stream.mjpg" alt="Live Camera Feed" />
            <div class="camera-info">Camera ID: {camera_identifier}</div>
        </div>
    </div>
</body>
</html>
"""

class StreamingOutput(io.BufferedIOBase):
    def __init__(self):
        self.frame = None
        self.condition = Condition()

    def write(self, buf):
        with self.condition:
            self.frame = buf  # Store the latest frame
            self.condition.notify_all()  # Notify any waiting clients

class StreamingHandler(server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(301)
            self.send_header('Location', '/index.html')
            self.end_headers()
        elif self.path == '/index.html':
            content = PAGE.format(camera_identifier=CAMERA_IDENTIFIER_NO).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.send_header('Content-Length', len(content))
            self.end_headers()
            self.wfile.write(content)
        elif self.path == '/stream.mjpg':
            self.send_response(200)
            self.send_header('Age', 0)
            self.send_header('Cache-Control', 'no-cache, private')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=FRAME')
            self.end_headers()
            try:
                while True:
                    with output.condition:
                        output.condition.wait()  # Wait until a new frame is available
                        frame = output.frame
                    self.wfile.write(b'--FRAME\r\n')
                    self.send_header('Content-Type', 'image/jpeg')
                    self.send_header('Content-Length', len(frame))
                    self.end_headers()
                    self.wfile.write(frame)
                    self.wfile.write(b'\r\n')
            except Exception as e:
                logging.warning('Removed streaming client %s: %s', self.client_address, str(e))
        else:
            self.send_error(404)
            self.end_headers()

class StreamingServer(socketserver.ThreadingMixIn, server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True
    
#####
# Person Detection with MediaPipe
#####

# Create the database if it doesn't exist
def attempt_create_db():
    try: 
        mydb = sqlite3.connect("processor.db")
        mycursor = mydb.cursor()
        query = "CREATE TABLE IF NOT EXISTS sensordb(readingDate TIMESTAMP, sensorIdentifier CHAR, reading NUMERIC, sent INTEGER)"
        mycursor.execute(query)
        mydb.commit()
        mydb.close()
    except:
        mydb.close()

# Global variables
webcam = None
output = StreamingOutput()
COUNTER, FPS = 0, 0
START_TIME = time.time()

# Initialize the USB webcam
def initialize_camera():
    global webcam
    # Use OpenCV to capture from the first connected webcam (0) or change the number if you have multiple webcams
    webcam = cv2.VideoCapture(0)
    webcam.set(cv2.CAP_PROP_FPS, 30)  # Set to 30 FPS or higher if supported
    if not webcam.isOpened():
        print("Error: Could not open webcam.")
        exit(1)
    print("Webcam initialized successfully.")

def run_detection(model: str, max_results: int, score_threshold: float) -> None:
    """Continuously run inference on images acquired from the camera.

    Args:
        model: Name of the TFLite object detection model.
        max_results: Max number of detection results.
        score_threshold: The score threshold of detection results.
    """
    global FPS, COUNTER, START_TIME

    # Visualization parameters
    row_size = 50  # pixels
    left_margin = 24  # pixels
    text_color = (0, 0, 0)  # black
    font_size = 0.6
    font_thickness = 1

    output_dir = 'detection_results'
    os.makedirs(output_dir, exist_ok=True)

    # Initialize the object detection model
    base_options = python.BaseOptions(model_asset_path=model)
    options = vision.ObjectDetectorOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.IMAGE,
        max_results=max_results,
        score_threshold=score_threshold
    )
    detector = vision.ObjectDetector.create_from_options(options)

    while True:
        # Capture frame from webcam
        ret, frame = webcam.read()
        if not ret:
            print("Error: Failed to capture image.")
            break

        # Optionally resize for faster processing
        frame = cv2.resize(frame, (320, 240))  # Smaller size for faster inference

        # Convert the frame from BGR to RGB as required by the TFLite model
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

        # Run object detection
        detection_result = detector.detect(mp_image)

        # Count the number of people detected
        person_count = sum(1 for detection in detection_result.detections if detection.categories[0].category_name == "person")

        # Log the number of people detected
        print(f"People detected: {person_count}")

        # Insert person count into the database
        try:
            with sqlite3.connect("processor.db") as mydb:
                mycursor = mydb.cursor()
                singapore_tz = pytz.timezone('Asia/Singapore')
                current_time = datetime.now(singapore_tz).strftime("%Y-%m-%d %H:%M:%S")
                query = "INSERT INTO sensordb(readingDate, sensorIdentifier, reading, sent) VALUES (?, ?, ?, ?)"
                mycursor.execute(query, (current_time, CAMERA_IDENTIFIER_NO, person_count, 0))
                mydb.commit()
                print(f"Inserted person count {person_count} into database")
        except sqlite3.Error as e:
            print(f"Error inserting into database: {e}")

        # Show the FPS and count
        COUNTER += 1
        if COUNTER % 10 == 0:
            FPS = 10 / (time.time() - START_TIME)
            START_TIME = time.time()

        fps_text = f'FPS = {FPS:.1f}'
        count_text = f'count = {person_count}'
        cv2.putText(frame, fps_text, (left_margin, row_size), cv2.FONT_HERSHEY_SIMPLEX,
                    font_size, text_color, font_thickness, cv2.LINE_AA)
        cv2.putText(frame, count_text, (left_margin, row_size * 2), cv2.FONT_HERSHEY_SIMPLEX,
                    font_size, text_color, font_thickness, cv2.LINE_AA)

        # Visualize results if available
        if detection_result:
            frame = visualize(frame, detection_result)

        # Encode the frame as JPEG and write it to output for streaming
        _, jpeg_frame = cv2.imencode('.jpg', frame)
        output.write(jpeg_frame.tobytes())  # Stream frame to clients

        # Save every detection frame if desired
        if frame is not None:
            try:
                timestamp = datetime.now(pytz.timezone('Asia/Singapore')).strftime("%Y%m%d_%H%M%S_%f")
                filepath = os.path.join(output_dir, f'detection_{timestamp}.png')
                plt.imsave(filepath, cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                print(f"Frame saved to {filepath}")
            except Exception as e:
                print(f"Error saving detection frame: {e}")

    # Release the webcam when done
    webcam.release()



#####
# Main
#####

def main():
    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument(
        '--model',
        help='Path of the object detection model.',
        required=False,
        default='efficientdet.tflite')
    parser.add_argument(
        '--maxResults',
        help='Max number of detection results.',
        required=False,
        default=20)
    parser.add_argument(
        '--scoreThreshold',
        help='The score threshold of detection results.',
        required=False,
        type=float,
        default=0.35)
    args = parser.parse_args()

    attempt_create_db()
    initialize_camera()

    # Start the detection thread
    detection_thread = Thread(target=run_detection, args=(args.model, int(args.maxResults), args.scoreThreshold))
    detection_thread.daemon = True
    detection_thread.start()

    # Start the streaming server
    try:
        address = ('', 8000)
        server = StreamingServer(address, StreamingHandler)
        print("Server started at http://localhost:8000")
        server.serve_forever()
    finally:
        webcam.release()

if __name__ == '__main__':
    main()
