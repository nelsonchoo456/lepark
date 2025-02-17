import { useAuth } from '@lepark/common-ui';
import { SensorResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { Descriptions, Tag } from 'antd';
import { DescriptionsItemType } from 'antd/es/descriptions';
import moment from 'moment';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const InformationTab = ({ sensor }: { sensor: SensorResponse }) => {
  const { user } = useAuth<StaffResponse>();

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Tag color="green" bordered={false}>
            {formatEnumLabelToRemoveUnderscores(status)}
          </Tag>
        );
      case 'INACTIVE':
        return (
          <Tag color="blue" bordered={false}>
            {formatEnumLabelToRemoveUnderscores(status)}
          </Tag>
        );
      case 'UNDER_MAINTENANCE':
        return (
          <Tag color="yellow" bordered={false}>
            {formatEnumLabelToRemoveUnderscores(status)}
          </Tag>
        );
      case 'DECOMMISSIONED':
        return (
          <Tag color="red" bordered={false}>
            {formatEnumLabelToRemoveUnderscores(status)}
          </Tag>
        );
      default:
        return <Tag>{formatEnumLabelToRemoveUnderscores(status)}</Tag>;
    }
  };

  const baseDescriptionsItems = [
    { key: 'name', label: 'Sensor Name', children: sensor.name || '-' },
    { key: 'identifierNumber', label: 'Identifier Number', children: sensor.identifierNumber || '-' },
    { key: 'serialNumber', label: 'Serial Number', children: sensor.serialNumber || '-' },
    { key: 'sensorType', label: 'Sensor Type', children: formatEnumLabelToRemoveUnderscores(sensor.sensorType) || '-' },
    { key: 'description', label: 'Description', children: sensor.description || '-' },
    { key: 'sensorStatus', label: 'Sensor Status', children: getStatusTag(sensor.sensorStatus) },
    { key: 'acquisitionDate', label: 'Acquisition Date', children: moment(sensor.acquisitionDate).format('MMMM D, YYYY') },
    { key: 'sensorUnit', label: 'Sensor Unit', children: formatEnumLabelToRemoveUnderscores(sensor.sensorUnit) || '-' },
    { key: 'supplier', label: 'Supplier', children: sensor.supplier || '-' },
    { key: 'supplierContactNumber', label: 'Supplier Contact Number', children: sensor.supplierContactNumber || '-' },
    { key: 'remarks', label: 'Remarks', children: sensor.remarks || '-' },
    { key: 'hubName', label: 'Connected Hub', children: sensor.hub?.name || '-' },
    user?.role === StaffType.SUPERADMIN ? { key: 'parkName', label: 'Park', children: sensor.park?.name || '-' } : null,
    { key: 'facilityName', label: 'Facility', children: sensor.facility?.name || '-' },
  ].filter(Boolean);

  const conditionalItems = [
    sensor.nextMaintenanceDate && {
      key: 'nextMaintenanceDate',
      label: 'Next Maintenance Date',
      children: moment(sensor.nextMaintenanceDate).format('MMMM D, YYYY'),
    },
    sensor.lat && { key: 'lat', label: 'Latitude', children: sensor.lat.toString() },
    sensor.long && { key: 'long', label: 'Longitude', children: sensor.long.toString() },
  ].filter(Boolean);

  const descriptionsItems = [...baseDescriptionsItems, ...conditionalItems];

  return (
    <div>
      <Descriptions
        items={descriptionsItems as DescriptionsItemType[]}
        bordered
        column={1}
        size="middle"
        labelStyle={{ width: '40%' }}
        contentStyle={{ width: '60%' }}
        style={{ marginBottom: '8px' }}
      />
    </div>
  );
};

export default InformationTab;
