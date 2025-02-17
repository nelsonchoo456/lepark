import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { HubResponse, HubStatusEnum, StaffResponse, StaffType, deleteHub, getSensorsByHubId } from '@lepark/data-access';
import { Button, Card, Flex, Input, Table, TableProps, Tag, Tooltip, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { FiEye, FiSearch } from 'react-icons/fi';
import { MdDeleteOutline, MdError } from 'react-icons/md';
import { RiEdit2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { SCREEN_LG } from '../../config/breakpoints';
import { useFetchHubs } from '../../hooks/Hubs/useFetchHubs';
import moment from 'moment';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const HubList: React.FC = () => {
  const { hubs, loading, triggerFetch } = useFetchHubs();
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [hubToBeDeleted, setHubToBeDeleted] = useState<HubResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);

  const filteredHubs = useMemo(() => {
    return hubs.filter((hub) => Object.values(hub).some((value) => value?.toString().toLowerCase().includes(searchQuery.toLowerCase())));
  }, [searchQuery, hubs]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  console.log(hubs);

  const navigateToDetails = (hubId: string) => {
    navigate(`/hubs/${hubId}`);
  };

  const columns: TableProps<HubResponse>['columns'] = [
    {
      title: 'Identifier Number',
      dataIndex: 'identifierNumber',
      key: 'identifierNumber',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.identifierNumber.localeCompare(b.identifierNumber),
      width: '15%',
    },
    {
      title: 'Hub Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: '15%',
    },
    {
      title: 'Storage Facility',
      dataIndex: 'facilityName',
      key: 'facilityName',
      render: (text, record) => (
        <Flex justify="space-between" align="center">
          {text}
        </Flex>
      ),
      sorter: (a, b) => {
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
      render: (text, record) => {
        const formattedStatus = formatEnumLabelToRemoveUnderscores(text);
        switch (text) {
          case 'ACTIVE':
            return (
              <>
                <Tag color="green" bordered={false}>
                  {formattedStatus}
                </Tag>
                {record.zone?.name && (
                  <div className="flex">
                    <p className="opacity-50 mr-2">Zone:</p>
                    {record.zone?.name}
                  </div>
                )}
              </>
            );
          case 'INACTIVE':
            return (
              <Tag color="blue" bordered={false}>
                {formattedStatus}
              </Tag>
            );
          case 'UNDER_MAINTENANCE':
            return (
              <Tag color="yellow" bordered={false}>
                {formattedStatus}
              </Tag>
            );
          case 'DECOMMISSIONED':
            return (
              <Tag color="red" bordered={false}>
                {formattedStatus}
              </Tag>
            );
        }
      },
      filters: [
        { text: formatEnumLabelToRemoveUnderscores('ACTIVE'), value: 'ACTIVE' },
        { text: formatEnumLabelToRemoveUnderscores('INACTIVE'), value: 'INACTIVE' },
        { text: formatEnumLabelToRemoveUnderscores('UNDER_MAINTENANCE'), value: 'UNDER_MAINTENANCE' },
        { text: formatEnumLabelToRemoveUnderscores('DECOMMISSIONED'), value: 'DECOMMISSIONED' },
      ],
      onFilter: (value, record) => record.hubStatus === value,
      sorter: (a, b) => {
        if (a.hubStatus === HubStatusEnum.ACTIVE && b.hubStatus === HubStatusEnum.ACTIVE && a.zone?.name && b.zone?.name) {
          return a.zone.name.localeCompare(b.zone.name);
        }
        return (a.hubStatus ?? '').localeCompare(b.hubStatus ?? '');
      },
      width: '15%',
    },
    /*   {
      title: 'Next Maintenance Date',
      dataIndex: 'nextMaintenanceDate',
      key: 'nextMaintenanceDate',
      render: (text) => (text ? moment(text).format('D MMM YY') : '-'),
      sorter: (a, b) => {
        return moment(a.nextMaintenanceDate).valueOf() - moment(b.nextMaintenanceDate).valueOf();
      },
      width: '15%',
    },*/
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigateToDetails(record.id)} />
          </Tooltip>

          <Tooltip title="Edit">
            <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/hubs/${record.id}/edit`)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button danger type="link" icon={<MdDeleteOutline className="text-error" />} onClick={() => showDeleteModal(record)} />
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  const columnsForSuperadmin: TableProps<HubResponse>['columns'] = [
    {
      title: 'Identifier Number',
      dataIndex: 'identifierNumber',
      key: 'identifierNumber',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.identifierNumber.localeCompare(b.identifierNumber),
      width: '15%',
    },
    {
      title: 'Hub Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: '15%',
    },
    {
      title: 'Storage Facility',
      render: (_, record) => (
        <div>
          {record.hubStatus === HubStatusEnum.ACTIVE ? (
            '-'
          ) : (
            <>
              <p className="font-semibold">{record.park.name}</p>
              <div className="flex">
                <p className="opacity-50 mr-2">Facility:</p>
                {record.facility.name}
              </div>
            </>
          )}
        </div>
      ),
      sorter: (a, b) => {
        if (a.park.name && b.park.name) {
          return a.park.name.localeCompare(b.park.name);
        }
        if (a.name && b.name) {
          return a.name.localeCompare(b.name);
        }
        return (a.facility.id ?? '').localeCompare(b.facility.id ?? '');
      },

      width: '15%',
    },
    {
      title: 'Hub Status',
      dataIndex: 'hubStatus',
      key: 'hubStatus',
      render: (text, record) => {
        const formattedStatus = formatEnumLabelToRemoveUnderscores(text);
        switch (text) {
          case 'ACTIVE':
            return (
              <>
                <Tag color="green" bordered={false}>
                  {formattedStatus}
                </Tag>
                <br />
                <div className="flex">
                  <p className="opacity-50 mr-2">Zone:</p>
                  {record.zone?.name && record.zone?.name}
                </div>
              </>
            );
          case 'INACTIVE':
            return (
              <Tag color="blue" bordered={false}>
                {formattedStatus}
              </Tag>
            );
          case 'UNDER_MAINTENANCE':
            return (
              <Tag color="yellow" bordered={false}>
                {formattedStatus}
              </Tag>
            );
          case 'DECOMMISSIONED':
            return (
              <Tag color="red" bordered={false}>
                {formattedStatus}
              </Tag>
            );
        }
      },
      filters: [
        { text: formatEnumLabelToRemoveUnderscores('ACTIVE'), value: 'ACTIVE' },
        { text: formatEnumLabelToRemoveUnderscores('INACTIVE'), value: 'INACTIVE' },
        { text: formatEnumLabelToRemoveUnderscores('UNDER_MAINTENANCE'), value: 'UNDER_MAINTENANCE' },
        { text: formatEnumLabelToRemoveUnderscores('DECOMMISSIONED'), value: 'DECOMMISSIONED' },
      ],
      onFilter: (value, record) => record.hubStatus === value,
      width: '15%',
    },
    /* {
      title: 'Next Maintenance Date',
      dataIndex: 'nextMaintenanceDate',
      key: 'nextMaintenanceDate',
      render: (text) => (text ? moment(text).format('D MMM YY') : '-'),
      sorter: (a, b) => {
        return moment(a.nextMaintenanceDate).valueOf() - moment(b.nextMaintenanceDate).valueOf();
      },
      width: '15%',
    },*/
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigateToDetails(record.id)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/hubs/${record.id}/edit`)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button danger type="link" icon={<MdDeleteOutline className="text-error" />} onClick={() => showDeleteModal(record)} />
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  const showDeleteModal = async (hub: HubResponse) => {
    try {
      const sensorsRes = await getSensorsByHubId(hub.id);
      if (sensorsRes.status === 200 && sensorsRes.data.length > 0) {
        setHubToBeDeleted(hub);
        setDeactivateModalOpen(true);
      } else {
        setHubToBeDeleted(hub);
        setDeleteModalOpen(true);
      }
    } catch (error) {
      messageApi.error('Failed to check hub sensors');
    }
  };

  const cancelDelete = () => {
    setHubToBeDeleted(null);
    setDeleteModalOpen(false);
    setDeactivateModalOpen(false);
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
      <ConfirmDeleteModal
        okText="Confirm Deactivate"
        onConfirm={cancelDelete}
        open={deactivateModalOpen}
        onCancel={cancelDelete}
        title="Unable to delete Hub"
        footer={null}
        description={
          <p>
            <MdError className="text-error inline mr-2 text-lg" />
            This Hub has {hubToBeDeleted?.sensors?.length} Sensor(s) assigned to it. Please deactivate the Sensor(s) first.
          </p>
        }
      />
      <Flex justify="end" gap={10}>
        <Input suffix={<FiSearch />} placeholder="Search in Hubs..." className="mb-4 bg-white" variant="filled" onChange={handleSearch} />
        <Button type="primary" onClick={() => navigate('/hubs/create')}>
          Create Hub
        </Button>
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
