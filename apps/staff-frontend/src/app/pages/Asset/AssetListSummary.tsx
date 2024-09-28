import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Table, Flex, Tag, message, Tooltip, Card, Statistic, Badge, Collapse, Tabs } from 'antd';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import {
  ParkAssetResponse,
  StaffResponse,
  StaffType,
  ParkAssetStatusEnum,
  ParkAssetTypeEnum,
  ParkAssetConditionEnum,
} from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import { useFetchAssets } from '../../hooks/Asset/useFetchAssets';
import styled from 'styled-components';
import AssetsByTypeTable from './components/AssetsByTypeTable';

const formatEnumLabel = (enumValue: string, enumType: 'type' | 'status' | 'condition'): string => {
  if (enumType === 'status' && enumValue === 'UNDER_MAINTENANCE') {
    return 'MAINTENANCE';
  }
  const words = enumValue.split('_');
  if (enumType === 'type' || enumType === 'condition') {
    return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  } else {
    return words.map((word) => word.toUpperCase()).join(' ');
  }
};

interface GroupedAssetData {
  status: ParkAssetStatusEnum;
  count: number;
}

const TabsNoBottomMargin = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 0px;
  }
`;

const parkAssetTypes = ["PLANT_RELATED", "PLANT_TOOL", "EQUIPMENT_RELATED"];
const parkAssetTypesLabels = [
    { key: "PLANT_RELATED", label: "Plant Related" },
    { key: "PLANT_TOOL", label: "Plant Tool" },
    { key: "EQUIPMENT_RELATED", label: "Equipment Related" }
  ];


type ParkAssetsByType = { [key in typeof parkAssetTypes[number]]: ParkAssetResponse[] };

const AssetListSummary: React.FC = () => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const { assets: parkAssets, loading, triggerFetch } = useFetchAssets();
  const [assetsByType, setAssetsByType] = useState<ParkAssetsByType>({});

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
      children: <AssetsByTypeTable parkAssets={parkAssets} triggerFetch={triggerFetch}/>
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
