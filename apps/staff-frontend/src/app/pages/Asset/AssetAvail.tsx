import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Button, Input, Table, Flex, Tag, notification, message, Tooltip, Card } from 'antd';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { getAllParkAssets, ParkAssetResponse, StaffResponse, StaffType, ParkAssetTypeEnum, ParkAssetStatusEnum, ParkAssetConditionEnum } from '@lepark/data-access';
import PageHeader from '../../components/main/PageHeader';
import { SCREEN_LG } from '../../config/breakpoints';
import { FiEye, FiSearch } from 'react-icons/fi';
import { RiEdit2Line } from 'react-icons/ri';
import { ColumnsType } from 'antd/es/table';
import PageHeader2 from '../../components/main/PageHeader2';

const formatEnumLabel = (enumValue: string, enumType: 'type' | 'status' | 'condition'): string => {
  const words = enumValue.split('_');

  if (enumType === 'type' || enumType === 'condition') {
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  } else {
    return words.map(word => word.toUpperCase()).join(' ');
  }
};

const AssetAvail: React.FC = () => {
  const { user } = useAuth<StaffResponse>();
  const [availableAssets, setAvailableAssets] = useState<ParkAssetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const notificationShown = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');

  const breadcrumbItems = [
    {
      title: 'Park Asset Overview',
      pathKey: '/parkasset',
      isMain: true,
    },
    {
      title: 'Available Park Assets',
      pathKey: '/parkasset/available',
      isCurrent: true,
    },
  ];

  useEffect(() => {
    if (user?.role !== StaffType.MANAGER && user?.role !== StaffType.SUPERADMIN && user?.role !== StaffType.LANDSCAPE_ARCHITECT && user?.role !== StaffType.PARK_RANGER) {
      if (!notificationShown.current) {
        notification.error({
          message: 'Access Denied',
          description: 'You are not allowed to access the Available Park Assets page!',
        });
        notificationShown.current = true;
      }
      navigate('/');
    } else {
      fetchAvailableAssetData();
    }
  }, [user, navigate]);

  const fetchAvailableAssetData = async () => {
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
      const availableAssets = response.data.filter(asset => asset.parkAssetStatus === ParkAssetStatusEnum.AVAILABLE);
      setAvailableAssets(availableAssets);
    } catch (error) {
      console.error('Error fetching available park asset data:', error);
      message.error('Failed to fetch available park assets');
    } finally {
      setLoading(false);
    }
  };

  const filteredAvailableAssets = useMemo(() => {
    return availableAssets.filter((asset) => {
      return Object.values(asset).some((value) =>
        value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [availableAssets, searchQuery]);

  const handleSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const columns: ColumnsType<ParkAssetResponse> = [
    {
      title: 'Name',
      dataIndex: 'parkAssetName',
      key: 'parkAssetName',
      sorter: (a: ParkAssetResponse, b: ParkAssetResponse) => a.parkAssetName.localeCompare(b.parkAssetName),
      width: '25%',
    },
    {
      title: 'Type',
      dataIndex: 'parkAssetType',
      key: 'parkAssetType',
      filters: Object.values(ParkAssetTypeEnum).map((type) => ({ text: formatEnumLabel(type, 'type'), value: type })),
      onFilter: (value, record) => record.parkAssetType === value,
      render: (type: string) => formatEnumLabel(type, 'type'),
      width: '20%',
    },
    {
      title: 'Condition',
      dataIndex: 'parkAssetCondition',
      key: 'parkAssetCondition',
      filters: Object.values(ParkAssetConditionEnum).map((condition) => ({ text: formatEnumLabel(condition, 'condition'), value: condition })),
      onFilter: (value, record) => record.parkAssetCondition === value,
      render: (condition: string) => formatEnumLabel(condition, 'condition'),
      width: '20%',
    },
       {
     title: 'Status',
     dataIndex: 'parkAssetStatus',
     key: 'parkAssetStatus',
     filters: Object.values(ParkAssetStatusEnum).map((status) => ({ text: formatEnumLabel(status, 'status'), value: status })),
     onFilter: (value, record) => record.parkAssetStatus === value,
     render: (status: string) => (
       <Tag color={status === 'AVAILABLE' ? 'green' : status === 'IN_USE' ? 'blue' : 'red'} bordered={false}>
         {formatEnumLabel(status, 'status')}
       </Tag>
     ),
     width: '15%',
   },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: React.ReactNode, record: ParkAssetResponse) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`/parkasset/${record.id}`)} />
          </Tooltip>
          {user && (user.role === StaffType.MANAGER || user.role === StaffType.SUPERADMIN) && (
            <Tooltip title="Edit Asset">
              <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/parkasset/edit/${record.id}`)} />
            </Tooltip>
          )}
        </Flex>
      ),
      width: '20%',
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Flex justify="end" gap={10}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search in Available Assets..."
          onChange={handleSearchBar}
          className="mb-4 bg-white"
          variant="filled"
        />
        {user && (user.role === StaffType.MANAGER || user.role === StaffType.SUPERADMIN) && (
          <Button type="primary" onClick={() => navigate('/parkasset/create')}>
            Create Park Asset
          </Button>
        )}
      </Flex>
      <Card>
        <Table
          columns={columns}
          dataSource={filteredAvailableAssets}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: SCREEN_LG }}
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default AssetAvail;
