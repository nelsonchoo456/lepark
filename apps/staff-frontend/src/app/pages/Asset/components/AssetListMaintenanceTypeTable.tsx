import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Button, Input, Table, Flex, Tag, message, Card, Statistic, Badge, Tooltip, Modal, DatePicker } from 'antd';
import {
  deleteParkAsset,
  ParkAssetConditionEnum,
  ParkAssetResponse,
  ParkAssetStatusEnum,
  StaffResponse,
  StaffType,
} from '@lepark/data-access';
import { FiEye, FiSearch, FiPlus } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { RiEdit2Line } from 'react-icons/ri';
import { useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { SCREEN_LG } from '../../../config/breakpoints';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { parkAssetTypesLabels } from '../AssetListSummary';
import moment from 'moment';
import dayjs from 'dayjs';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const { RangePicker } = DatePicker;

interface AssetListMaintenanceTypeTableProps {
  parkAssets: ParkAssetResponse[];
  triggerFetch: () => void;
  tableShowTypeColumn?: boolean;
}

const AssetListMaintenanceTypeTable = ({ parkAssets, triggerFetch, tableShowTypeColumn = false }: AssetListMaintenanceTypeTableProps) => {
  const { user } = useAuth<StaffResponse>();
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredParkAssets = useMemo(() => {
    return parkAssets.filter((asset) => {
      const matchesSearchQuery = Object.values(asset).some(
        (value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase()),
      );
      const matchesDateRange =
        startDate && endDate
          ? asset.nextMaintenanceDate && moment(asset.nextMaintenanceDate).isBetween(startDate, endDate, 'days', '[]')
          : true;
      return matchesSearchQuery && matchesDateRange;
    });
  }, [parkAssets, searchQuery, startDate, endDate]);

  // Calculate counts for assets with nextMaintenanceDate within specified time frames
  const countWithinDays = (days: number) => {
    return parkAssets.filter((asset) => asset.nextMaintenanceDate && moment(asset.nextMaintenanceDate).isBefore(moment().add(days, 'days')))
      .length;
  };

  const within3Days = countWithinDays(3);
  const within1Week = countWithinDays(7);
  const within2Weeks = countWithinDays(14);
  const within1Month = countWithinDays(30);

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
    {
      title: 'Next Maintenance Date',
      dataIndex: 'nextMaintenanceDate',
      key: 'nextMaintenanceDate',
      render: (date: string) => (date ? moment(date).format('D MMM YY') : '-'),
      sorter: (a: ParkAssetResponse, b: ParkAssetResponse) => {
        const dateA = a.nextMaintenanceDate ? moment(a.nextMaintenanceDate).valueOf() : Infinity;
        const dateB = b.nextMaintenanceDate ? moment(b.nextMaintenanceDate).valueOf() : Infinity;
        return dateA - dateB;
      },
      defaultSortOrder: 'ascend' as const,
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
          <Tooltip title="Create Maintenance Task">
            <Button type="link" icon={<FiPlus />} onClick={() => handleCreateTask(record)} />
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  const handleCreateTask = (parkAsset: ParkAssetResponse) => {
    if (parkAsset.nextMaintenanceDates) {
      const earliestDate = parkAsset.nextMaintenanceDates.length > 0 ? moment(parkAsset.nextMaintenanceDates[0]).format('YYYY-MM-DD') : '';
      navigate(`/maintenance-tasks/create?entityId=${parkAsset.identifierNumber}&dueDate=${earliestDate}&entityType=parkAsset`);
    } else {
      message.error('No dates available for this Park Asset');
    }
  };

  const handleSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDateChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null, dateStrings: [string, string]) => {
    setStartDate(dateStrings[0] ? dayjs(dateStrings[0]).toISOString() : null);
    setEndDate(dateStrings[1] ? dayjs(dateStrings[1]).toISOString() : null);
  };

  return (
    <Card styles={{ body: { padding: 0 } }} className="p-4 border-t-0 rounded-tl-none">
      <Card className="py-2 px-4 mb-4" styles={{ body: { padding: 0 } }}>
        <div className="flex">
          <div className="flex-auto">
            <Statistic title={<Badge status="error" text="Within 3 Days" />} value={within3Days} valueStyle={{ fontSize: '1.25rem' }} />
          </div>
          <div className="flex-auto">
            <Statistic title={<Badge status="warning" text="Within 1 Week" />} value={within1Week} valueStyle={{ fontSize: '1.25rem' }} />
          </div>
          <div className="flex-auto">
            <Statistic
              title={<Badge status="processing" text="Within 2 Weeks" />}
              value={within2Weeks}
              valueStyle={{ fontSize: '1.25rem' }}
            />
          </div>
          <div className="flex-auto">
            <Statistic title={<Badge status="success" text="Within 1 Month" />} value={within1Month} valueStyle={{ fontSize: '1.25rem' }} />
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
          style={{ width: '100%' }} // Stretch to the container
        />
        <RangePicker
          onChange={handleDateChange}
          value={[startDate ? dayjs(startDate) : null, endDate ? dayjs(endDate) : null]} // Ensure the RangePicker is empty by default
          style={{ height: '32px', padding: '4px 11px' }}
        />
      </Flex>
      <Table columns={columns} dataSource={filteredParkAssets} rowKey="id" pagination={{ pageSize: 6 }} scroll={{ x: SCREEN_LG }} />
    </Card>
  );
};

export default AssetListMaintenanceTypeTable;
