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

# Load environment variables from .env file
load_dotenv()
CAMERA_NAME = os.getenv("CAMERA_NAME")

#####
# MJPEG Web Server
#####

PAGE = """\
<html>
<head>
<title>picamera2 MJPEG streaming demo</title>
</head>
<body>
<h1>Picamera2 MJPEG Streaming Demo</h1>
<img src="stream.mjpg" width="640" height="480" />
</body>
</html>
"""

class StreamingOutput(io.BufferedIOBase):
    def __init__(self):
        self.frame = None
        self.condition = Condition()

    def write(self, buf):
        with self.condition:
            self.frame = buf
            self.condition.notify_all()

class StreamingHandler(server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(301)
            self.send_header('Location', '/index.html')
            self.end_headers()
        elif self.path == '/index.html':
            content = PAGE.encode('utf-8')
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
                        output.condition.wait()
                        frame = output.frame
                    self.wfile.write(b'--FRAME\r\n')
                    self.send_header('Content-Type', 'image/jpeg')
                    self.send_header('Content-Length', len(frame))
                    self.end_headers()
                    self.wfile.write(frame)
                    self.wfile.write(b'\r\n')
            except Exception as e:
                logging.warning(
                    'Removed streaming client %s: %s',
                    self.client_address, str(e))
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
picam2 = None
output = StreamingOutput()
COUNTER, FPS = 0, 0
START_TIME = time.time()

# Initialize the camera
def initialize_camera():
    global picam2
    picam2 = Picamera2()
    picam2.configure(picam2.create_video_configuration(main={"size": (640, 480)}))
    picam2.start_recording(JpegEncoder(), FileOutput(output))

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
    fps_avg_frame_count = 10
    
    detection_frame = None
    detection_result_list = []
    
    frame_count = 0
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
        # Capture frame
        frame = picam2.capture_array()
        
        # Convert the frame from BGR to RGB as required by the TFLite model
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

        # Run object detection using the model
        detection_result = detector.detect(mp_image)

        # Calculate FPS
        COUNTER += 1
        if COUNTER % 10 == 0:
            FPS = 10 / (time.time() - START_TIME)
            START_TIME = time.time()

        # Count the number of people detected
        person_count = sum(1 for detection in detection_result.detections if detection.categories[0].category_name == "person")

        # Log the number of people detected
        print(f"People detected: {person_count}")
        
        # Insert person count into the database
        try:
            with sqlite3.connect("processor.db") as mydb:
                mycursor = mydb.cursor()
                current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                query = "INSERT INTO sensordb(readingDate, sensorIdentifier, reading, sent) VALUES (?, ?, ?, ?)"
                mycursor.execute(query, (current_time, CAMERA_NAME, person_count, 0))
                mydb.commit()
                print(f"Inserted person count {person_count} into database")
        except sqlite3.Error as e:
            print(f"Error inserting into database: {e}")
            
        image = cv2.resize(frame, (640, 480))

        # Show the FPS and count
        fps_text = f'FPS = {FPS:.1f}'
        count_text = f'count = {person_count}'
        text_location = (left_margin, row_size)
        current_frame = image
        cv2.putText(current_frame, fps_text, (left_margin, row_size), cv2.FONT_HERSHEY_SIMPLEX,
                    font_size, text_color, font_thickness, cv2.LINE_AA)
        cv2.putText(current_frame, count_text, (left_margin, row_size * 2), cv2.FONT_HERSHEY_SIMPLEX,
                    font_size, text_color, font_thickness, cv2.LINE_AA)

        # Visualize results if available
        if detection_result:
            current_frame = visualize(current_frame, detection_result)
            detection_frame = current_frame

         # Save every detection frame
        if detection_frame is not None:
            try:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                filename = f'detection_{timestamp}.png'
                filepath = os.path.join(output_dir, filename)
                
                plt.figure(figsize=(12, 9))
                plt.imshow(cv2.cvtColor(detection_frame, cv2.COLOR_BGR2RGB))
                plt.axis('off')
                plt.tight_layout(pad=0)
                plt.savefig(filepath, bbox_inches='tight', pad_inches=0)
                plt.close()
                
                print(f"Frame saved to {filepath}")
            except Exception as e:
                print(f"Error saving detection frame: {e}")

        # Increase sleep time to make visualization stay longer
        time.sleep(0.5) 

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
        picam2.stop_recording()

if __name__ == '__main__':
    main()