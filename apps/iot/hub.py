import time
from datetime import datetime
import sqlite3
import requests
import json
import hashlib
import os
from dotenv import load_dotenv
import requests
from typing import List, Dict

# Load environment variables from .env file
load_dotenv()

HUB_IDENTIFIER_NO = os.getenv("HUB_IDENTIFIER_NO")
BACKEND_IP = os.getenv("BACKEND_IP")
BACKEND_PORT = os.getenv("BACKEND_PORT")
COM_PORT = os.getenv("COM_PORT")

# How often the hub will send data to the backend
UPDATE_SERVER_POLL_FREQUENCY = 2

# Backend URL
BASE_URL = f'http://{BACKEND_IP}:{BACKEND_PORT}/api'  # Replace with your actual backend URL
HEADERS = {'content-type': 'application/json'}

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

# Poll sensor data from micro:bits
def poll_sensor_data(valid_sensors, radioGroup):
    if len(valid_sensors) == 0:
        return dict() 
    
    # Broadcast radio group and sensors
    # this sends the command to all micro:bits to set the radio group to the radioGroup variable and to send data back to the hub
    for sensor in valid_sensors:
        sendCommand("bct"+sensor+"|"+str(radioGroup))
        time.sleep(0.1)

    # Clears buffer
    while (test := waitResponse()):
        time.sleep(0.1)
        continue

    # this sends the command to all micro:bits to send data back to the hub
    # pol does not need to send the radio group because it is already set
    sendCommand("pol")
    time.sleep(0.5)
    sendCommand("pol")
    time.sleep(0.5)
    print("Polling sensor data...")
    time.sleep(1)
    poll_result = dict() 
    # dat is the data that the micro:bit sends back to the hub
    # format: sensorIdentifier|value
    dat = waitResponse()
    while dat:
        if dat is None: break
        print("data", dat)
        # get the sensorIdentifier from the dat
        sensorIdentifier = dat.split("|")[0]
        # if the sensorIdentifier is not in the valid_sensors list, skip it
        if sensorIdentifier not in valid_sensors: 
            dat = waitResponse()
            continue
        try:
            # get the value from the dat
            value = float(dat.split("|")[1])
        except:
            continue

        # if reading is already in the poll_result dictionary, apply smoothing formula to calculate the new reading
        if sensorIdentifier in poll_result:
            poll_result[sensorIdentifier]["reading"] = poll_result[sensorIdentifier]["reading"]* 0.6 + value*0.4
        else:
            # if reading is not in the poll_result dictionary, add it to the dictionary
            poll_result[sensorIdentifier] = {
                "reading": value,
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        dat = waitResponse()
        time.sleep(0.3)

    print("Polling Completed!")
    return poll_result

# Send sensor readings to the backend
def publish_local_sensor_to_server(valid_sensors, token, conn):
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

    res = requests.post(BASE_URL + "/hubs/pushSensorReadings/" + HUB_IDENTIFIER_NO, 
        headers = HEADERS, 
        json = {
        "jsonPayloadString" : json_payload_string,
        "sha256" : hash_obj.hexdigest()
        }, 
        timeout=5).json()
    
    print("res from pushSensorReadings", res)
    
    if "sensors" in res:
        while True:
            try:
                mycursor.execute('UPDATE sensordb SET sent = 1 WHERE sent = 0')
                break
            except:
                time.sleep(0.2)
        valid_sensors = res["sensors"]
        print("Sent data to server.")
    else:
        print(f"Error: Unable to connect to hub or process response.")
    return valid_sensors, res["radioGroup"] if "radioGroup" in res else 255

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
        
        print(f"Response status code: {response.status_code}")
        print(f"Response content: {response.text}")
        
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

# Add this function to update the list of valid sensors
def update_valid_sensors(hub_identifier: str) -> List[str]:
    try:
        response = requests.get(f"{BASE_URL}/hubs/updateHubSensors/{hub_identifier}", timeout=5)
        if response.status_code == 200:
            return response.json()['sensors']
        else:
            print(f"Failed to update sensors: {response.text}")
            return []
    except requests.exceptions.RequestException as e:
        print(f"Error updating sensors: {e}")
        return []

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
    valid_sensors, radioGroup = publish_local_sensor_to_server([], token, mydb)
    sensor_update_counter = 0
    try:
        polls = 0
        while True:
            polls += 1
            sensor_update_counter += 1

            # Check for new sensors every 10 iterations (adjust as needed)
            if sensor_update_counter >= 10:
                new_valid_sensors = update_valid_sensors(HUB_IDENTIFIER_NO)
                if new_valid_sensors:
                    valid_sensors = new_valid_sensors
                sensor_update_counter = 0

            # get the sensor values from the micro:bits
            sensor_values = poll_sensor_data(valid_sensors, radioGroup)
            mycursor = mydb.cursor()
            
            # insert the sensor values into the database
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
            if len(sensor_values): print("Inserted records into database!")
            else: print("No data")

            # send the sensor values to the backend
            if polls >= UPDATE_SERVER_POLL_FREQUENCY:
                valid_sensors, radioGroup = publish_local_sensor_to_server(valid_sensors, token, mydb) # Must use token 
                print("valid_sensors, radioGroup",valid_sensors, radioGroup)
                polls = 0

            temp_buffer = []
            time.sleep(0.5)

    except KeyboardInterrupt:
        if ser.is_open:
            ser.close()
        print("Program terminated!")

# Run the main function
if __name__ == "__main__":
    main_function()
