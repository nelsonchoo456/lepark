import React, { useMemo, useState } from 'react';
import { Button, Input, Table, Flex, Tag, message, Tooltip, Card } from 'antd';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { ParkAssetResponse, StaffResponse, StaffType, ParkAssetStatusEnum } from '@lepark/data-access';
import { useFetchAssets } from '../../hooks/Asset/useFetchAssets';
import PageHeader from '../../components/main/PageHeader';
import { SCREEN_LG } from '../../config/breakpoints';
import { FiEye, FiSearch } from 'react-icons/fi';
import { ColumnsType } from 'antd/es/table';

const formatEnumLabel = (enumValue: string): string => {
  const words = enumValue.split('_');
  return words.map(word => word.toUpperCase()).join(' ');
};

interface GroupedAssetData {
  status: ParkAssetStatusEnum;
  count: number;
}

const AssetListGrouped: React.FC = () => {
  const { user } = useAuth<StaffResponse>();
  const { assets: parkAssets, loading } = useFetchAssets();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const groupedAssetData = useMemo(() => {
    const groupedData: GroupedAssetData[] = Object.values(ParkAssetStatusEnum).map(status => ({
      status,
      count: parkAssets.filter(asset => asset.parkAssetStatus === status).length,
    }));
    return groupedData;
  }, [parkAssets]);

  const filteredGroupedAssetData = useMemo(() => {
    return groupedAssetData.filter((group) =>
      formatEnumLabel(group.status).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [groupedAssetData, searchQuery]);

  const handleSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

    const getRouteForStatus = (status: ParkAssetStatusEnum): string => {
    switch (status) {
      case ParkAssetStatusEnum.AVAILABLE:
        return '/parkasset/available';
      case ParkAssetStatusEnum.IN_USE:
        return '/parkasset/inuse';
      case ParkAssetStatusEnum.UNDER_MAINTENANCE:
        return '/parkasset/undermaintenance';
      case ParkAssetStatusEnum.DECOMMISSIONED:
        return '/parkasset/decommissioned';
      default:
        return '/parkasset/viewall';
    }
  };


  const columns: ColumnsType<GroupedAssetData> = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ParkAssetStatusEnum) => (
        <Tag color={status === ParkAssetStatusEnum.AVAILABLE ? 'green' : status === ParkAssetStatusEnum.IN_USE ? 'blue' : 'red'} bordered={false}>
          {formatEnumLabel(status)}
        </Tag>
      ),
      width: '15%',
      align: 'left',
    },
    {
      title: <div style={{ textAlign: 'center' }}>Count</div>,
      dataIndex: 'count',
      key: 'count',
      render: (count: number) => <div style={{ textAlign: 'center' }}>{count}</div>,
      width: '15%',
    },
    {
      title: <div style={{ textAlign: 'center' }}>Actions</div>,
      key: 'actions',
      render: (_: React.ReactNode, record: GroupedAssetData) => (
        <Flex justify="center" align="center" style={{ height: '100%' }}>
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<FiEye />}
              onClick={() => navigate(getRouteForStatus(record.status))}
            />
          </Tooltip>
        </Flex>
      ),
      width: '20%',
    },
  ];

  if (!user || ![StaffType.MANAGER, StaffType.SUPERADMIN, StaffType.LANDSCAPE_ARCHITECT, StaffType.PARK_RANGER].includes(user.role as StaffType)) {
    message.error('You are not allowed to access the Park Asset Management page!');
    navigate('/');
    return null;
  }

  return (
    <ContentWrapperDark>
      <PageHeader>Park Asset Management</PageHeader>
      <Flex justify="end" gap={10}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search by status..."
          onChange={handleSearchBar}
          className="mb-4 bg-white"
          variant="filled"
        />
        <Button type="primary" onClick={() => navigate('/parkasset/viewall')}>
          View All Assets
        </Button>
        <Button type="primary" onClick={() => navigate('/parkasset/create')}>
          Create Asset
        </Button>
      </Flex>
      <Card>
        <Table
          columns={columns}
          dataSource={filteredGroupedAssetData}
          rowKey="status"
          loading={loading}
          pagination={false}
          scroll={{ x: SCREEN_LG }}
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default AssetListGrouped;
