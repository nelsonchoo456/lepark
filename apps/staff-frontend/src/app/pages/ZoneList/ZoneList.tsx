import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Table, TableProps, Tag, Flex, Tooltip, Typography, message } from 'antd';
import PageHeader from '../../components/main/PageHeader';
import { FiEye, FiSearch } from 'react-icons/fi';
import { StaffResponse, StaffType, ZoneResponse } from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';
import { useFetchZones } from '../../hooks/Zones/useFetchZones';
import { MdDeleteOutline, MdOutlineDeleteOutline } from 'react-icons/md';
import { useState, useMemo } from 'react';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { deleteZone } from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import { SCREEN_LG } from '../../config/breakpoints';

const ZoneList: React.FC = () => {
  const { zones, loading, triggerFetch } = useFetchZones();
  const { user } = useAuth<StaffResponse>();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [zoneToBeDeleted, setZoneToBeDeleted] = useState<ZoneResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredZones = useMemo(() => {
    return zones.filter((zone) =>
      Object.values(zone).some((value) => 
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, zones]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navigateToDetails = (zoneId: string) => {
    navigate(`/zones/${zoneId}`);
  };

  const navigateToSpecies = (speciesId: string) => {
    navigate(`/species/viewSpeciesDetails/${speciesId}`);
  };

  const columns: TableProps['columns'] = [
    {
      title: 'Zone Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Flex justify="space-between" align="center" className="font-semibold">
          {text}
        </Flex>
      ),
      sorter: (a, b) => {
        return a.name.localeCompare(b.name);
      },
      width: '50%',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <Typography.Paragraph
          ellipsis={{
            rows: 2,
          }}
        >
          {text}
        </Typography.Paragraph>
      ),
      sorter: (a, b) => {
        return a.description.localeCompare(b.description);
      },
      width: '50%',
    },
    {
      title: 'Status',
      dataIndex: 'zoneStatus',
      key: 'zoneStatus',
      render: (text) => {
        switch (text) {
          case 'OPEN':
            return (
              <Tag color="green" bordered={false}>
                Open
              </Tag>
            );
          case 'UNDER_CONSTRUCTION':
            return (
              <Tag color="red" bordered={false}>
                Under Construction
              </Tag>
            );
          case 'LIMITED_ACCESS':
            return (
              <Tag color="orange" bordered={false}>
                Limited Access
              </Tag>
            );
          case 'CLOSED':
            return (
              <Tag color="red" bordered={false}>
                Closed
              </Tag>
            );
          default:
            return (
              <Tag color="default" bordered={false}>
                Unknown
              </Tag>
            );
        }
      },
      filters: [
        { text: 'Open', value: 'OPEN' },
        { text: 'Under Construction', value: 'UNDER_CONSTRUCTION' },
        { text: 'Limited Access', value: 'LIMITED_ACCESS' },
        { text: 'Closed', value: 'CLOSED' },
      ],
      onFilter: (value, record) => record.zoneStatus === value,
      width: '1%',
    },
    {
      title: 'Actions',
      key: 'actions',
      dataIndex: 'id',
      render: (id, record) => (
        <Flex justify="center">
          <Tooltip title="Details Page coming soon">
            <Button type="link" icon={<FiEye />} onClick={() => navigateTo(id)} disabled />
          </Tooltip>
          {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) && (
            <>
              <Tooltip title="Edit Page coming soon">
                <Button type="link" icon={<RiEdit2Line />} onClick={() => navigateTo(`${id}/edit`)} disabled />
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  danger
                  type="link"
                  icon={<MdDeleteOutline className="text-error" />}
                  onClick={() => showDeleteModal(record as ZoneResponse)}
                />
              </Tooltip>
            </>
          )}
        </Flex>
      ),
      width: '1%',
    },
  ];

  const columnsForSuperadmin: TableProps['columns'] = [
    {
      title: 'Zone Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Flex justify="space-between" align="center" className="font-semibold">
          {text}
        </Flex>
      ),
      sorter: (a, b) => {
        return a.name.localeCompare(b.name);
      },
      width: '33%',
    },
    {
      title: 'Park',
      dataIndex: 'parkName',
      key: 'parkName',
      render: (text) => (
        <Flex justify="space-between" align="center">
          {text}
        </Flex>
      ),
      sorter: (a, b) => {
        return a.name.localeCompare(b.name);
      },
      width: '33%',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <Typography.Paragraph
          ellipsis={{
            rows: 2,
          }}
        >
          {text}
        </Typography.Paragraph>
      ),
      sorter: (a, b) => {
        return a.description.localeCompare(b.description);
      },
      width: '33%',
    },
    {
      title: 'Status',
      dataIndex: 'zoneStatus',
      key: 'zoneStatus',
      render: (text) => {
        switch (text) {
          case 'OPEN':
            return (
              <Tag color="green" bordered={false}>
                Open
              </Tag>
            );
          case 'UNDER_CONSTRUCTION':
            return (
              <Tag color="red" bordered={false}>
                Under Construction
              </Tag>
            );
          case 'LIMITED_ACCESS':
            return (
              <Tag color="orange" bordered={false}>
                Limited Access
              </Tag>
            );
          case 'CLOSED':
            return (
              <Tag color="red" bordered={false}>
                Closed
              </Tag>
            );
          default:
            return (
              <Tag color="default" bordered={false}>
                Unknown
              </Tag>
            );
        }
      },
      filters: [
        { text: 'Open', value: 'OPEN' },
        { text: 'Under Construction', value: 'UNDER_CONSTRUCTION' },
        { text: 'Limited Access', value: 'LIMITED_ACCESS' },
        { text: 'Closed', value: 'CLOSED' },
      ],
      onFilter: (value, record) => record.zoneStatus === value,
      width: '1%',
    },
    {
      title: 'Actions',
      key: 'actions',
      dataIndex: 'id',
      render: (id, record) => (
        <Flex justify="center">
          <Tooltip title="Details Page coming soon">
            <Button type="link" icon={<FiEye />} onClick={() => navigateTo(id)} disabled />
          </Tooltip>
          <Tooltip title="Edit Page coming soon">
            <Button type="link" icon={<RiEdit2Line />} onClick={() => navigateTo(`${id}/edit`)} disabled />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              type="link"
              icon={<MdDeleteOutline className="text-error" />}
              onClick={() => showDeleteModal(record as ZoneResponse)}
            />
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  const navigateTo = (zoneId: string) => {
    navigate(`/zone/${zoneId}`);
  };

  // Confirm Delete Modal utility
  const cancelDelete = () => {
    setZoneToBeDeleted(null);
    setDeleteModalOpen(false);
  };

  const showDeleteModal = (zone: ZoneResponse) => {
    setDeleteModalOpen(true);
    console.log(zone);
    setZoneToBeDeleted(zone);
  };

  const deleteZoneToBeDeleted = async () => {
    try {
      if (!zoneToBeDeleted) {
        throw new Error('Unable to delete Zone at this time');
      }
      await deleteZone(zoneToBeDeleted.id);
      triggerFetch();
      setZoneToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.open({
        type: 'success',
        content: `Deleted Zone: ${zoneToBeDeleted.name}.`,
      });
    } catch (error) {
      console.log(error);
      setZoneToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.open({
        type: 'error',
        content: `Unable to delete Zone at this time. Please try again later.`,
      });
    }
  } 

  const breadcrumbItems = [
    {
      title: 'Zones Management',
      pathKey: '/zone',
      isMain: true,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems}/>
      <ConfirmDeleteModal onConfirm={deleteZoneToBeDeleted} open={deleteModalOpen} description='Deleting a Zone deletes all of its Occurrences.' onCancel={cancelDelete}></ConfirmDeleteModal>
      <Flex justify="end" gap={10}>
        <Input 
          suffix={<FiSearch />} 
          placeholder="Search in Zones..." 
          className="mb-4 bg-white" 
          variant="filled" 
          onChange={handleSearch}
        />
        <Tooltip
          title={
            user?.role !== StaffType.SUPERADMIN && user?.role !== StaffType.MANAGER && user?.role !== StaffType.LANDSCAPE_ARCHITECT
              ? 'Not allowed to create zone!'
              : ''
          }
        >
          <Button
            type="primary"
            onClick={() => {
              navigate('/zone/create');
            }}
            disabled={
              user?.role !== StaffType.SUPERADMIN && user?.role !== StaffType.MANAGER && user?.role !== StaffType.LANDSCAPE_ARCHITECT
            }
          >
            Create Zone
          </Button>
        </Tooltip>
      </Flex>

      <Card>
        {user?.role === StaffType.SUPERADMIN ? (
          <Table dataSource={filteredZones} columns={columnsForSuperadmin} rowKey="id" loading={loading} scroll={{ x: SCREEN_LG }}/>
        ) : (
          <Table dataSource={filteredZones} columns={columns} rowKey="id" loading={loading}  scroll={{ x: SCREEN_LG }}/>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default ZoneList;
