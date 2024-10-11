import { SensorResponse, SensorTypeEnum } from "@lepark/data-access";
import { MdOutlineLight, MdOutlinePhotoCamera, MdSensors } from "react-icons/md";
import { TbTemperature } from "react-icons/tb";
import { SiRainmeter } from "react-icons/si";
import { BiWater } from "react-icons/bi";

export const getSensorIcon = (sensor: SensorResponse) => {
  if (sensor.sensorType === SensorTypeEnum.LIGHT) {
    return <MdOutlineLight className="text-slate-400 drop-shadow-lg" style={{ fontSize: '1.4rem' }} />
  } else if (sensor.sensorType === SensorTypeEnum.CAMERA) {
    return <MdOutlinePhotoCamera className="text-slate-400 drop-shadow-lg" style={{ fontSize: '1.4rem' }} />
  } else if (sensor.sensorType === SensorTypeEnum.SOIL_MOISTURE) {
    return <BiWater className="text-slate-400 drop-shadow-lg" style={{ fontSize: '1.4rem' }} />
  } else if (sensor.sensorType === SensorTypeEnum.TEMPERATURE) {
    return <TbTemperature className="text-slate-400 drop-shadow-lg" style={{ fontSize: '1.4rem' }} />
  } else if (sensor.sensorType === SensorTypeEnum.HUMIDITY) {
    return <SiRainmeter className="text-slate-400 drop-shadow-lg" style={{ fontSize: '1.4rem' }} />
  }
  return <MdSensors className="text-slate-400 drop-shadow-lg" style={{ fontSize: '1.4rem' }} />
}