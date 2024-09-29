import React from 'react';
import { Descriptions, Divider, Tag } from 'antd';
import { HubResponse, HubStatusEnum } from '@lepark/data-access';
import moment from 'moment';

interface InformationTabProps {
  hub: HubResponse;
}

const InformationTab: React.FC<InformationTabProps> = ({ hub }) => {
  const getStatusTag = (status: HubStatusEnum) => {
    const statusColors = {
      ACTIVE: 'green',
      INACTIVE: 'orange',
      UNDER_MAINTENANCE: 'gold',
      DECOMMISSIONED: 'red',
    };
    return <Tag color={statusColors[status]}>{status}</Tag>;
  };

  const descriptionsItems = [
    { key: 'serialNumber', label: 'Serial Number', children: hub.serialNumber || '-' },
    { key: 'name', label: 'Hub Name', children: hub.name || '-' },
    { key: 'description', label: 'Description', children: hub.description || '-' },
    { key: 'hubStatus', label: 'Hub Status', children: getStatusTag(hub.hubStatus) },
    { key: 'acquisitionDate', label: 'Acquisition Date', children: moment(hub.acquisitionDate).format('MMMM D, YYYY') },
    {
      key: 'lastMaintenanceDate',
      label: 'Last Maintenance Date',
      children: hub.lastMaintenanceDate ? moment(hub.lastMaintenanceDate).format('MMMM D, YYYY') : '-',
    },
    {
      key: 'nextMaintenanceDate',
      label: 'Next Maintenance Date',
      children: hub.nextMaintenanceDate ? moment(hub.nextMaintenanceDate).format('MMMM D, YYYY') : '-',
    },
    {
      key: 'dataTransmissionInterval',
      label: 'Data Transmission Interval',
      children: hub.dataTransmissionInterval ? `${hub.dataTransmissionInterval} minutes` : '-',
    },
    { key: 'supplier', label: 'Supplier', children: hub.supplier },
    { key: 'supplierContactNumber', label: 'Supplier Contact Number', children: hub.supplierContactNumber },
    { key: 'ipAddress', label: 'IP Address', children: hub.ipAddress || '-' },
    { key: 'macAddress', label: 'MAC Address', children: hub.macAddress || '-' },
    { key: 'lat', label: 'Latitude', children: hub.lat || '-' },
    { key: 'long', label: 'Longitude', children: hub.long || '-' },
    { key: 'remarks', label: 'Remarks', children: hub.remarks || '-' },
    { key: 'zoneName', label: 'Zone Name', children: hub.zoneName || '-' },
    { key: 'facilityName', label: 'Facility Name', children: hub.facilityName || '-' },
    { key: 'parkName', label: 'Park Name', children: hub.parkName || '-' },
  ];

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
