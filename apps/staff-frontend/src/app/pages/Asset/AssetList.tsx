import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Button, Input, Space, Table, Layout, Row, Col, Dropdown, Modal, Flex, Tag, notification, message, Tooltip, Card } from 'antd';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { deleteParkAsset, getAllParkAssets, ParkAssetResponse, StaffResponse, StaffType, ParkAssetTypeEnum, ParkAssetStatusEnum, ParkAssetConditionEnum } from '@lepark/data-access';
import PageHeader from '../../components/main/PageHeader';
import { SCREEN_LG } from '../../config/breakpoints';
import { FiEye, FiSearch } from 'react-icons/fi';
import { RiEdit2Line } from 'react-icons/ri';
import { MdDeleteOutline } from 'react-icons/md';
import { ColumnsType } from 'antd/es/table';

const formatEnumLabel = (enumValue: string, enumType: 'type' | 'status' | 'condition'): string => {
  const words = enumValue.split('_');

  if (enumType === 'type' || enumType === 'condition') {
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  } else {
    return words.map(word => word.toUpperCase()).join(' ');
  }
};

const ParkAssetManagementPage: React.FC = () => {
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
  }, [user, navigate]); // Added 'navigate' to the dependency array

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
  }
};

// ... rest of the code remains the same

const filteredParkAssets = useMemo(() => {
  return parkAssets.filter((asset) => {
    return Object.values(asset).some((value) =>
      value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
}, [parkAssets, searchQuery]);

  const handleSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDelete = async (id: string) => {
    try {
      const confirmed = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: 'Confirm Deletion?',
          content: 'Deleting an Asset cannot be undone. Are you sure you want to proceed?',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
          okText: "Confirm Delete",
          okButtonProps: { danger: true }
        });
      });

      if (!confirmed) return;

      await deleteParkAsset(id);
      setParkAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== id));
      message.success('Asset deleted successfully');
    } catch (error) {
      console.error('Error deleting asset:', error);
      message.error('Failed to delete asset. Please try again.');
    }
  };

  const columns: ColumnsType<ParkAssetResponse> = [
    {
      title: 'Name',
      dataIndex: 'parkAssetName',
      key: 'parkAssetName',
      sorter: (a: ParkAssetResponse, b: ParkAssetResponse) => a.parkAssetName.localeCompare(b.parkAssetName),
      width: '20%',
    },
    {
      title: 'Type',
      dataIndex: 'parkAssetType',
      key: 'parkAssetType',
      filters: Object.values(ParkAssetTypeEnum).map((type) => ({ text: formatEnumLabel(type, 'type'), value: type })),
      onFilter: (value, record) => record.parkAssetType === value,
      render: (type: string) => formatEnumLabel(type, 'type'),
      width: '15%',
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
      title: 'Condition',
      dataIndex: 'parkAssetCondition',
      key: 'parkAssetCondition',
      filters: Object.values(ParkAssetConditionEnum).map((condition) => ({ text: formatEnumLabel(condition, 'condition'), value: condition })),
      onFilter: (value, record) => record.parkAssetCondition === value,
      render: (condition: string) => formatEnumLabel(condition, 'condition'),
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: React.ReactNode, record: ParkAssetResponse) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`${record.id}`)} />
          </Tooltip>
          {user && (user.role === StaffType.MANAGER || user.role === StaffType.SUPERADMIN) && (
            <>
              <Tooltip title="Edit Asset">
                <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`edit/${record.id}`)} />
              </Tooltip>
              <Tooltip title="Delete Asset">
                <Button danger type="link" icon={<MdDeleteOutline className="text-error" />} onClick={() => handleDelete(record.id)} />
              </Tooltip>
            </>
          )}
        </Flex>
      ),
      width: '20%',
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader>Park Asset Management</PageHeader>
      <Flex justify="end" gap={10}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search in Park Assets..."
          onChange={handleSearchBar}
          className="mb-4 bg-white"
          variant="filled"
        />
        {user && (user.role === StaffType.MANAGER || user.role === StaffType.SUPERADMIN) && (
          <Button type="primary" onClick={() => navigate('create')}>
            Create Park Asset
          </Button>
        )}
      </Flex>
      <Card>
        <Table
          columns={columns}
          dataSource={filteredParkAssets}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: SCREEN_LG }}
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default ParkAssetManagementPage;
