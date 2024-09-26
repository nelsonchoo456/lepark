import { Descriptions, Spin } from 'antd';
import { ParkAssetResponse } from '@lepark/data-access';
import moment from 'moment';
import { useEffect, useState } from 'react';

const AssetInformationTab = ({ asset }: { asset: ParkAssetResponse }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // You can add any additional data fetching here if needed
    setLoading(false);
  }, [asset]);

  const formatEnumLabel = (enumValue: string, enumType: 'type' | 'status' | 'condition'): string => {
  const words = enumValue.split('_');

  if (enumType === 'type' || enumType === 'condition') {
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  } else {
    return words.map(word => word.toUpperCase()).join(' ');
  }
};

  const descriptionsItems = [
    { key: 'parkAssetName', label: 'Asset Name', children: asset.parkAssetName },
    { key: 'parkAssetType', label: 'Asset Type', children: formatEnumLabel(asset.parkAssetType, 'type') },
    { key: 'parkAssetDescription', label: 'Description', children: asset.parkAssetDescription || 'N/A' },
    { key: 'parkAssetStatus', label: 'Status', children: formatEnumLabel(asset.parkAssetStatus, 'status') },
    { key: 'acquisitionDate', label: 'Acquisition Date', children: moment(asset.acquisitionDate).format('MMMM D, YYYY') },
    { key: 'recurringMaintenanceDuration', label: 'Maintenance Cycle (days)', children: asset.recurringMaintenanceDuration },
    { key: 'lastMaintenanceDate', label: 'Last Maintenance Date', children: moment(asset.lastMaintenanceDate).format('MMMM D, YYYY') },
    { key: 'nextMaintenanceDate', label: 'Next Maintenance Date', children: moment(asset.nextMaintenanceDate).format('MMMM D, YYYY') },
    { key: 'supplier', label: 'Supplier', children: asset.supplier },
    { key: 'supplierContactNumber', label: 'Supplier Contact', children: asset.supplierContactNumber },
    { key: 'parkAssetCondition', label: 'Asset Condition', children: formatEnumLabel(asset.parkAssetCondition, 'condition') },
    { key: 'remarks', label: 'Remarks', children: asset.remarks || 'N/A' },
  ];

  if (loading) {
    return <Spin />;
  }

  return (
    <div>
      <Descriptions items={descriptionsItems} bordered column={1} size="middle" />
    </div>
  );
};

export default AssetInformationTab;
