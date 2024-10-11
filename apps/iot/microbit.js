function substring(inputString: string, start: number, end: number) {
  length = Math.min(inputString.length, end);
  i = start;
  result = '';
  tempString = inputString;
  while (i < length) {
    result = '' + result + tempString[i];
    i = i + 1;
  }
  return result;
}
input.onButtonPressed(Button.A, function () {
  basic.showString(sensorIdentifierNumber);
});
function getSensorValues() {
  if (sensorType == 'TEMP') {
    dht11_dht22.queryData(DHTtype.DHT11, DigitalPin.P1, true, false, true);
    dht11_dht22.selectTempType(tempType.celsius);
    return dht11_dht22.readData(dataType.temperature);
  } else if (sensorType == 'LIGHT') {
    return input.lightLevel();
  } else if (sensorType == 'SOIL') {
    return pins.analogReadPin(AnalogReadWritePin.P1);
  } else if (sensorType == 'HUMIDITY') {
    dht11_dht22.queryData(DHTtype.DHT11, DigitalPin.P1, true, false, true);
    return dht11_dht22.readData(dataType.humidity);
  }
  return null;
}
radio.onReceivedValue(function (sender, value) {
  if (testingSerial) {
    serial.writeLine('Radio received: ' + sender + ', ' + value);
  }
  if (writeSerial) {
    serial.writeLine('' + sender + '|' + value);
  }
  return 0;
});
radio.onReceivedString(function (receivedString) {
  if (testingSerial) {
    serial.writeLine('Radio received: ' + receivedString);
  }
  commandFromMicrobit = substring(receivedString, 0, 3);
  paramsFromMicrobit = substring(receivedString, 3, receivedString.length);
  switch (commandFromMicrobit) {
    case 'pol':
      if (radioGroup == 255) {
        break;
      }
      let sensorValueSlave = getSensorValues();
      radio.sendValue(sensorIdentifierNumber, sensorValueSlave);
      break;
    case 'bct':
      let paramsArraySlave = paramsFromMicrobit.split('|');
      if (sensorIdentifierNumber == paramsArraySlave[0]) {
        radioGroup = parseInt(paramsArraySlave[1]);
        radio.setGroup(radioGroup);
      }
      break;
  }
});
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
  data = serial.readLine();
  commandFromHub = substring(data, 0, 3);
  paramsFromHub = substring(data, 3, data.length);
  switch (commandFromHub) {
    case 'pol':
      if (radioGroup == 255) {
        break;
      }
      radio.sendString(data);
      let sensorValueMaster = getSensorValues();
      serial.writeLine(sensorIdentifierNumber + '|' + sensorValueMaster);
      break;
    case 'bct':
      let paramsArrayMaster = paramsFromHub.split('|');
      if (sensorIdentifierNumber == paramsArrayMaster[0]) {
        radioGroup = parseInt(paramsArrayMaster[1]);
      }
      radio.setGroup(255);
      radio.sendString(data);
      radio.setGroup(radioGroup);
      break;
  }
});
let tempString = '';
let result = '';
let i = 0;
let length = 0;
let data = '';
let commandFromMicrobit = '';
let paramsFromMicrobit = '';
let commandFromHub = '';
let paramsFromHub = '';
let sensorIdentifierNumber: string;
let sensorType: string;
let writeSerial: boolean;
let testingSerial: boolean;
let radioGroup = 255;
// ascii names
sensorIdentifierNumber = 'SE-11111';
sensorType = 'LIGHT';
writeSerial = true;
testingSerial = false;
radio.setGroup(radioGroup);
radio.setTransmitPower(7);
basic.showIcon(IconNames.Yes);
basic.forever(function () {});
