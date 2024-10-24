import time
from datetime import datetime, timedelta
import sqlite3
import requests
import json
import hashlib
import os
from dotenv import load_dotenv
import requests
import sys
import pytz

# Load environment variables from .env file
load_dotenv()

HUB_IDENTIFIER_NO = os.getenv("HUB_IDENTIFIER_NO")
BACKEND_IP = os.getenv("BACKEND_IP")
BACKEND_PORT = os.getenv("BACKEND_PORT")
COM_PORT = os.getenv("COM_PORT")

# Poll sensor data from micro:bits
NEXT_POLL_IN_SECONDS = 5

# Backend URL
BASE_URL = f'http://{BACKEND_IP}:{BACKEND_PORT}/api'  # Replace with your actual backend URL
HEADERS = {'content-type': 'application/json'}

# Smoothing window size and weight for sensor readings
SMOOTHING_WINDOW_SIZE = 5
SMOOTHING_WEIGHT = 0.4

ser = None
if COM_PORT:
    import serial
    ser = serial.Serial(port=COM_PORT, baudrate=115200)
    ser.timeout = 1

# Create the database if it doesn't exist
def attempt_create_db():
    try: 
        mydb = sqlite3.connect("processor.db")
        mycursor = mydb.cursor()
        query = "CREATE TABLE sensordb(readingDate TIMESTAMP, sensorIdentifier CHAR, reading NUMERIC, sent INTEGER)"
        mycursor.execute(query)
        mydb.commit()
        mydb.close()
    except:
        mydb.close()

# Send command to micro:bit via serial
def sendCommand(command:str):
    command = command + '\n'
    if ser is not None:
        ser.write(str.encode(command))

# Wait for response from micro:bit via serial
def waitResponse():
    response = None
    if ser is not None:
        response = ser.readline()
    if response is not None and len(response) > 0:
        return response.decode('utf-8').strip()
    return None

def clear_serial_buffer():
    if ser is not None:
        ser.reset_input_buffer()
        ser.reset_output_buffer()

# Global variables
global NUMBER_OF_POLLS_BEFORE_UPDATE_BACKEND
NUMBER_OF_POLLS_BEFORE_UPDATE_BACKEND = 5  # Default value

def get_data_transmission_rate():
    global NUMBER_OF_POLLS_BEFORE_UPDATE_BACKEND
    response = requests.get(BASE_URL + f"/hubs/getHubDataTransmissionRate/{HUB_IDENTIFIER_NO}", timeout=5).json()
    print(response)
    NUMBER_OF_POLLS_BEFORE_UPDATE_BACKEND = response
    return response

def poll_sensor_data_from_microbit(valid_sensors, radioGroup):
    if len(valid_sensors) == 0:
        return dict() 
    
    # Broadcast radio group and sensors
    # this sends the command to all micro:bits to set the radio group to the radioGroup variable and to send data back to the hub
    for sensor in valid_sensors:
        sendCommand("bct" + sensor + "|" + str(radioGroup))
        time.sleep(0.1)

    # Allow more time for micro:bits to process commands
    time.sleep(1)

    # Clears buffer
    clear_serial_buffer()

    print("Sending polling commands to micro:bits, waiting for valid response...")

    poll_result = dict()
    start_time = time.time()
    timeout = 5  # Set a timeout for polling, during this time we will repeatedly send the polling command

    while time.time() - start_time < timeout:
        sendCommand("pol")
        time.sleep(0.5)

        data = waitResponse()
        if data:
            print("Received data:", data)
            sensorIdentifier = data.split("|")[0]
            if sensorIdentifier in valid_sensors:
                try:
                    value = float(data.split("|")[1])

                    if sensorIdentifier not in poll_result:
                        singapore_tz = pytz.timezone('Asia/Singapore')
                        poll_result[sensorIdentifier] = {
                            "readings": [],
                            "time": datetime.now(singapore_tz).strftime("%Y-%m-%d %H:%M:%S")
                        }
                    
                    poll_result[sensorIdentifier]["readings"].append(value)
                    
                    # Keep only the last SMOOTHING_WINDOW_SIZE readings
                    poll_result[sensorIdentifier]["readings"] = poll_result[sensorIdentifier]["readings"][-SMOOTHING_WINDOW_SIZE:]
                    
                    print(f"Valid reading received for sensor {sensorIdentifier}")
                    if len(poll_result) == len(valid_sensors) and all(len(sensor_data["readings"]) >= SMOOTHING_WINDOW_SIZE for sensor_data in poll_result.values()):
                        print("All sensors have reported with enough readings. Stopping poll.")
                        break
                except:
                    print(f"Invalid reading format for sensor {sensorIdentifier}")
            else:
                print(f"Received data from invalid sensor: {sensorIdentifier}")
        time.sleep(0.3)

    # Calculate smoothed readings
    for sensorIdentifier, sensor_data in poll_result.items():
        print("Smoothing readings for sensor: ", sensorIdentifier)
        readings = sensor_data["readings"]
        if len(readings) > 0:
            # Calculate exponential moving average
            ema = readings[0]
            for reading in readings[1:]:
                ema = ema * (1 - SMOOTHING_WEIGHT) + reading * SMOOTHING_WEIGHT
            poll_result[sensorIdentifier]["reading"] = ema
        else:
            poll_result[sensorIdentifier]["reading"] = None

    if len(poll_result) == 0:
        print("No valid sensor readings received within the timeout period.")
    else:
        print(f"Polling completed! Received data from {len(poll_result)} sensor(s).")
    return poll_result

# Send sensor readings to the backend
def push_sensor_readings_to_backend(valid_sensors, token, conn, is_first_time):
    mycursor = conn.cursor()
    # Only take readings that have not been sent to the backend
    mycursor.execute('SELECT readingDate, sensorIdentifier, reading FROM sensordb WHERE sent = 0')
    results = mycursor.fetchall()
    
    json_payload = dict()
    for result in results:
        # If the sensor is not in the valid_sensors list, skip it
        if result[1] not in valid_sensors: continue
        # If the sensor is already in the payload, append the reading to the existing list
        if result[1] in json_payload:
            json_payload[result[1]].append({
                "readingDate": result[0],
                "reading" : result[2]
            })
        # If the sensor is not in the payload, create a new list for it
        #result[1] is the sensor identifier
        else:
            json_payload[result[1]] = [{
                "readingDate": result[0],
                "reading" : result[2]
            }]

    # json_payload consists of a dictionary with sensor names as keys and a list of dictionaries as values. Each inner dictionary contains a readingDate and a reading.
    
    json_payload_string = json.dumps(json_payload)
    hash_obj = hashlib.sha256()
    hash_obj.update((json_payload_string + token).encode())

    response = requests.post(BASE_URL + "/hubs/pushSensorReadings/" + HUB_IDENTIFIER_NO, 
        headers = HEADERS, 
        json = {
        "jsonPayloadString" : json_payload_string,
        "sha256" : hash_obj.hexdigest()
        }, 
        timeout=5).json()
    
    if "sensors" in response:
        if is_first_time:
            print("Initial call: Fetched list of valid sensors from the backend.")
        else:
            while True:
                try:
                    mycursor.execute('UPDATE sensordb SET sent = 1 WHERE sent = 0')
                    break
                except:
                    time.sleep(0.2)
            print("All sensor readings have been sent to the backend server.")
        valid_sensors = response["sensors"]
    else:
        print(f"Error: Unable to connect to hub or process response.")
        return None, None  # Return None values to indicate an error

    return valid_sensors, response["radioGroup"] if "radioGroup" in response else 255

# Get the token from the SECRET file (in raspberry pi)
def get_token():
    try:
        return None if len(open("./SECRET", "r").read().strip()) == 0 else open("./SECRET", "r").read().strip()
    except:
        return None

# Initialize connection to backend, backend will return a token
def initialize_connection_to_backend():
    endpoint = f"{BASE_URL}/hubs/verifyHubInitialization"
    
    # Prepare the payload
    payload = {
        "identifierNumber": HUB_IDENTIFIER_NO
    }
    
    try:
        print(f"Attempting to connect to {endpoint}")
        response = requests.put(endpoint, json=payload, timeout=5)
    
        if response.status_code == 200:
            data = response.json()
            if "token" in data:
                print(f"Initialization successful. Token: {data['token']}")
                return data['token']
            else:
                print("Unexpected response format. 'token' not found in response.")
        else:
            print(f"Error: Unexpected status code {response.status_code}")
            print(f"Response: {response.text}")
        
    except requests.exceptions.RequestException as e:
        print(f"An error occurred during connection: {e}")
    
    return None

# Save the token to the SECRET file (in raspberry pi)
def save_token(token):
    f = open("SECRET", "w")
    f.write(token)

# Update the main_function to periodically check for new sensors
def main_function():
    attempt_create_db()
    token = get_token()
    if token is None:
        max_retries = 3
        retry_count = 0
        while token is None and retry_count < max_retries:
            print("Initializing connection with backend!")
            token = initialize_connection_to_backend()
            if token:
                print("Token obtained successfully.")
                save_token(token)
                break
            else:
                retry_count += 1
                if retry_count < max_retries:
                    print(f"Failed to initialize connection. Retrying in 3 seconds... (Attempt {retry_count}/{max_retries})")
                    time.sleep(3)
                else:
                    print("Failed to obtain token after maximum retries. Please check your backend connection and try again later.")
                    return  # Exit the main_function

    print("Starting program...\n")
    mydb = sqlite3.connect("processor.db")
    valid_sensors, radioGroup = push_sensor_readings_to_backend([], token, mydb, True)
    if valid_sensors is None:
        print("No valid sensors. Exiting...")
        return  # Exit the main_function
    if radioGroup is None:
        print("Radio group not found. Exiting...")
        return  # Exit the main_function
    print("Valid sensors fetched: ", valid_sensors)
    print()
    
    response = get_data_transmission_rate()
    print("Data Transmission Rate (Polls) is: " + str(response))
    try:
        polls = 0
        singapore_tz = pytz.timezone('Asia/Singapore')
        last_poll_time = datetime.now(singapore_tz)
        while True:
            current_time = datetime.now(singapore_tz)
            if (current_time - last_poll_time).total_seconds() >= NEXT_POLL_IN_SECONDS:
                polls += 1
                # get the sensor values from the micro:bits
                sensor_values = poll_sensor_data_from_microbit(valid_sensors, radioGroup)
                mycursor = mydb.cursor()
                
                # insert the sensor values into the sqlite database
                for sensor_identifier, data in sensor_values.items():
                    reading = data["reading"]
                    readingDate = data["time"]
                    query = 'INSERT INTO sensordb(readingDate, sensorIdentifier, reading, sent) VALUES (?, ?, ?, ?)'
                    val = (readingDate, sensor_identifier, reading, 0)

                    while True:
                        try:
                            mycursor.execute(query, val)
                            break
                        except:
                            time.sleep(0.2)

                mydb.commit()
                if len(sensor_values): print("Inserted records into SQLite database!\n")
                else: print("No new sensor data to insert\n")

                # send the sensor values to the backend
                if polls >= NUMBER_OF_POLLS_BEFORE_UPDATE_BACKEND:
                    valid_sensors, radioGroup = push_sensor_readings_to_backend(valid_sensors, token, mydb, False)
                    print("Sensors list refreshed: ", valid_sensors)
                    print()
                    if valid_sensors is None:
                        print("No valid sensors. Exiting...")
                        break  # Exit the main_function
                    if radioGroup is None:
                        print("Radio group not found. Exiting...")
                        break
                    polls = 0

                last_poll_time = current_time
                time.sleep(0.5)

    except KeyboardInterrupt:
        if ser.is_open:
            ser.close()
        print("Program terminated!")

    # Close the database connection before exiting
    mydb.close()
    print("Exiting the application.")
    sys.exit(1)  # Exit with a non-zero status code to indicate an error

# Run the main function
if __name__ == "__main__":
    main_function()
