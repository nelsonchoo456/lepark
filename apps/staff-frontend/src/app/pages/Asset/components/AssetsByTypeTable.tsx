import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Button, Input, Table, Flex, Tag, message, Card, Statistic, Badge, Tooltip, Modal } from 'antd';
import {
  deleteParkAsset,
  ParkAssetConditionEnum,
  ParkAssetResponse,
  ParkAssetStatusEnum,
  StaffResponse,
  StaffType,
} from '@lepark/data-access';
import { FiEye, FiSearch } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { RiEdit2Line } from 'react-icons/ri';
import { useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { SCREEN_LG } from '../../../config/breakpoints';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { parkAssetTypesLabels } from '../AssetListSummary';
import moment from 'moment';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

interface AssetsByTypeTableProps {
  parkAssets: ParkAssetResponse[];
  triggerFetch: () => void;
  tableShowTypeColumn?: boolean;
}

const AssetsByTypeTable = ({ parkAssets, triggerFetch, tableShowTypeColumn = false }: AssetsByTypeTableProps) => {
  const { user } = useAuth<StaffResponse>();
  const [totalCount, setTotalCount] = useState<number>(0);
  const [inUseCount, setInUseCount] = useState<number>(0);
  const [availableCount, setAvailableCount] = useState<number>(0);
  const [unavailableCount, setUnavailableCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  const filteredParkAssets = useMemo(() => {
    if (parkAssets && parkAssets.length > 0) {
      return parkAssets.filter((asset) =>
        Object.values(asset).some((value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())),
      );
    } else {
      return [];
    }
  }, [parkAssets, searchQuery]);

  useEffect(() => {
    if (parkAssets && parkAssets.length > 0) {
      setTotalCount(parkAssets.length);
      setInUseCount(parkAssets.filter((a) => a.parkAssetStatus === ParkAssetStatusEnum.IN_USE).length);
      setAvailableCount(parkAssets.filter((a) => a.parkAssetStatus === ParkAssetStatusEnum.AVAILABLE).length);
      setUnavailableCount(
        parkAssets.filter(
          (a) => a.parkAssetStatus === ParkAssetStatusEnum.UNDER_MAINTENANCE || a.parkAssetStatus === ParkAssetStatusEnum.DECOMMISSIONED,
        ).length,
      );
    }
  }, [parkAssets]);

  const parkFacilityColumn = {
    title: user?.role === StaffType.SUPERADMIN ? 'Park, Facility' : 'Facility',
    key: 'parkFacility',
    render: (_: React.ReactNode, record: ParkAssetResponse) => (
      <div>
        {user?.role === StaffType.SUPERADMIN && <p className="font-semibold">{record.park?.name}</p>}
        <div className="flex">
          {user?.role === StaffType.SUPERADMIN ? <p className="opacity-50 mr-2">Facility:</p> : <></>}
          {record.facility?.name}
        </div>
      </div>
    ),
    sorter: (a: ParkAssetResponse, b: ParkAssetResponse) => {
      if (user?.role === StaffType.SUPERADMIN) {
        return (a.park?.name || '').localeCompare(b.park?.name || '');
      }
      return (a.facility?.name || '').localeCompare(b.facility?.name || '');
    },
    width: '20%',
  };

  const columns = [
    {
      title: 'Identifier Number',
      dataIndex: 'identifierNumber',
      key: 'identifierNumber',
      render: (serialNumber: string) => <div className="font-semibold">{serialNumber}</div>,
      sorter: (a: ParkAssetResponse, b: ParkAssetResponse) => a.identifierNumber.localeCompare(b.identifierNumber),
      width: '15%',
    },
    {
      title: 'Asset Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <div className="font-semibold">{name}</div>,
      sorter: (a: ParkAssetResponse, b: ParkAssetResponse) => a.name.localeCompare(b.name),
      width: '20%',
    },
    parkFacilityColumn,
    {
      title: 'Asset Type',
      dataIndex: 'parkAssetType',
      key: 'parkAssetType',
      filters: parkAssetTypesLabels.map((a) => ({ value: a.key, text: a.label })),
      onFilter: (value: any, record: ParkAssetResponse) => record.parkAssetType === value,
      render: (type: string) => formatEnumLabelToRemoveUnderscores(type),
      width: '15%',
    },
    {
      title: 'Status',
      dataIndex: 'parkAssetStatus',
      key: 'parkAssetStatus',
      filters: Object.values(ParkAssetStatusEnum).map((status) => ({ text: formatEnumLabelToRemoveUnderscores(status), value: status })),
      onFilter: (value: any, record: ParkAssetResponse) => record.parkAssetStatus === value,
      render: (status: string) => (
        <Tag
          color={
            status === ParkAssetStatusEnum.AVAILABLE
              ? 'green'
              : status === ParkAssetStatusEnum.IN_USE
              ? 'blue'
              : status === ParkAssetStatusEnum.UNDER_MAINTENANCE
              ? 'yellow'
              : 'red'
          }
          bordered={false}
        >
          {formatEnumLabelToRemoveUnderscores(status)}
        </Tag>
      ),
      width: '15%',
    },
    {
      title: 'Condition',
      dataIndex: 'parkAssetCondition',
      key: 'parkAssetCondition',
      filters: Object.values(ParkAssetConditionEnum).map((condition) => ({
        text: formatEnumLabelToRemoveUnderscores(condition),
        value: condition,
      })),
      onFilter: (value: any, record: ParkAssetResponse) => record.parkAssetCondition === value,
      render: (condition: string) => formatEnumLabelToRemoveUnderscores(condition),
      width: '15%',
    },
    // {
    //   title: 'Next Maintenance Date',
    //   dataIndex: 'nextMaintenanceDate',
    //   key: 'nextMaintenanceDate',
    //   render: (nextMaintenanceDate: string) => (nextMaintenanceDate ? moment(nextMaintenanceDate).format('MMMM D, YYYY') : '-'),
    //   width: '12%',
    // },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: React.ReactNode, record: ParkAssetResponse) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`/parkasset/${record.id}`)} />
          </Tooltip>
          <Tooltip title="Edit Asset">
            <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/parkasset/${record.id}/edit`)} />
          </Tooltip>
          <Tooltip title="Delete Asset">
            <Button danger type="link" icon={<MdDeleteOutline className="text-error" />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Flex>
      ),
      width: '20%',
    },
  ];

  const columnsNoType = [
    {
      title: 'Identifier Number',
      dataIndex: 'identifierNumber',
      key: 'identifierNumber',
      render: (serialNumber: string) => <div className="font-semibold">{serialNumber}</div>,
      sorter: (a: ParkAssetResponse, b: ParkAssetResponse) => a.identifierNumber.localeCompare(b.identifierNumber),
      width: '16%',
    },
    {
      title: 'Asset Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <div className="font-semibold">{name}</div>,
      sorter: (a: ParkAssetResponse, b: ParkAssetResponse) => a.name.localeCompare(b.name),
      width: '15%',
    },
    parkFacilityColumn,
    {
      title: 'Status',
      dataIndex: 'parkAssetStatus',
      key: 'parkAssetStatus',
      filters: Object.values(ParkAssetStatusEnum).map((status) => ({ text: formatEnumLabelToRemoveUnderscores(status), value: status })),
      onFilter: (value: any, record: ParkAssetResponse) => record.parkAssetStatus === value,
      render: (status: string) => (
        <Tag
          color={status === 'AVAILABLE' ? 'green' : status === 'IN_USE' ? 'blue' : status === 'UNDER_MAINTENANCE' ? 'yellow' : 'red'}
          bordered={false}
        >
          {formatEnumLabelToRemoveUnderscores(status)}
        </Tag>
      ),
      width: '15%',
    },
    {
      title: 'Condition',
      dataIndex: 'parkAssetCondition',
      key: 'parkAssetCondition',
      filters: Object.values(ParkAssetConditionEnum).map((condition) => ({
        text: formatEnumLabelToRemoveUnderscores(condition),
        value: condition,
      })),
      onFilter: (value: any, record: ParkAssetResponse) => record.parkAssetCondition === value,
      render: (condition: string) => formatEnumLabelToRemoveUnderscores(condition),
      width: '15%',
    },
    // {
    //   title: 'Next Maintenance Date',
    //   dataIndex: 'nextMaintenanceDate',
    //   key: 'nextMaintenanceDate',
    //   render: (nextMaintenanceDate: string) => (nextMaintenanceDate ? moment(nextMaintenanceDate).format('MMMM D, YYYY') : '-'),
    //   width: '12%',
    // },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: React.ReactNode, record: ParkAssetResponse) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`/parkasset/${record.id}`)} />
          </Tooltip>
          <Tooltip title="Edit Asset">
            <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/parkasset/${record.id}/edit`)} />
          </Tooltip>
          <Tooltip title="Delete Asset">
            <Button danger type="link" icon={<MdDeleteOutline className="text-error" />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Flex>
      ),
      width: '8%',
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

  return (
    <Card styles={{ body: { padding: 0 } }} className="p-4 border-t-0 rounded-tl-none">
      <Card className="py-2 px-4 mb-4" styles={{ body: { padding: 0 } }}>
        <div className="flex">
          <div className="flex-auto">
            <Statistic
              title={<div className="text-black font-semibold">Total</div>}
              value={totalCount}
              valueStyle={{ fontSize: '1.25rem' }}
            />
          </div>
          <div className="flex-auto">
            <Statistic title={<Badge status="success" text="Available" />} value={availableCount} valueStyle={{ fontSize: '1.25rem' }} />
          </div>
          <div className="flex-auto">
            <Statistic title={<Badge status="error" text="In Use" />} value={inUseCount} valueStyle={{ fontSize: '1.25rem' }} />
          </div>
          <div className="flex-auto">
            <Statistic
              title={
                <div className="flex items-center">
                  <Badge status="default" text="Unavailable" />
                  <TooltipIcon title="Assets Under Maintenance and Decommissioned" />
                </div>
              }
              value={unavailableCount}
              valueStyle={{ fontSize: '1.25rem' }}
            />
          </div>
        </div>
      </Card>
      <Flex justify="end" gap={10}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search for a Park Asset..."
          onChange={handleSearchBar}
          className="mb-4"
          variant="filled"
        />
        <Button type="primary" onClick={() => navigate('/parkasset/create')}>
          Create Park Asset
        </Button>
      </Flex>
      <Table
        columns={tableShowTypeColumn ? columns : columnsNoType}
        dataSource={filteredParkAssets}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        scroll={{ x: SCREEN_LG }}
      />
    </Card>
  );
};

const TooltipIcon: React.FC<{ title: string }> = ({ title }) => {
  const iconRef = useRef(null);

  return (
    <Tooltip title={title}>
      <span ref={iconRef}>
        <AiOutlineQuestionCircle className="ml-1 opacity-90" />
      </span>
    </Tooltip>
  );
};

export default AssetsByTypeTable;
