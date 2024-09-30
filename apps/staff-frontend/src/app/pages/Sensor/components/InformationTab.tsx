import { useAuth } from '@lepark/common-ui';
import { SensorResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { Descriptions, Tag } from 'antd';
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

  const descriptionsItems = [
    { key: 'name', label: 'Sensor Name', children: sensor.name || '-' },
    { key: 'serialNumber', label: 'Serial Number', children: sensor.serialNumber || '-' },
    { key: 'sensorType', label: 'Sensor Type', children: formatEnum(sensor.sensorType) || '-' },
    { key: 'description', label: 'Description', children: sensor.description || '-' },
    { key: 'sensorStatus', label: 'Sensor Status', children: getStatusTag(sensor.sensorStatus) },
    { key: 'acquisitionDate', label: 'Acquisition Date', children: moment(sensor.acquisitionDate).format('MMMM D, YYYY') },
    {
      key: 'lastCalibratedDate',
      label: 'Last Calibrated Date',
      children: sensor.lastCalibratedDate ? moment(sensor.lastCalibratedDate).format('MMMM D, YYYY') : '-',
    },
    {
      key: 'calibrationFrequencyDays',
      label: 'Calibration Frequency (days)',
      children: sensor.calibrationFrequencyDays ? `${sensor.calibrationFrequencyDays} days` : '-',
    },
    {
      key: 'lastMaintenanceDate',
      label: 'Last Maintenance Date',
      children: sensor.lastMaintenanceDate ? moment(sensor.lastMaintenanceDate).format('MMMM D, YYYY') : '-',
    },
    {
      key: 'nextMaintenanceDate',
      label: 'Next Maintenance Date',
      children: sensor.nextMaintenanceDate ? moment(sensor.nextMaintenanceDate).format('MMMM D, YYYY') : '-',
    },
    {
      key: 'dataFrequencyMinutes',
      label: 'Data Frequency (minutes)',
      children: sensor.dataFrequencyMinutes ? `${sensor.dataFrequencyMinutes} minutes` : '-',
    },
    { key: 'sensorUnit', label: 'Sensor Unit', children: formatEnum(sensor.sensorUnit) || '-' },
    { key: 'supplier', label: 'Supplier', children: sensor.supplier || '-' },
    { key: 'supplierContactNumber', label: 'Supplier Contact Number', children: sensor.supplierContactNumber || '-' },
    { key: 'lat', label: 'Latitude', children: sensor.lat ? sensor.lat.toString() : '-' },
    { key: 'long', label: 'Longitude', children: sensor.long ? sensor.long.toString() : '-' },
    { key: 'remarks', label: 'Remarks', children: sensor.remarks || '-' },
    { key: 'hubName', label: 'Connected Hub', children: sensor.hub?.name || '-' },
    { key: 'facilityName', label: 'Facility', children: sensor.facility?.name || '-' },
  ];

  const superAdminDescriptionsItems = [
    { key: 'name', label: 'Sensor Name', children: sensor.name || '-' },
    { key: 'serialNumber', label: 'Serial Number', children: sensor.serialNumber || '-' },
    { key: 'sensorType', label: 'Sensor Type', children: formatEnum(sensor.sensorType) || '-' },
    { key: 'description', label: 'Description', children: sensor.description || '-' },
    { key: 'sensorStatus', label: 'Sensor Status', children: getStatusTag(sensor.sensorStatus) },
    { key: 'acquisitionDate', label: 'Acquisition Date', children: moment(sensor.acquisitionDate).format('MMMM D, YYYY') },
    {
      key: 'lastCalibratedDate',
      label: 'Last Calibrated Date',
      children: sensor.lastCalibratedDate ? moment(sensor.lastCalibratedDate).format('MMMM D, YYYY') : '-',
    },
    {
      key: 'calibrationFrequencyDays',
      label: 'Calibration Frequency (days)',
      children: sensor.calibrationFrequencyDays ? `${sensor.calibrationFrequencyDays} days` : '-',
    },
    {
      key: 'lastMaintenanceDate',
      label: 'Last Maintenance Date',
      children: sensor.lastMaintenanceDate ? moment(sensor.lastMaintenanceDate).format('MMMM D, YYYY') : '-',
    },
    {
      key: 'nextMaintenanceDate',
      label: 'Next Maintenance Date',
      children: sensor.nextMaintenanceDate ? moment(sensor.nextMaintenanceDate).format('MMMM D, YYYY') : '-',
    },
    {
      key: 'dataFrequencyMinutes',
      label: 'Data Frequency (minutes)',
      children: sensor.dataFrequencyMinutes ? `${sensor.dataFrequencyMinutes} minutes` : '-',
    },
    { key: 'sensorUnit', label: 'Sensor Unit', children: formatEnum(sensor.sensorUnit) || '-' },
    { key: 'supplier', label: 'Supplier', children: sensor.supplier || '-' },
    { key: 'supplierContactNumber', label: 'Supplier Contact Number', children: sensor.supplierContactNumber || '-' },
    { key: 'lat', label: 'Latitude', children: sensor.lat ? sensor.lat.toString() : '-' },
    { key: 'long', label: 'Longitude', children: sensor.long ? sensor.long.toString() : '-' },
    { key: 'remarks', label: 'Remarks', children: sensor.remarks || '-' },
    { key: 'hubName', label: 'Connected Hub', children: sensor.hub?.name || '-' },
    { key: 'parkName', label: 'Park Name', children: sensor.park?.name || '-' },
    { key: 'facilityName', label: 'Facility', children: sensor.facility?.name || '-' },
  ];

  return (
    <div>
      <Descriptions
        items={user?.role === StaffType.SUPERADMIN ? superAdminDescriptionsItems : descriptionsItems}
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
