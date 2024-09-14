import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Table, TableProps, Tag, Flex, Tooltip, Typography, message } from 'antd';
import PageHeader from '../../components/main/PageHeader';
import { FiEye, FiSearch } from 'react-icons/fi';
import { StaffResponse, StaffType, ZoneResponse } from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';
import { useFetchZones } from '../../hooks/Zones/useFetchZones';
import { MdDeleteOutline, MdOutlineDeleteOutline } from "react-icons/md";
import { useState } from 'react';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { deleteZone } from '@lepark/data-access';

const ZoneList: React.FC = () => {
  const { zones, loading, triggerFetch } = useFetchZones();
  const { user } = useAuth<StaffResponse>();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [zoneToBeDeleted, setZoneToBeDeleted] = useState<ZoneResponse | null>(null);
  const navigate = useNavigate();

  const navigateToDetails = (occurrenceId: string) => {
    navigate(`/zones/${occurrenceId}`);
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
          default:
            return (
              <Tag color="red" bordered={false}>
                Limited Access
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
      onFilter: (value, record) => record.parkStatus === value,
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
            <Button danger icon={<MdOutlineDeleteOutline />} onClick={() => showDeleteModal(record as ZoneResponse)} disabled />
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  const columnsForSuperadmin: TableProps['columns'] = [
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
          default:
            return (
              <Tag color="red" bordered={false}>
                Limited Access
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
      onFilter: (value, record) => record.parkStatus === value,
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
            <Button danger type="link" icon={<MdDeleteOutline className='text-error'/>} onClick={() => showDeleteModal(record as ZoneResponse)}  />
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  const navigateTo = (zoneId: string) => {
    navigate(`/zone/${zoneId}`);
  };

  const cancelDelete = () => {
    setZoneToBeDeleted(null);
    setDeleteModalOpen(false);
  }

  const showDeleteModal = (zone: ZoneResponse) => {
    setDeleteModalOpen(true);
    console.log(zone)
    setZoneToBeDeleted(zone);
  }

  const deleteZoneToBeDeleted = async () => {
    try {
      if (!zoneToBeDeleted) {
        throw new Error("Unable to delete Zone at this time");
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
      console.log(error)
      setZoneToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.open({
        type: 'error',
        content: `Unable to delete Zone at this time. Please try again later.`,
      });
    }
  } 

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader>Zones Management</PageHeader>
      <ConfirmDeleteModal onConfirm={deleteZoneToBeDeleted} open={deleteModalOpen} description='Deleting a Zone deletes all of its Occurrences.' onCancel={cancelDelete}></ConfirmDeleteModal>
      <Flex justify="end" gap={10}>
        <Input suffix={<FiSearch />} placeholder="Search in Zones..." className="mb-4 bg-white" variant="filled" />
        <Tooltip title={user?.role !== StaffType.SUPERADMIN 
          && user?.role !== StaffType.MANAGER 
          && user?.role !== StaffType.LANDSCAPE_ARCHITECT ? "Not allowed to create zone!" : ""}>
          <Button
            type="primary"
            onClick={() => { navigate('/zone/create'); }}
            disabled={user?.role !== StaffType.SUPERADMIN 
              && user?.role !== StaffType.MANAGER 
              && user?.role !== StaffType.LANDSCAPE_ARCHITECT}
          >
            Create Zone
          </Button>
        </Tooltip>
      </Flex>

      <Card>
        {user?.role === StaffType.SUPERADMIN ? (
          <Table dataSource={zones} columns={columnsForSuperadmin} rowKey="id" loading={loading} />
        ) : (
          <Table dataSource={zones} columns={columns} rowKey="id" loading={loading} />
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default ZoneList;
