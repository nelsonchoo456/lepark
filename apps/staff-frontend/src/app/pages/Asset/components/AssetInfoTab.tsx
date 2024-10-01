import { Descriptions, Spin, Tag } from 'antd';
import { ParkAssetResponse, ParkAssetStatusEnum, StaffResponse, StaffType } from '@lepark/data-access';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useAuth } from '@lepark/common-ui';
import { DescriptionsItemType } from 'antd/es/descriptions';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const AssetInformationTab = ({ asset }: { asset: ParkAssetResponse }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth<StaffResponse>();
  useEffect(() => {
    // You can add any additional data fetching here if needed
    setLoading(false);
  }, [asset]);

  const getStatusTag = (status: string) => {
    switch (status) {
      case ParkAssetStatusEnum.AVAILABLE:
        return <Tag color="green" bordered={false}>{formatEnumLabelToRemoveUnderscores(status)}</Tag>;
      case ParkAssetStatusEnum.IN_USE:
        return <Tag color="blue" bordered={false}>{formatEnumLabelToRemoveUnderscores(status)}</Tag>;
      case ParkAssetStatusEnum.UNDER_MAINTENANCE:
        return <Tag color="yellow" bordered={false}>{formatEnumLabelToRemoveUnderscores(status)}</Tag>;
      case ParkAssetStatusEnum.DECOMMISSIONED:
        return <Tag color="red" bordered={false}>{formatEnumLabelToRemoveUnderscores(status)}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };
  console.log(asset);

  const baseDescriptionsItems = [
    { key: 'name', label: 'Asset Name', children: asset.name },
    { key: 'serialNumber', label: 'Serial Number', children: asset.serialNumber },
    { key: 'parkAssetType', label: 'Asset Type', children: formatEnumLabelToRemoveUnderscores(asset.parkAssetType) },
    { key: 'description', label: 'Description', children: asset.description || '-' },
    { key: 'parkAssetStatus', label: 'Status', children: getStatusTag(asset.parkAssetStatus) },
    { key: 'parkAssetCondition', label: 'Asset Condition', children: formatEnumLabelToRemoveUnderscores(asset.parkAssetCondition) },
    { key: 'acquisitionDate', label: 'Acquisition Date', children: moment(asset.acquisitionDate).format('MMMM D, YYYY') },
    { key: 'supplier', label: 'Supplier', children: asset.supplier },
    { key: 'supplierContactNumber', label: 'Supplier Contact', children: asset.supplierContactNumber },
    { key: 'remarks', label: 'Remarks', children: asset.remarks || '-' },
  ];

  const conditionalItems = [
    // asset.lastMaintenanceDate && {
    //   key: 'lastMaintenanceDate',
    //   label: 'Last Maintenance Date',
    //   children: moment(asset.lastMaintenanceDate).format('MMMM D, YYYY'),
    // },
    // asset.nextMaintenanceDate && {
    //   key: 'nextMaintenanceDate',
    //   label: 'Next Maintenance Date',
    //   children: moment(asset.nextMaintenanceDate).format('MMMM D, YYYY'),
    // },
    user?.role === StaffType.SUPERADMIN && {
      key: 'park',
      label: 'Park',
      children: asset.parkName,
    },
    asset.facility?.name && {
      key: 'facility',
      label: 'Facility',
      children: asset.facility.name,
    }
  ].filter(Boolean);

  const descriptionsItems = [...baseDescriptionsItems, ...conditionalItems];

  if (loading) {
    return <Spin />;
  }

  return (
    <div>
      <Descriptions
        items={(descriptionsItems) as DescriptionsItemType[]}
        bordered
        column={1}
        size="middle"
      />
    </div>
  );
};

export default AssetInformationTab;
