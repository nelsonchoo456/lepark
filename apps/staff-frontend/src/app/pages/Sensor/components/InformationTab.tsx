import { SensorResponse } from '@lepark/data-access';
import { Descriptions } from 'antd';
import moment from 'moment';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';

const InformationTab = ({ sensor }: { sensor: SensorResponse }) => {
  const formatValue = (key: string, value: any) => {
    if (key.toLowerCase().includes('date')) {
      return moment(value).format('MMMM D, YYYY');
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const excludeKeys = [
    'id',
    'serialNumber',
    'sensorStatus',
    'sensorType',
    'sensorName',
    'name',
    'image',
    'lat',
    'long',
    'ipAddress',
    'macAddress',
    'hubSecret',
    'radioGroup',
    'nextMaintenanceDate',
    'zoneId',
    'facilityId',
  ]; // Add keys you want to exclude

  const descriptionsItems = Object.entries(sensor)
    .filter(([key, value]) => !excludeKeys.includes(key) && value !== null && value !== undefined)
    .map(([key, value]) => ({
      key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()), // Convert camelCase to Title Case
      children: formatValue(key, value),
    }));

  return (
    <div>
      <Descriptions
        items={descriptionsItems}
        bordered
        column={1}
        size="middle"
        labelStyle={{ width: '40%' }} // Adjust the width of the label column
        contentStyle={{ width: '60%' }} // Adjust the width of the content column
      />
    </div>
  );
};

export default InformationTab;
