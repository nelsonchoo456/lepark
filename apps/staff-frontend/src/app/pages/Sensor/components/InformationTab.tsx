import { useAuth } from '@lepark/common-ui';
import { SensorResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { Descriptions, Tag } from 'antd';
import { DescriptionsItemType } from 'antd/es/descriptions';
import moment from 'moment';

const InformationTab = ({ sensor }: { sensor: SensorResponse }) => {
  const { user } = useAuth<StaffResponse>();
  const formatEnum = (type: string): string => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
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

  const baseDescriptionsItems = [
    { key: 'name', label: 'Sensor Name', children: sensor.name || '-' },
    { key: 'serialNumber', label: 'Serial Number', children: sensor.serialNumber || '-' },
    { key: 'sensorType', label: 'Sensor Type', children: formatEnum(sensor.sensorType) || '-' },
    { key: 'description', label: 'Description', children: sensor.description || '-' },
    { key: 'sensorStatus', label: 'Sensor Status', children: getStatusTag(sensor.sensorStatus) },
    { key: 'acquisitionDate', label: 'Acquisition Date', children: moment(sensor.acquisitionDate).format('MMMM D, YYYY') },
    { key: 'calibrationFrequencyDays', label: 'Calibration Frequency (days)', children: sensor.calibrationFrequencyDays ? `${sensor.calibrationFrequencyDays} days` : '-' },
    { key: 'sensorUnit', label: 'Sensor Unit', children: formatEnum(sensor.sensorUnit) || '-' },
    { key: 'supplier', label: 'Supplier', children: sensor.supplier || '-' },
    { key: 'supplierContactNumber', label: 'Supplier Contact Number', children: sensor.supplierContactNumber || '-' },
    { key: 'remarks', label: 'Remarks', children: sensor.remarks || '-' },
    { key: 'hubName', label: 'Connected Hub', children: sensor.hub?.name || '-' },
    { key: 'facilityName', label: 'Facility', children: sensor.facility?.name || '-' },
  ];

  const conditionalItems = [
    sensor.lastCalibratedDate && {
      key: 'lastCalibratedDate',
      label: 'Last Calibrated Date',
      children: moment(sensor.lastCalibratedDate).format('MMMM D, YYYY'),
    },
    sensor.lastMaintenanceDate && {
      key: 'lastMaintenanceDate',
      label: 'Last Maintenance Date',
      children: moment(sensor.lastMaintenanceDate).format('MMMM D, YYYY'),
    },
    sensor.nextMaintenanceDate && {
      key: 'nextMaintenanceDate',
      label: 'Next Maintenance Date',
      children: moment(sensor.nextMaintenanceDate).format('MMMM D, YYYY'),
    },
    sensor.dataFrequencyMinutes && {
      key: 'dataFrequencyMinutes',
      label: 'Data Frequency (minutes)',
      children: `${sensor.dataFrequencyMinutes} minutes`,
    },
    sensor.lat && { key: 'lat', label: 'Latitude', children: sensor.lat.toString() },
    sensor.long && { key: 'long', label: 'Longitude', children: sensor.long.toString() },
  ].filter(Boolean);

  const descriptionsItems = [...baseDescriptionsItems, ...conditionalItems];

  const superAdminDescriptionsItems = [
    ...descriptionsItems,
    { key: 'parkName', label: 'Park Name', children: sensor.park?.name || '-' },
  ];

  return (
    <div>
      <Descriptions
        items={(user?.role === StaffType.SUPERADMIN ? superAdminDescriptionsItems : descriptionsItems) as DescriptionsItemType[]}
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
