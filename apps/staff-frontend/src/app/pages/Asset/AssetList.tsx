import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Button, Input, Space, Table, Layout, Row, Col, Dropdown, Modal, Flex, Tag, notification, message, Tooltip, Card } from 'antd';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import {
  deleteParkAsset,
  getAllParkAssets,
  ParkAssetResponse,
  StaffResponse,
  StaffType,
  ParkAssetTypeEnum,
  ParkAssetStatusEnum,
  ParkAssetConditionEnum,
} from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import { SCREEN_LG } from '../../config/breakpoints';
import { FiEye, FiSearch } from 'react-icons/fi';
import { RiEdit2Line } from 'react-icons/ri';
import { MdDeleteOutline } from 'react-icons/md';
import { ColumnsType } from 'antd/es/table';
import { useFetchAssets } from '../../hooks/Asset/useFetchAssets';

const formatEnumLabel = (enumValue: string, enumType: 'type' | 'status' | 'condition'): string => {
  const words = enumValue.split('_');

  if (enumType === 'type' || enumType === 'condition') {
    return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  } else {
    return words.map((word) => word.toUpperCase()).join(' ');
  }
};

const ParkAssetManagementPage: React.FC = () => {
  const { user } = useAuth<StaffResponse>();
  const { assets: parkAssets, loading, triggerFetch } = useFetchAssets();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // ... rest of the code remains the same

  const filteredParkAssets = useMemo(() => {
    return parkAssets.filter((asset) => {
      return Object.values(asset).some((value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase()));
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
          okText: 'Confirm Delete',
          okButtonProps: { danger: true },
        });
      });

      if (!confirmed) return;

      await deleteParkAsset(id);
      triggerFetch(); // Refresh the asset list after deletion
      message.success('Asset deleted successfully');
    } catch (error) {
      console.error('Error deleting asset:', error);
      message.error('Failed to delete asset. Please try again.');
    }
  };

  const columns: ColumnsType<ParkAssetResponse> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: ParkAssetResponse, b: ParkAssetResponse) => a.name.localeCompare(b.name),
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
      filters: Object.values(ParkAssetConditionEnum).map((condition) => ({
        text: formatEnumLabel(condition, 'condition'),
        value: condition,
      })),
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
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`/parkasset/${record.id}`)} />
          </Tooltip>
          {user && (user.role === StaffType.MANAGER || user.role === StaffType.SUPERADMIN) && (
            <>
              <Tooltip title="Edit Asset">
                <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/parkasset/edit/${record.id}`)} />
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

  const breadcrumbItems = [
    {
      title: 'Park Asset Management',
      pathKey: '/parkasset',
      isMain: true,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Flex justify="end" gap={10}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search in Park Assets..."
          onChange={handleSearchBar}
          className="mb-4 bg-white"
          variant="filled"
        />
        <Button type="primary" onClick={() => navigate('/parkasset')}>
          View Assets By Status
        </Button>

        <Button type="primary" onClick={() => navigate('/parkasset/create')}>
          Create Park Asset
        </Button>
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
