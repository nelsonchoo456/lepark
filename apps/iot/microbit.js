function substring(inputString: string, start: number, end: number) {
  length = Math.min(inputString.length, end);
  i = start;
  result = '';
  while (i < length) {
    result = result + inputString[i++];
  }
  return result;
}
input.onButtonPressed(Button.A, function () {
  basic.showString(sensorIdentifierNumber);
});

function getSensorValues() {
  if (sensorType == 'TEMP') {
    return input.temperature();
  } else if (sensorType == 'LIGHT') {
    return input.lightLevel();
  }
  return null;
}

// Received value from other Micro:bits, send to backend
radio.onReceivedValue(function (sender, val) {
  if (testingSerial) {
    serial.writeLine('radio rcv key, val: ' + sender + ', ' + val);
  }
  if (writeSerial) {
    // format: sensorIdentifier|value
    // Received value from other Micro:bits, send to backend
    serial.writeLine('' + sender + '|' + val);
  }
  return 0;
});

// Received command from another Micro:bit to configure the radio group
radio.onReceivedString(function (receivedString) {
  if (testingSerial) {
    serial.writeLine('radio rcv str: ' + receivedString);
  }
  // cmd is the first 3 characters of the receivedString (pol or bct)
  cmd = substring(receivedString, 0, 3);
  // params is the rest of the receivedString (sensorIdentifierNumber|sensorType or sensorIdentifierNumber|radioGroup)
  params = substring(receivedString, 3, receivedString.length);
  switch (cmd) {
    case 'pol':
      if (radioGroup == 255) {
        break;
      }
      let value = getSensorValues();
      // send the value to the other micro:bits on the same radio group
      radio.sendValue(sensorIdentifierNumber, value);
      break;
    case 'bct':
      let sensorRadio = params.split('|');
      if (sensorIdentifierNumber == sensorRadio[0]) {
        radioGroup = parseInt(sensorRadio[1]);
        radio.setGroup(radioGroup);
      }
      break;
  }
});

// Received command from Hub
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
  // data is in the format of pol|sensorIdentifierNumber|radioGroup
  data = serial.readLine();
  // cmd2 is pol or bct
  cmd2 = substring(data, 0, 3);
  // params2 is the rest of the string (sensorIdentifierNumber and radioGroup)
  params2 = substring(data, 3, data.length);
  switch (cmd2) {
    case 'pol':
      // if radioGroup is 255, break out of the switch statement as it means that the micro:bit is not configured to have a radio group
      if (radioGroup == 255) {
        break;
      }
      // send the data to the other micro:bits on the same radio group for them to poll the sensor values
      radio.sendString(data);
      let value2 = getSensorValues();
      // writeLine purpose is to send data back to the hub
      serial.writeLine(sensorIdentifierNumber + '|' + value2);
      break;
    case 'bct':
      // bct|sensorIdentifierNumber|radioGroup
      let sensorRadio2 = params2.split('|');
      if (sensorIdentifierNumber == sensorRadio2[0]) {
        radioGroup = parseInt(sensorRadio2[1]);
      }
      radio.setGroup(255);
      // send the data to the other micro:bits on the same radio group for them to configure the radio group
      radio.sendString(data);
      radio.setGroup(radioGroup);
      break;
  }
});

let result = '';
let length = 0;
let data = '';
let i = 0;
let cmd = '';
let params = '';
let cmd2 = '';
let params2 = '';
let sensorIdentifierNumber: string;
let sensorType: string;
// for writing to the serial port, used once everything is confirmed to be working
let writeSerial: boolean;
// for testing serial communication
let testingSerial: boolean;
// radio group is 255 if the micro:bit is not configured to have a radio group
let radioGroup = 255;
// ascii names
sensorIdentifierNumber = 'SENS-DLJK9482';
sensorType = 'LIGHT';
writeSerial = false;
testingSerial = true;
radio.setGroup(radioGroup);
radio.setTransmitPower(7);
basic.showIcon(IconNames.Yes);
basic.forever(function () {});
