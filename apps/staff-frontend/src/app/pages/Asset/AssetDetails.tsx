import { useNavigate, useParams } from 'react-router-dom';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { Card, Descriptions, Tabs, Tag, Spin, Carousel, Empty } from 'antd';

import { FaTools, FaLeaf, FaWrench } from 'react-icons/fa';
import moment from 'moment';
import {
  ParkAssetTypeEnum,
  ParkAssetStatusEnum,
  ParkAssetConditionEnum,
  ParkAssetResponse,
  getParkAssetById,
  StaffResponse,
  StaffType,
  FacilityResponse,
} from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import AssetInfoTab from './components/AssetInfoTab';
import { useEffect, useState } from 'react';
import { useRestrictAsset } from '../../hooks/Asset/useRestrictAsset';
import { useAuth } from '@lepark/common-ui'; // Add this import
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import LocationTab from './components/LocationTab';
import { useFetchZones } from '../../hooks/Zones/useFetchZones';
import MaintenanceGraphTabParkAsset from './components/MaintenanceGraphTabParkAsset';

const AssetDetails = () => {
  const { assetId = '' } = useParams<{ assetId: string }>();
  const { asset, park, facility, loading } = useRestrictAsset(assetId);
  const { zones } = useFetchZones();
  const { user } = useAuth<StaffResponse>(); // Add this line to get the current user
  console.log(asset);
  const navigate = useNavigate();

  const descriptionsItems = [
    {
      key: 'identifierNumber',
      label: 'Identifier Number',
      children: asset ? asset.identifierNumber : 'Loading...',
    },
    ...(asset?.nextMaintenanceDate
      ? [
          {
            key: 'maintenanceGraph',
            label: 'Predicted Maintenance Chart',
            children: asset ? <MaintenanceGraphTabParkAsset parkAsset={asset} /> : <p>Loading graph data...</p>,
          },
        ]
      : []),
    {
      key: 'assetType',
      label: 'Asset Type',
      children: asset ? formatEnumLabelToRemoveUnderscores(asset.parkAssetType) : 'Loading...',
    },
    {
      key: 'assetStatus',
      label: 'Status',
      children:
        asset?.parkAssetStatus === ParkAssetStatusEnum.AVAILABLE ? (
          <Tag color="green" bordered={false}>
            {formatEnumLabelToRemoveUnderscores(asset?.parkAssetStatus)}
          </Tag>
        ) : asset?.parkAssetStatus === ParkAssetStatusEnum.IN_USE ? (
          <Tag color="blue" bordered={false}>
            {formatEnumLabelToRemoveUnderscores(asset?.parkAssetStatus)}
          </Tag>
        ) : asset?.parkAssetStatus === ParkAssetStatusEnum.UNDER_MAINTENANCE ? (
          <Tag color="yellow" bordered={false}>
            {formatEnumLabelToRemoveUnderscores(asset?.parkAssetStatus)}
          </Tag>
        ) : asset?.parkAssetStatus === ParkAssetStatusEnum.DECOMMISSIONED ? (
          <Tag color="red" bordered={false}>
            {formatEnumLabelToRemoveUnderscores(asset?.parkAssetStatus)}
          </Tag>
        ) : (
          <Tag>{asset?.parkAssetStatus}</Tag>
        ),
    },
    {
      key: 'nextMaintenance',
      label: 'Next Maintenance',
      children: asset ? (asset.nextMaintenanceDate ? moment(asset.nextMaintenanceDate).format('MMMM D, YYYY') : '-') : 'Loading...',
    },
    // Add park name for Superadmin only
    ...(user?.role === StaffType.SUPERADMIN
      ? [
          {
            key: 'park',
            label: 'Park',
            children: asset ? asset.park?.name : 'Loading...',
          },
        ]
      : []),
    {
      key: 'facility',
      label: 'Facility',
      children: asset ? asset.facility?.name : 'Loading...',
    },
  ];

  const tabsItems = [
    {
      key: 'information',
      label: 'Information',
      children: asset ? <AssetInfoTab asset={asset} /> : <p>Loading asset data...</p>,
    },
    {
      key: 'location',
      label: 'Location',
      children: facility ? <LocationTab facility={facility} zones={zones} park={park} /> : <p>Loading asset data...</p>,
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Park Asset Management',
      pathKey: '/parkasset',
      isMain: true,
    },
    {
      title: asset?.identifierNumber ? asset.identifierNumber : 'Details',
      pathKey: `/parkasset/${asset?.id}`,
      isCurrent: true,
    },
  ];

  // const getAssetTypeIcon = (assetType: ParkAssetTypeEnum) => {
  //   switch (assetType) {
  //     case ParkAssetTypeEnum.PLANT_TOOL_AND_EQUIPMENT:
  //       return <FaTools className="text-3xl mt-2 text-blue-500" />;
  //     case ParkAssetTypeEnum.PLANT_RELATED:
  //       return <FaLeaf className="text-3xl mt-2 text-green-500" />;
  //     case ParkAssetTypeEnum.PLANT_TOOL:
  //       return <FaWrench className="text-3xl mt-2 text-orange-500" />;
  //     default:
  //       return <FaTools className="text-3xl mt-2 text-gray-500" />;
  //   }
  // };

  const getAssetConditionInfo = (condition: ParkAssetConditionEnum) => {
    switch (condition) {
      case ParkAssetConditionEnum.EXCELLENT:
        return { text: 'Excellent', color: 'text-green-600' };
      case ParkAssetConditionEnum.FAIR:
        return { text: 'Fair', color: 'text-yellow-600' };
      case ParkAssetConditionEnum.POOR:
        return { text: 'Poor', color: 'text-orange-600' };
      case ParkAssetConditionEnum.DAMAGED:
        return { text: 'Damaged', color: 'text-red-600' };
      default:
        return { text: 'Unknown', color: 'text-gray-600' };
    }
  };

  if (loading) {
    return (
      <ContentWrapperDark>
        <Card>
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </Card>
      </ContentWrapperDark>
    );
  }

  if (!asset) {
    return null;
  }

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <div className="md:flex w-full gap-4">
          <div className="h-64 flex-1 max-w-full overflow-hidden rounded-lg shadow-lg">
            {asset?.images && asset.images.length > 0 ? (
              <Carousel style={{ maxWidth: '100%' }}>
                {asset.images.map((url) => (
                  <div key={url}>
                    <div
                      style={{
                        backgroundImage: `url('${url}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: 'white',
                        overflow: 'hidden',
                      }}
                      className="h-64 max-h-64 flex-1 rounded-lg shadow-lg p-4"
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <Empty description="No Image" />
              </div>
            )}
          </div>
          <div className="flex-1 flex-col flex">
            <LogoText className="text-2xl py-2 m-0">{asset?.name}</LogoText>
            <Descriptions items={descriptionsItems} column={1} size="small" className="mb-4" />
          </div>
        </div>

        <Tabs
          centered
          defaultActiveKey="information"
          items={tabsItems}
          renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="border-b-[1px] border-gray-400" />}
          className="mt-4"
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default AssetDetails;
