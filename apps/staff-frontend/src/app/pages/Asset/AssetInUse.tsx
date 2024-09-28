import React, { useState, useMemo } from 'react';
import { Button, Input, Table, Flex, Tag, message, Tooltip, Card, Modal } from 'antd';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import {
  deleteParkAsset,
  ParkAssetResponse,
  StaffResponse,
  StaffType,
  ParkAssetTypeEnum,
  ParkAssetStatusEnum,
  ParkAssetConditionEnum,
} from '@lepark/data-access';
import { useFetchAssets } from '../../hooks/Asset/useFetchAssets';
import PageHeader2 from '../../components/main/PageHeader2';
import { SCREEN_LG } from '../../config/breakpoints';
import { FiEye, FiSearch } from 'react-icons/fi';
import { RiEdit2Line } from 'react-icons/ri';
import { ColumnsType } from 'antd/es/table';
import { MdDeleteOutline } from 'react-icons/md';

const formatEnumLabel = (enumValue: string, enumType: 'type' | 'status' | 'condition'): string => {
  const words = enumValue.split('_');
  if (enumType === 'type' || enumType === 'condition') {
    return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  } else {
    return words.map((word) => word.toUpperCase()).join(' ');
  }
};

const AssetInUse: React.FC = () => {
  const { user } = useAuth<StaffResponse>();
  const { assets, loading, triggerFetch } = useFetchAssets();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const inUseAssets = useMemo(() => {
    return assets.filter((asset) => asset.parkAssetStatus === ParkAssetStatusEnum.IN_USE);
  }, [assets]);

  const filteredInUseAssets = useMemo(() => {
    return inUseAssets.filter((asset) =>
      Object.values(asset).some((value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [inUseAssets, searchQuery]);

  const breadcrumbItems = [
    {
      title: 'Park Asset Management',
      pathKey: '/parkasset',
      isMain: true,
    },
    {
      title: 'Park Assets In Use',
      pathKey: '/parkasset/inuse',
      isCurrent: true,
    },
  ];

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
      triggerFetch();
      message.success('Asset deleted successfully');
    } catch (error) {
      console.error('Error deleting asset:', error);
      message.error('Failed to delete asset. Please try again.');
    }
  };

  const handleSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const columns: ColumnsType<ParkAssetResponse> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: ParkAssetResponse, b: ParkAssetResponse) => a.name.localeCompare(b.name),
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
      filters: Object.values(ParkAssetConditionEnum).map((condition) => ({
        text: formatEnumLabel(condition, 'condition'),
        value: condition,
      })),
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
        <Tag
          color={status === ParkAssetStatusEnum.AVAILABLE ? 'green' : status === ParkAssetStatusEnum.IN_USE ? 'blue' : 'red'}
          bordered={false}
        >
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
          <Tooltip title="Edit Asset">
            <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/parkasset/edit/${record.id}`)} />
          </Tooltip>
          <Tooltip title="Delete Asset">
            <Button danger type="link" icon={<MdDeleteOutline className="text-error" />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
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
          placeholder="Search in In-Use Assets..."
          onChange={handleSearchBar}
          className="mb-4 bg-white"
          variant="filled"
        />
      </Flex>
      <Card>
        <Table
          columns={columns}
          dataSource={filteredInUseAssets}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: SCREEN_LG }}
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default AssetInUse;
