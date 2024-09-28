import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import {
  ParkAssetResponse,
  StaffResponse,
} from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import { useFetchAssets } from '../../hooks/Asset/useFetchAssets';
import styled from 'styled-components';
import AssetsByTypeTable from './components/AssetsByTypeTable';
import { ParkAssetTypeEnum } from '@lepark/data-access';

const TabsNoBottomMargin = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 0px;
  }
`;

export const parkAssetTypes = [ParkAssetTypeEnum.PLANT_TOOL_AND_EQUIPMENT, ParkAssetTypeEnum.HOSES_AND_PIPES, ParkAssetTypeEnum.INFRASTRUCTURE,
  ParkAssetTypeEnum.LANDSCAPING,
  ParkAssetTypeEnum.GENERAL_TOOLS,
  ParkAssetTypeEnum.SAFETY,
  ParkAssetTypeEnum.DIGITAL,
  ParkAssetTypeEnum.EVENT];
export const parkAssetTypesLabels = [
    { key: ParkAssetTypeEnum.PLANT_TOOL_AND_EQUIPMENT, label: "Plant Tool and Equipment" },
    { key: ParkAssetTypeEnum.HOSES_AND_PIPES, label: "Hoses and Pipes" },
    { key: ParkAssetTypeEnum.INFRASTRUCTURE, label: "Infrastructure" },
    { key: ParkAssetTypeEnum.LANDSCAPING, label: "Landscaping" },
    { key: ParkAssetTypeEnum.GENERAL_TOOLS, label: "General Tools" },
    { key: ParkAssetTypeEnum.SAFETY, label: "Safety" },
    { key: ParkAssetTypeEnum.DIGITAL, label: "Digital" },
    { key: ParkAssetTypeEnum.EVENT, label: "Event" }
  ];


type ParkAssetsByType = { [key in typeof parkAssetTypes[number]]: ParkAssetResponse[] };

const AssetListSummary: React.FC = () => {
  const { user } = useAuth<StaffResponse>();
  const { assets: parkAssets, triggerFetch } = useFetchAssets();
  const [assetsByType, setAssetsByType] = useState<ParkAssetsByType>(() => {
    return parkAssetTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as ParkAssetsByType);
  });

  useEffect(() => {
    if (parkAssets && parkAssets.length > 0) {
      const parkAssetsByType: ParkAssetsByType = parkAssetTypes.reduce((acc, type) => {
          acc[type] = parkAssets.filter(asset => asset.parkAssetType === type) || [];
          return acc;
      }, {} as ParkAssetsByType);

      setAssetsByType(parkAssetsByType);
    }
  }, [parkAssets])

  const assetTypeTabItems = [
    {
      key: "all",
      label: <LogoText>All</LogoText>,
      children: <AssetsByTypeTable parkAssets={parkAssets} triggerFetch={triggerFetch} tableShowTypeColumn/>
    },
    ...parkAssetTypesLabels.map((assetType) => ({
      key: assetType.key,
      label: assetType.label,
      children: <AssetsByTypeTable parkAssets={assetsByType[assetType.key]} triggerFetch={triggerFetch}/>
    }))
  ]
  
  const breadcrumbItems = [
    { title: 'Park Asset Management', pathKey: '/parkasset', isMain: true, isCurrent: true },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <TabsNoBottomMargin 
        items={assetTypeTabItems}
        type="card"
      />
      
    </ContentWrapperDark>
  );
};

export default AssetListSummary;
