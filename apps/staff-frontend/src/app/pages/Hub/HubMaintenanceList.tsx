import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { deleteHub, HubResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { HubStatusEnum } from '@prisma/client';
import { Button, Card, DatePicker, Flex, Input, message, Modal, Table, Tag, Tooltip, Statistic, Badge } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import moment from 'moment';
import React, { useMemo, useRef, useState } from 'react';
import { FiEye, FiPlus, FiSearch } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { RiEdit2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import { SCREEN_LG } from '../../config/breakpoints';
import { useFetchHubs } from '../../hooks/Hubs/useFetchHubs';

const HubMaintenanceList: React.FC = () => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const notificationShown = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { hubs, loading, triggerFetch } = useFetchHubs();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const { RangePicker } = DatePicker;

  // Sort hubs by nextMaintenanceDate
  const sortedHubs = useMemo(() => {
    return hubs.slice().sort((a, b) => {
      const dateA = a.nextMaintenanceDate ? moment(a.nextMaintenanceDate).valueOf() : Infinity;
      const dateB = b.nextMaintenanceDate ? moment(b.nextMaintenanceDate).valueOf() : Infinity;
      return dateA - dateB;
    });
  }, [hubs]);

  const filteredHubs = useMemo(() => {
    return sortedHubs.filter((hub) => {
      const matchesSearchQuery = Object.values(hub).some(
        (value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase()),
      );
      const matchesDateRange =
        startDate && endDate
          ? hub.nextMaintenanceDate && moment(hub.nextMaintenanceDate).isBetween(startDate, endDate, 'days', '[]')
          : true;
      return matchesSearchQuery && matchesDateRange;
    });
  }, [sortedHubs, searchQuery, startDate, endDate]);

  const handleSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDateChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null, dateStrings: [string, string]) => {
    setStartDate(dateStrings[0] ? dayjs(dateStrings[0]).toISOString() : null);
    setEndDate(dateStrings[1] ? dayjs(dateStrings[1]).toISOString() : null);
  };

  const handleCreateTask = (hub: HubResponse) => {
    if (hub.nextMaintenanceDates) {
      const earliestDate = hub.nextMaintenanceDates.length > 0 ? moment(hub.nextMaintenanceDates[0]).format('YYYY-MM-DD') : '';
      console.log("earliestDate", earliestDate);
      navigate(`/maintenance-tasks/create?entityId=${hub.identifierNumber}&dueDate=${earliestDate}&entityType=hub&hasDueDate=yes`);
    } else {
      message.error('No dates available for this hub');
    }
  };

  // Calculate counts for hubs with nextMaintenanceDate within specified time frames
  const countWithinDays = (days: number) => {
    return hubs.filter((hub) => hub.nextMaintenanceDate && moment(hub.nextMaintenanceDate).isBefore(moment().add(days, 'days')))
      .length;
  };

  const within3Days = countWithinDays(3);
  const within1Week = countWithinDays(7);
  const within2Weeks = countWithinDays(14);
  const within1Month = countWithinDays(30);

  const columns: ColumnsType<HubResponse> = [
    {
      title: 'Identifier Number',
      dataIndex: 'identifierNumber',
      key: 'identifierNumber',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.identifierNumber.localeCompare(b.identifierNumber),
      width: '20%',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: '20%',
    },
    {
      title: 'Location',
      render: (text, record) => (
        <Flex justify="space-between" align="center">
          {record?.zone?.name || record.facility?.name || 'Unknown Location'}
        </Flex>
      ),
      sorter: (a, b) => {
        if (a.park?.name && b.park?.name) {
          return a.park.name.localeCompare(b.park.name);
        }
        if (a.name && b.name) {
          return a.name.localeCompare(b.name);
        }
        return (a.facilityId ?? '').localeCompare(b.facilityId ?? '');
      },
      width: '15%',
    },
    {
      title: 'Hub Status',
      dataIndex: 'hubStatus',
      key: 'hubStatus',
      filters: Object.values(HubStatusEnum).map((status) => ({ text: formatEnumLabelToRemoveUnderscores(status), value: status })),
      onFilter: (value, record) => record.hubStatus === value,
      render: (status: string, record) => {
        switch (status) {
          case HubStatusEnum.ACTIVE:
            return (
              <>
                <Tag color="green" bordered={false}>
                  {formatEnumLabelToRemoveUnderscores(status)}
                </Tag>
                {record.zone?.name && (
                  <div className="flex">
                    <p className="opacity-50 mr-2">Zone:</p>
                    {record.zone?.name}
                  </div>
                )}
              </>
            );
          case HubStatusEnum.INACTIVE:
            return (
              <Tag color="blue" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(status)}
              </Tag>
            );
          case HubStatusEnum.UNDER_MAINTENANCE:
            return (
              <Tag color="yellow" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(status)}
              </Tag>
            );
          case HubStatusEnum.DECOMMISSIONED:
            return (
              <Tag color="red" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(status)}
              </Tag>
            );
          default:
            return (
              <Tag color="default" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(status)}
              </Tag>
            );
        }
      },
      width: '15%',
    },
    {
      title: 'Next Maintenance Date',
      dataIndex: 'nextMaintenanceDate',
      key: 'nextMaintenanceDate',
      render: (date: string) => (date ? moment(date).format('D MMM YY') : '-'),
      sorter: (a, b) => {
        const dateA = a.nextMaintenanceDate ? moment(a.nextMaintenanceDate).valueOf() : Infinity;
        const dateB = b.nextMaintenanceDate ? moment(b.nextMaintenanceDate).valueOf() : Infinity;
        return dateA - dateB;
      },
      defaultSortOrder: 'ascend',
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: React.ReactNode, record: HubResponse) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`/hubs/${record.id}`)} />
          </Tooltip>
          <Tooltip title="Create Maintenance Task">
            <Button type="link" icon={<FiPlus />} onClick={() => handleCreateTask(record)} />
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  const superAdminColumns: ColumnsType<HubResponse> = [
    {
      title: 'Identifier Number',
      dataIndex: 'identifierNumber',
      key: 'identifierNumber',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.serialNumber.localeCompare(b.serialNumber),
      width: '20%',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: '20%',
    },
    {
      title: 'Storage Facility',
      render: (_, record) =>
        record.hubStatus === HubStatusEnum.ACTIVE ? (
          '-'
        ) : (
          <div>
            <p className="font-semibold">{record.park?.name}</p>
            <div className="flex">
              <p className="opacity-50 mr-2">Facility:</p>
              {record.facility?.name}
            </div>
          </div>
        ),
      sorter: (a, b) => {
        if (a.park?.name && b.park?.name) {
          return a.park.name.localeCompare(b.park.name);
        }
        if (a.name && b.name) {
          return a.name.localeCompare(b.name);
        }
        return (a.facilityId ?? '').localeCompare(b.facilityId ?? '');
      },
      width: '15%',
    },
    {
      title: 'Hub Status',
      dataIndex: 'hubStatus',
      key: 'hubStatus',
      filters: Object.values(HubStatusEnum).map((status) => ({ text: formatEnumLabelToRemoveUnderscores(status), value: status })),
      onFilter: (value, record) => record.hubStatus === value,
      render: (status: string, record) => {
        switch (status) {
          case HubStatusEnum.ACTIVE:
            return (
              <>
                <Tag color="green" bordered={false}>
                  {formatEnumLabelToRemoveUnderscores(status)}
                </Tag>
                {record.zone && (
                  <p>
                    <span className="opacity-50 mr-2">Zone:</span>
                    {record.zone?.name}
                  </p>
                )}
              </>
            );
          case HubStatusEnum.INACTIVE:
            return (
              <Tag color="blue" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(status)}
              </Tag>
            );
          case HubStatusEnum.UNDER_MAINTENANCE:
            return (
              <Tag color="yellow" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(status)}
              </Tag>
            );
          case HubStatusEnum.DECOMMISSIONED:
            return (
              <Tag color="red" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(status)}
              </Tag>
            );
          default:
            return (
              <Tag color="default" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(status)}
              </Tag>
            );
        }
      },
      width: '15%',
    },
    {
      title: 'Next Maintenance Date',
      dataIndex: 'nextMaintenanceDate',
      key: 'nextMaintenanceDate',
      render: (date: string) => (date ? moment(date).format('D MMM YY') : '-'),
      sorter: (a, b) => {
        const dateA = a.nextMaintenanceDate ? moment(a.nextMaintenanceDate).valueOf() : Infinity;
        const dateB = b.nextMaintenanceDate ? moment(b.nextMaintenanceDate).valueOf() : Infinity;
        return dateA - dateB;
      },
      defaultSortOrder: 'ascend',
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: React.ReactNode, record: HubResponse) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`/hubs/${record.id}`)} />
          </Tooltip>
          <Tooltip title="Create Maintenance Task">
            <Button type="link" icon={<FiPlus />} onClick={() => handleCreateTask(record)} />
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Hubs Maintenance',
      pathKey: '/hub/maintenance',
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
          placeholder="Search in Hubs..."
          onChange={handleSearchBar}
          className="mb-4 bg-white"
          variant="filled"
          style={{ width: '100%' }} // Stretch to the container
        />
        <RangePicker
          onChange={handleDateChange}
          value={[startDate ? dayjs(startDate) : null, endDate ? dayjs(endDate) : null]} // Ensure the RangePicker is empty by default
          style={{ height: '32px', padding: '4px 11px' }}
        />
      </Flex>

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

      <Card>
        <Table
          columns={user?.role === StaffType.SUPERADMIN ? superAdminColumns : columns}
          dataSource={filteredHubs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: SCREEN_LG }}
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default HubMaintenanceList;