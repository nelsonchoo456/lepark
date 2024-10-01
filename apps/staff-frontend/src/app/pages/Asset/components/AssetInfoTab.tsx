import { Descriptions, Spin, Tag } from 'antd';
import { ParkAssetResponse, ParkAssetStatusEnum, StaffResponse, StaffType } from '@lepark/data-access';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useAuth } from '@lepark/common-ui';
import { DescriptionsItemType } from 'antd/es/descriptions';

const AssetInformationTab = ({ asset }: { asset: ParkAssetResponse }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth<StaffResponse>();
  useEffect(() => {
    // You can add any additional data fetching here if needed
    setLoading(false);
  }, [asset]);

  const formatEnumLabel = (enumValue: string, enumType: 'type' | 'status' | 'condition'): string => {
    const words = enumValue.split('_');

    if (enumType === 'type' || enumType === 'condition') {
      return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    } else {
      return words.map((word) => word.toUpperCase()).join(' ');
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case ParkAssetStatusEnum.AVAILABLE:
        return <Tag color="green">AVAILABLE</Tag>;
      case ParkAssetStatusEnum.IN_USE:
        return <Tag color="blue">IN USE</Tag>;
      case ParkAssetStatusEnum.UNDER_MAINTENANCE:
        return <Tag color="orange">UNDER MAINTENANCE</Tag>;
      case ParkAssetStatusEnum.DECOMMISSIONED:
        return <Tag color="red">DECOMMISSIONED</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };
  console.log(asset);

  const baseDescriptionsItems = [
    { key: 'name', label: 'Asset Name', children: asset.name },
    { key: 'serialNumber', label: 'Serial Number', children: asset.serialNumber },
    { key: 'parkAssetType', label: 'Asset Type', children: formatEnumLabel(asset.parkAssetType, 'type') },
    { key: 'description', label: 'Description', children: asset.description || '-' },
    { key: 'parkAssetStatus', label: 'Status', children: getStatusTag(asset.parkAssetStatus) },
    { key: 'parkAssetCondition', label: 'Asset Condition', children: formatEnumLabel(asset.parkAssetCondition, 'condition') },
    { key: 'acquisitionDate', label: 'Acquisition Date', children: moment(asset.acquisitionDate).format('MMMM D, YYYY') },
    { key: 'supplier', label: 'Supplier', children: asset.supplier },
    { key: 'supplierContactNumber', label: 'Supplier Contact', children: asset.supplierContactNumber },
    { key: 'remarks', label: 'Remarks', children: asset.remarks || '-' },
  ];

  const conditionalItems = [
    asset.lastMaintenanceDate && {
      key: 'lastMaintenanceDate',
      label: 'Last Maintenance Date',
      children: moment(asset.lastMaintenanceDate).format('MMMM D, YYYY'),
    },
    asset.nextMaintenanceDate && {
      key: 'nextMaintenanceDate',
      label: 'Next Maintenance Date',
      children: moment(asset.nextMaintenanceDate).format('MMMM D, YYYY'),
    },
    asset.facility?.name && {
      key: 'facility',
      label: 'Facility',
      children: asset.facility.name,
    },
  ].filter(Boolean);

  const descriptionsItems = [...baseDescriptionsItems, ...conditionalItems];

  const superAdminDescriptionsItems = [
    ...descriptionsItems,
    { key: 'park', label: 'Park', children: asset.parkName },
  ];

  if (loading) {
    return <Spin />;
  }

  return (
    <div>
      <Descriptions
        items={(user?.role === StaffType.SUPERADMIN ? superAdminDescriptionsItems : descriptionsItems) as DescriptionsItemType[]}
        bordered
        column={1}
        size="middle"
      />
    </div>
  );
};

export default AssetInformationTab;
