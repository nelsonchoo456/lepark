import time
from datetime import datetime
import sqlite3
import requests
import json
import hashlib

# Load environment variables from .env file
env = dict(map(lambda x:(x.strip().split("=")[0].strip(), x.strip().split("=")[1].strip()), map(lambda x:x.split("#")[0] if "=" in x.split("#")[0] else "None=None", open("./.env", "r").read().strip().split("\n"))))

HUB_IDENTIFIER_NO = env["HUB_IDENTIFIER_NO"]
UPDATE_SERVER_POLL_FREQUENCY = 2

# Local server IP and URL
LOCAL_IP = "192.168.1.132"  # Local server IP address
BASE_URL = 'http://{}:3333/api'.format(LOCAL_IP)  # Local backend URL
HEADERS = {'content-type': 'application/json'}

ser = None
if "COM_PORT" in env:
    import serial
    COM_PORT = env["COM_PORT"]
    ser = serial.Serial(port=COM_PORT, baudrate=115200)
    ser.timeout = 1

# Create the database if it doesn't exist
def attempt_create_db():
    try: 
        mydb = sqlite3.connect("processor.db")
        mycursor = mydb.cursor()
        query = "CREATE TABLE sensordb(readingDate TIMESTAMP, sensor CHAR, reading NUMERIC, sent INTEGER)"
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
    for sensor in valid_sensors:
        sendCommand("bct"+sensor+"|"+str(radioGroup))
        time.sleep(0.1)

    # Clears buffer
    while (test := waitResponse()):
        time.sleep(0.1)
        continue

    sendCommand("pol")
    time.sleep(0.5)
    sendCommand("pol")
    time.sleep(0.5)
    print("Polling sensor data...")
    time.sleep(1)
    poll_result = dict() 
    dat = waitResponse()
    while dat:
        if dat is None: break
        print("data", dat)
        sensorName = dat.split("|")[0]
        if sensorName not in valid_sensors: 
            dat = waitResponse()
            continue
        try:
            value = float(dat.split("|")[1])
        except:
            continue

        if sensorName in poll_result:
            poll_result[sensorName]["reading"] = poll_result[sensorName]["reading"]* 0.6 + value*0.4
        else:
            poll_result[sensorName] = {
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
    mycursor.execute('SELECT readingDate, sensor, reading FROM sensordb WHERE sent = 0')
    results = mycursor.fetchall()
    
    json_payload = dict()
    for result in results:
        if result[1] not in valid_sensors: continue
        if result[1] in json_payload:
            json_payload[result[1]].append({
                "readingDate": result[0],
                "reading" : result[2]
            })
        else:
            json_payload[result[1]] = [{
                "readingDate": result[0],
                "reading" : result[2]
            }]

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
    
    if "sensors" in res:
        while True:
            try:
                mycursor.execute('UPDATE sensordb SET sent = 1 WHERE sent = 0')
                break
            except:
                time.sleep(0.2)
        valid_sensors = res["sensors"]
        print("Sent data to server.")
    else: print("Unable to connect to hub!")
    return valid_sensors, res["radioGroup"] if "radioGroup" in res else 255

# Token handling functions
def get_token():
    try:
        return None if len(open("./SECRET", "r").read().strip()) == 0 else open("./SECRET", "r").read().strip()
    except:
        return None

def initialize_connection_to_backend():
    payload = requests.put(BASE_URL + "/zones/initializeHub", json={"name":HUB_IDENTIFIER_NO}).json()
    return payload["token"] if "token" in payload else None

def save_token(token):
    f = open("SECRET", "w")
    f.write(token)

# Static assignment of sensors to micro:bits based on radio groups
def assign_sensors_to_fixed_microbits():
    # Static mapping: sensor_name -> radio_group
    sensor_assignments = [
        {"sensor_name": "light1", "sensor_type": "LIGHT", "radio_group": 1},  # Micro:bit A
        {"sensor_name": "humid1", "sensor_type": "HUMID", "radio_group": 2},  # Micro:bit B
        {"sensor_name": "temp1", "sensor_type": "TEMP", "radio_group": 3},    # Micro:bit C
    ]
    
    # Send the assignment commands to each micro:bit
    for assignment in sensor_assignments:
        command = f"bct{assignment['sensor_name']}|{assignment['sensor_type']}"
        sendCommand(command)  # Send the command to assign the sensor
        print(f"Assigned {assignment['sensor_name']} to radio group {assignment['radio_group']}")
        time.sleep(0.2)  # Small delay to ensure the command is processed

# Main function to run the hub
def main_function():
    attempt_create_db()
    token = get_token()
    if token is None:
        while token is None:
            print("Initializing connection with local backend!")
            token = initialize_connection_to_backend()
            print("Token obtained: ", token)
            if token: break
            time.sleep(3)
        save_token(token)

    print("Starting program...\n")
    mydb = sqlite3.connect("processor.db")

    # Assign sensors statically to micro:bits based on radio group
    assign_sensors_to_fixed_microbits()

    try:
        polls = 0
        while True:
            polls += 1
            valid_sensors = ["light1", "humid1", "temp1"]
            radioGroup = 1  # Example, could be updated dynamically
            sensor_values = poll_sensor_data(valid_sensors, radioGroup)
            mycursor = mydb.cursor()

            # Store sensor values in local database
            for sensor, data in sensor_values.items():
                reading = data["reading"]
                readingDate = data["time"]
                query = 'INSERT INTO sensordb(readingDate, sensor, reading, sent) VALUES (?, ?, ?, ?)'
                val = (readingDate, sensor, reading, 0)

                while True:
                    try:
                        mycursor.execute(query, val)
                        break
                    except:
                        time.sleep(0.2)

            mydb.commit()
            if len(sensor_values):
                print("Inserted records into database!")
            else:
                print("No data")

            # Periodically push data to server and update valid sensors list
            if polls >= UPDATE_SERVER_POLL_FREQUENCY:
                valid_sensors, radioGroup = publish_local_sensor_to_server(valid_sensors, token, mydb)
                print("valid_sensors, radioGroup", valid_sensors, radioGroup)
                polls = 0

            time.sleep(0.5)

    except KeyboardInterrupt:
        if ser.is_open:
            ser.close()
        print("Program terminated!")

# Run the main function
if __name__ == "__main__":
    main_function()
