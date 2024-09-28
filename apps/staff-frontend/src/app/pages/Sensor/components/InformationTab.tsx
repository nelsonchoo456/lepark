import { SensorResponse } from '@lepark/data-access';
import { Descriptions, Tag } from 'antd';
import moment from 'moment';

const InformationTab = ({ sensor }: { sensor: SensorResponse }) => {
  const formatValue = (key: string, value: any) => {
    if (key.toLowerCase().includes('date')) {
      return moment(value).format('MMMM D, YYYY');
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    if (key === 'sensorStatus') {
      return getStatusTag(value);
    }
    return value;
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Tag color="green">ACTIVE</Tag>;
      case 'INACTIVE':
        return <Tag color="blue">INACTIVE</Tag>;
      case 'UNDER_MAINTENANCE':
        return <Tag color="orange">UNDER MAINTENANCE</Tag>;
      case 'DECOMMISSIONED':
        return <Tag color="red">DECOMMISSIONED</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const excludeKeys = ['id', 'image', 'latitude', 'longitude', 'nextMaintenanceDate', 'zoneId', 'facilityId', 'name', 'images'];

  const descriptionsItems = Object.entries(sensor)
    .filter(([key, value]) => !excludeKeys.includes(key) && value !== null && value !== undefined)
    .map(([key, value]) => ({
      key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
      children: formatValue(key, value),
    }));

  return (
    <div>
      <Descriptions
        items={descriptionsItems}
        bordered
        column={1}
        size="middle"
        labelStyle={{ width: '40%' }}
        contentStyle={{ width: '60%' }}
      />
    </div>
  );
};

export default InformationTab;
