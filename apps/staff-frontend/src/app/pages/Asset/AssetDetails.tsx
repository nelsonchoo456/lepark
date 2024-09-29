import { useNavigate, useParams } from 'react-router-dom';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { Card, Descriptions, Tabs, Tag, Spin, Carousel, Empty } from 'antd';

import { FaTools, FaLeaf, FaWrench } from 'react-icons/fa';
import moment from 'moment';
import { ParkAssetTypeEnum, ParkAssetStatusEnum, ParkAssetConditionEnum, ParkAssetResponse, getParkAssetById, StaffResponse, StaffType } from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import AssetInfoTab from './components/AssetInfoTab';
import { useEffect, useState } from 'react';
import { useRestrictAsset } from '../../hooks/Asset/useRestrictAsset';
import { useAuth } from '@lepark/common-ui'; // Add this import

const AssetDetails = () => {
  const { assetId = '' } = useParams<{ assetId: string }>();
  const { asset, loading, notFound } = useRestrictAsset(assetId);
  const { user } = useAuth<StaffResponse>(); // Add this line to get the current user
  console.log(asset);
  const navigate = useNavigate();

  const formatEnumLabel = (enumValue: string, enumType: 'type' | 'status' | 'condition'): string => {
    const words = enumValue.split('_');

    if (enumType === 'type' || enumType === 'condition') {
      return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    } else {
      return words.map((word) => word.toUpperCase()).join(' ');
    }
  };

  const descriptionsItems = [
    {
      key: 'serialNumber',
      label: 'Serial Number',
      children: asset ? asset.serialNumber : 'Loading...',
    },
    {
      key: 'assetType',
      label: 'Asset Type',
      children: asset ? formatEnumLabel(asset.parkAssetType, 'type') : 'Loading...',
    },
    {
      key: 'assetStatus',
      label: 'Status',
      children:
        asset?.parkAssetStatus === ParkAssetStatusEnum.AVAILABLE ? (
          <Tag color="green">AVAILABLE</Tag>
        ) : asset?.parkAssetStatus === ParkAssetStatusEnum.IN_USE ? (
          <Tag color="blue">IN USE</Tag>
        ) : asset?.parkAssetStatus === ParkAssetStatusEnum.UNDER_MAINTENANCE ? (
          <Tag color="orange">UNDER MAINTENANCE</Tag>
        ) : asset?.parkAssetStatus === ParkAssetStatusEnum.DECOMMISSIONED ? (
          <Tag color="red">DECOMMISSIONED</Tag>
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
    ...(user?.role === StaffType.SUPERADMIN ? [
      {
        key: 'park',
        label: 'Park',
        children: asset ? asset.parkName : 'Loading...',
      },
    ] : []),
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
  ];

  const breadcrumbItems = [
    {
      title: 'Park Asset Management',
      pathKey: '/parkasset',
      isMain: true,
    },
    {
      title: asset?.name ? asset.name : 'Details',
      pathKey: `/assets/${asset?.id}`,
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
            <Descriptions items={descriptionsItems} column={1} size="small" />

            <div className="flex h-24 w-full gap-2 mt-auto">
              {/* Asset type, maintenance, and condition info can be added here if needed */}
            </div>
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
