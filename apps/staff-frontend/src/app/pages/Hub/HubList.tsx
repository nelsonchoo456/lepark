import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { HubResponse, StaffResponse, StaffType, deleteHub } from '@lepark/data-access';
import { Button, Card, Flex, Input, Table, TableProps, Tag, Tooltip, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { FiEye, FiSearch } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { RiEdit2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { SCREEN_LG } from '../../config/breakpoints';
import { useFetchHubs } from '../../hooks/Hubs/useFetchHubs';
import moment from 'moment';

const HubList: React.FC = () => {
  const { hubs, loading, triggerFetch } = useFetchHubs();
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [hubToBeDeleted, setHubToBeDeleted] = useState<HubResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [radioGroupFilters, setRadioGroupFilters] = useState<{ text: string; value: string }[]>([]);
  const [hubSecretFilters, setHubSecretFilters] = useState<{ text: string; value: string }[]>([]);

  useEffect(() => {
    const uniqueRadioGroups = Array.from(new Set(hubs.map((item) => item.radioGroup)));
    const uniqueSecretFilters = Array.from(new Set(hubs.map((item) => item.hubSecret)));

    setRadioGroupFilters(uniqueRadioGroups.map((group) => ({ text: group.toString(), value: group.toString() })));
    setHubSecretFilters(uniqueSecretFilters.map((secret) => ({ text: secret.toString(), value: secret.toString() })));
  }, [hubs]);

  const filteredHubs = useMemo(() => {
    return hubs.filter((hub) => Object.values(hub).some((value) => value?.toString().toLowerCase().includes(searchQuery.toLowerCase())));
  }, [searchQuery, hubs]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navigateToDetails = (hubId: string) => {
    navigate(`/hubs/${hubId}`);
  };

  const columns: TableProps<HubResponse>['columns'] = [
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.serialNumber.localeCompare(b.serialNumber),
      width: '20%',
    },
    {
      title: 'Hub Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <div>{text}</div>,
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: '15%',
    },
    {
      title: 'Facility',
      dataIndex: 'facilityName',
      key: 'facilityName',
      render: (text, record) => (
        <Flex justify="space-between" align="center">
          {text}
        </Flex>
      ),
      sorter: (a, b) => {
        if (a.facilityName && b.facilityName) {
          return a.facilityName.localeCompare(b.facilityName);
        }
        return (a.facilityId ?? '').localeCompare(b.facilityId ?? '');
      },
      width: '33%',
    },
    {
      title: 'Hub Status',
      dataIndex: 'hubStatus',
      key: 'hubStatus',
      render: (text) => {
        switch (text) {
          case 'ACTIVE':
            return <Tag color="green">ACTIVE</Tag>;
          case 'INACTIVE':
            return <Tag color="silver">INACTIVE</Tag>;
          case 'UNDER_MAINTENANCE':
            return <Tag color="yellow">UNDER MAINTENANCE</Tag>;
          case 'DECOMMISSIONED':
            return <Tag color="red">DECOMMISSIONED</Tag>;
        }
      },
      filters: [
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'INACTIVE', value: 'INACTIVE' },
        { text: 'UNDER_MAINTENANCE', value: 'UNDER_MAINTENANCE' },
        { text: 'DECOMMISSIONED', value: 'DECOMMISSIONED' },
      ],
      onFilter: (value, record) => record.hubStatus === value,
      width: '15%',
    },
    {
      title: 'Next Maintenance Date',
      dataIndex: 'nextMaintenanceDate',
      key: 'nextMaintenanceDate',
      render: (text) => moment(text).format('D MMM YY'),
      sorter: (a, b) => moment(a.nextMaintenanceDate).unix() - moment(b.nextMaintenanceDate).unix(),
      width: '10%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigateToDetails(record.id)} />
          </Tooltip>
          {user?.role === StaffType.SUPERADMIN && (
            <>
              <Tooltip title="Edit">
                <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/hubs/edit/${record.id}`)} />
              </Tooltip>
              <Tooltip title="Delete">
                <Button danger type="link" icon={<MdDeleteOutline className="text-error" />} onClick={() => showDeleteModal(record)} />
              </Tooltip>
            </>
          )}
        </Flex>
      ),
      width: '1%',
    },
  ];

  const columnsForSuperadmin: TableProps<HubResponse>['columns'] = [
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.serialNumber.localeCompare(b.serialNumber),
      width: '20%',
    },
    {
      title: 'Hub Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <div>{text}</div>,
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: '15%',
    },
    {
      title: 'Park, Facility',
      render: (_, record) => (
        <div>
          <p className="font-semibold">{record.parkName}</p>
          <div className="flex">
            <p className="opacity-50 mr-2">Facility:</p>
            {record.facilityName}
          </div>
        </div>
      ),
      sorter: (a, b) => {
        if (a.parkName && b.parkName) {
          return a.parkName.localeCompare(b.parkName);
        }
        if (a.facilityName && b.facilityName) {
          return a.facilityName.localeCompare(b.facilityName);
        }
        return (a.facilityId ?? '').localeCompare(b.facilityId ?? '');
      },

      width: '15%',
    },
    {
      title: 'Hub Status',
      dataIndex: 'hubStatus',
      key: 'hubStatus',
      render: (text) => {
        switch (text) {
          case 'ACTIVE':
            return <Tag color="green">ACTIVE</Tag>;
          case 'INACTIVE':
            return <Tag color="silver">INACTIVE</Tag>;
          case 'UNDER_MAINTENANCE':
            return <Tag color="yellow">UNDER MAINTENANCE</Tag>;
          case 'DECOMMISSIONED':
            return <Tag color="red">DECOMMISSIONED</Tag>;
        }
      },
      filters: [
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'INACTIVE', value: 'INACTIVE' },
        { text: 'UNDER_MAINTENANCE', value: 'UNDER_MAINTENANCE' },
        { text: 'DECOMMISSIONED', value: 'DECOMMISSIONED' },
      ],
      onFilter: (value, record) => record.hubStatus === value,
      width: '15%',
    },
    {
      title: 'Next Maintenance Date',
      dataIndex: 'nextMaintenanceDate',
      key: 'nextMaintenanceDate',
      render: (text) => moment(text).format('D MMM YY'),
      sorter: (a, b) => moment(a.nextMaintenanceDate).unix() - moment(b.nextMaintenanceDate).unix(),
      width: '10%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigateToDetails(record.id)} />
          </Tooltip>
          {user?.role === StaffType.SUPERADMIN && (
            <>
              <Tooltip title="Edit">
                <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/hubs/edit/${record.id}`)} />
              </Tooltip>
              <Tooltip title="Delete">
                <Button danger type="link" icon={<MdDeleteOutline className="text-error" />} onClick={() => showDeleteModal(record)} />
              </Tooltip>
            </>
          )}
        </Flex>
      ),
      width: '1%',
    },
  ];

  const showDeleteModal = (hub: HubResponse) => {
    setDeleteModalOpen(true);
    setHubToBeDeleted(hub);
  };

  const cancelDelete = () => {
    setHubToBeDeleted(null);
    setDeleteModalOpen(false);
  };

  const deleteHubToBeDeleted = async () => {
    try {
      if (hubToBeDeleted) {
        await deleteHub(hubToBeDeleted.id);
        messageApi.success('Hub deleted successfully');
        setHubToBeDeleted(null);
        triggerFetch();
        cancelDelete();
      }
    } catch (error) {
      messageApi.error('Failed to delete hub');
    }
  };

  const breadcrumbItems = [
    {
      title: 'Hub Management',
      pathKey: '/hubs',
      isMain: true,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <ConfirmDeleteModal
        onCancel={cancelDelete}
        onConfirm={deleteHubToBeDeleted}
        description={`Are you sure you want to delete the hub "${hubToBeDeleted?.name}"?`}
        open={deleteModalOpen}
      />
      <Flex justify="end" gap={10}>
        <Input suffix={<FiSearch />} placeholder="Search in Hubs..." className="mb-4 bg-white" variant="filled" onChange={handleSearch} />
        {user?.role === StaffType.SUPERADMIN && (
          <Button type="primary" onClick={() => navigate('/hubs/create')}>
            Create Hub
          </Button>
        )}
      </Flex>
      <Card>
        <Table
          dataSource={filteredHubs}
          columns={user?.role === StaffType.SUPERADMIN ? columnsForSuperadmin : columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: SCREEN_LG }}
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default HubList;
