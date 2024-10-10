# Remove EXTERNALLY-MANAGED file (Bookworm-specific issue)
sudo rm /usr/lib/python3.11/EXTERNALLY-MANAGED

# Update package list and install system dependencies
sudo apt-get update
sudo apt-get install -y python3-pip libgl1-mesa-glx libglib2.0-0

# Install Python dependencies
python3 -m pip install --upgrade pip
python3 -m pip install requests opencv-python mediapipe matplotlib picamera2

# Install OpenCV and MediaPipe with extended timeout (if needed)
if [ $? -ne 0 ]; then
    echo "Installation failed. Retrying with extended timeout..."
    sudo pip3 --default-timeout=100 install opencv-python mediapipe
fi

# Fallback installation for MediaPipe if the above fails
if [ $? -ne 0 ]; then
    echo "MediaPipe installation failed. Retrying with extended timeout..."
    sudo pip3 --default-timeout=200 install mediapipe
fi

# Download the EfficientDet-Lite0 model
wget -q -O efficientdet.tflite https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/1/efficientdet_lite0.tflite