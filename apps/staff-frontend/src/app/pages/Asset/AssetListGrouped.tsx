import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Button, Input, Space, Table, Layout, Row, Col, Dropdown, Modal, Flex, Tag, notification, message, Tooltip, Card } from 'antd';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { getAllParkAssets, ParkAssetConditionEnum,ParkAssetResponse, StaffResponse, StaffType, ParkAssetStatusEnum } from '@lepark/data-access';
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
  const [parkAssets, setParkAssets] = useState<ParkAssetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const notificationShown = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.role !== StaffType.MANAGER && user?.role !== StaffType.SUPERADMIN && user?.role !== StaffType.LANDSCAPE_ARCHITECT && user?.role !== StaffType.PARK_RANGER) {
      if (!notificationShown.current) {
        notification.error({
          message: 'Access Denied',
          description: 'You are not allowed to access the Park Asset Management page!',
        });
        notificationShown.current = true;
      }
      navigate('/');
    } else {
      fetchParkAssetData();
    }
  }, [user, navigate]);

  const fetchParkAssetData = async () => {
     setLoading(true);
  try {
    let response;
    if (user?.role === StaffType.SUPERADMIN) {
      response = await getAllParkAssets();
    } else if ([StaffType.MANAGER, StaffType.LANDSCAPE_ARCHITECT, StaffType.PARK_RANGER].includes(user?.role as StaffType)) {
      if (!user?.parkId) {
        throw new Error('User park ID not found');
      }
      response = await getAllParkAssets(user.parkId);
    } else {
      throw new Error('Unauthorized access');
    }
    setParkAssets(response.data);
  } catch (error) {
    console.error('Error fetching park asset data:', error);
    message.error('Failed to fetch park assets');
  } finally {
    setLoading(false);
  }// ... (keep the fetchParkAssetData function as it is in AssetList.tsx)
  };

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
            onClick={() => {
              switch(record.status) {
                case ParkAssetStatusEnum.AVAILABLE:
                  navigate('/parkasset/available');
                  break;
                case ParkAssetStatusEnum.IN_USE:
                  navigate('/parkasset/inuse');
                  break;
                case ParkAssetStatusEnum.UNDER_MAINTENANCE:
                  navigate('/parkasset/undermaintenance');
                  break;
                case ParkAssetStatusEnum.DECOMMISSIONED:
                  navigate('/parkasset/decommissioned');
                  break;
                default:
                  navigate('/parkasset/viewall');
              }
            }}
          />
        </Tooltip>
      </Flex>
    ),
    width: '20%',
  },
];

  return (
     <ContentWrapperDark>
    <PageHeader>Park Asset Overview</PageHeader>
    <Flex justify="end" gap={10}>
      <Input
        suffix={<FiSearch />}
        placeholder="Search by status..."
        onChange={handleSearchBar}
        className="mb-4 bg-white"
        variant="filled"
      />
      <Button type="primary"  onClick={() => navigate('/parkasset/viewall')}>
        View All Assets
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
