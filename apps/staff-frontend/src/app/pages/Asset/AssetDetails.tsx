import { useNavigate, useParams} from 'react-router-dom';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { Card, Descriptions, Tabs, Tag, Spin, Carousel, Empty } from 'antd';

import { FaTools, FaLeaf, FaWrench } from 'react-icons/fa';
import moment from 'moment';
import { ParkAssetTypeEnum, ParkAssetStatusEnum, ParkAssetConditionEnum, ParkAssetResponse, getParkAssetById } from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import AssetInfoTab from './components/AssetInfoTab';
import { useEffect, useState } from 'react';
import { useRestrictAsset } from '../../hooks/Asset/useRestrictAsset';
// import EntityNotFound from '../EntityNotFound.tsx/EntityNotFound';

const AssetDetails = () => {
  const { assetId = '' } = useParams<{ assetId: string }>();
  const { asset, loading, notFound } = useRestrictAsset(assetId);
  const navigate = useNavigate();

  const formatEnumLabel = (enumValue: string, enumType: 'type' | 'status' | 'condition'): string => {
    const words = enumValue.split('_');

    if (enumType === 'type' || enumType === 'condition') {
      return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    } else {
      return words.map(word => word.toUpperCase()).join(' ');
    }
  };

  const descriptionsItems = [
    {
      key: 'assetType',
      label: 'Asset Type',
      children: asset ? formatEnumLabel(asset.parkAssetType, 'type') : 'Loading...',
    },
    {
      key: 'assetStatus',
      label: 'Status',
      children: asset?.parkAssetStatus === ParkAssetStatusEnum.AVAILABLE ? (
        <Tag color="green" bordered={false}>AVAILABLE</Tag>
      ) : asset?.parkAssetStatus === ParkAssetStatusEnum.IN_USE ? (
        <Tag color="blue" bordered={false}>IN USE</Tag>
      ) : asset?.parkAssetStatus === ParkAssetStatusEnum.UNDER_MAINTENANCE ? (
        <Tag color="orange" bordered={false}>UNDER MAINTENANCE</Tag>
      ) : asset?.parkAssetStatus === ParkAssetStatusEnum.DECOMMISSIONED ? (
        <Tag color="red" bordered={false}>DECOMMISSIONED</Tag>
      ) : (
        <Tag bordered={false}>{asset?.parkAssetStatus}</Tag>
      )
    },
    {
      key: 'lastMaintenance',
      label: 'Last Maintenance',
      children: asset ? moment(asset.lastMaintenanceDate).fromNow() : 'Loading...',
    },
     {
      key: 'facilityName',
      label: 'Facility',
      children: asset ? asset.facilityName : 'Loading...',
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
      title: asset?.parkAssetName ? asset.parkAssetName : 'Details',
      pathKey: `/assets/${asset?.id}`,
      isCurrent: true,
    },
  ];

  const getAssetTypeIcon = (assetType: ParkAssetTypeEnum) => {
    switch (assetType) {
      case ParkAssetTypeEnum.EQUIPMENT_RELATED:
        return <FaTools className="text-3xl mt-2 text-blue-500" />;
      case ParkAssetTypeEnum.PLANT_RELATED:
        return <FaLeaf className="text-3xl mt-2 text-green-500" />;
      case ParkAssetTypeEnum.PLANT_TOOL:
        return <FaWrench className="text-3xl mt-2 text-orange-500" />;
      default:
        return <FaTools className="text-3xl mt-2 text-gray-500" />;
    }
  };

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

  if (notFound) {
    // [ ENTITY NOT FOUND MERGE ISSUE ]
    return <></>
    // return <EntityNotFound entityName="Asset" listPath="/parkasset" />;
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
            <LogoText className="text-2xl py-2 m-0">{asset?.parkAssetName}</LogoText>
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