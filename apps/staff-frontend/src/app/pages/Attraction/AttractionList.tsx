import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Table, TableProps, Tag, Flex, Tooltip, message } from 'antd';
import moment from 'moment';
import { FiArchive, FiExternalLink, FiEye, FiSearch } from 'react-icons/fi';
import { useEffect, useState, useMemo } from 'react';
import {
  getAllAttractions,
  AttractionResponse,
  StaffType,
  StaffResponse,
  deleteAttraction,
  AttractionStatusEnum,
} from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';
import PageHeader2 from '../../components/main/PageHeader2';
import { MdDeleteOutline } from 'react-icons/md';
import { useFetchAttractions } from '../../hooks/Attractions/useFetchAttractions';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { SCREEN_LG } from '../../config/breakpoints';

const AttractionList: React.FC = () => {
  const { attractions, loading, triggerFetch } = useFetchAttractions();
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [attractionToBeDeleted, setAttractionToBeDeleted] = useState<AttractionResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { parks } = useFetchParks();

  const statusConfig: Record<AttractionStatusEnum, { color: string; label: string }> = {
    [AttractionStatusEnum.OPEN]: { color: 'green', label: 'Open' },
    [AttractionStatusEnum.CLOSED]: { color: 'red', label: 'Closed' },
    [AttractionStatusEnum.UNDER_MAINTENANCE]: { color: 'orange', label: 'Under Maintenance' },
  };

  const filteredAttractions = useMemo(() => {
    let filtered = attractions;

    return filtered.filter((attraction) => {
      const park = parks.find((p) => p.id === attraction.parkId);
      return (
        Object.values(attraction).some((value) => value?.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
        park?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery, attractions, parks, user]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navigateToDetails = (attractionId: string) => {
    navigate(`${attractionId}`);
  };

  const columns: TableProps<AttractionResponse>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.title.localeCompare(b.title),
      fixed: 'left',
    },
    {
      title: 'Park',
      dataIndex: 'parkId',
      key: 'parkId',
      render: (parkId) => {
        const park = parks.find((p) => p.id === parkId);
        return <div>{park ? park.name : parkId}</div>;
      },
      filters:
        user?.role === StaffType.SUPERADMIN
          ? useMemo(() => {
              const uniqueParkIds = [...new Set(attractions.map((a) => a.parkId))];
              return uniqueParkIds.map((parkId) => {
                const park = parks.find((p) => p.id === parkId);
                return { text: park ? park.name : `Park ${parkId}`, value: parkId };
              });
            }, [attractions, parks])
          : undefined,
      onFilter: user?.role === StaffType.SUPERADMIN ? (value, record) => record.parkId === value : undefined,
      // width: '25%',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      // width: '40%',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: AttractionStatusEnum) => {
        const { color, label } = statusConfig[status];
        return (
          <Tag color={color} bordered={false}>
            {label}
          </Tag>
        );
      },
      filters: Object.entries(statusConfig).map(([value, { label }]) => ({ text: label, value })),
      onFilter: (value, record) => record.status === value,
      // width: '50%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigateToDetails(record.id)} />
          </Tooltip>
          {user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER ? (
            <>
              <Tooltip title="Edit Details">
                <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`${record.id}/edit`)} />
              </Tooltip>
              <Tooltip title="Delete">
                <Button danger type="link" icon={<MdDeleteOutline className="text-error" />} onClick={() => showDeleteModal(record)} />
              </Tooltip>
            </>
          ) : null}
        </Flex>
      ),
      width: '110px',
    },
  ];

  // Confirm Delete Modal utility
  const cancelDelete = () => {
    setAttractionToBeDeleted(null);
    setDeleteModalOpen(false);
  };

  const showDeleteModal = (attraction: AttractionResponse) => {
    setDeleteModalOpen(true);
    setAttractionToBeDeleted(attraction);
  };

  const deleteAttractionToBeDeleted = async () => {
    try {
      if (!attractionToBeDeleted || !user) {
        throw new Error('Unable to delete Attraction at this time');
      }
      await deleteAttraction(attractionToBeDeleted.id);
      triggerFetch();
      setAttractionToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.open({
        type: 'success',
        content: `Deleted Attraction: ${attractionToBeDeleted.title}.`,
      });
    } catch (error) {
      console.log(error);
      setAttractionToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.open({
        type: 'error',
        content: `Unable to delete Attraction at this time. Please try again later.`,
      });
    }
  };

  const breadcrumbItems = [
    {
      title: 'Attraction Management',
      pathKey: '/attraction',
      isMain: true,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <ConfirmDeleteModal
        onConfirm={deleteAttractionToBeDeleted}
        open={deleteModalOpen}
        onCancel={cancelDelete}
        description="Are you sure you want to delete this attraction?"
      ></ConfirmDeleteModal>
      <Flex justify="end" gap={10}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search in Attractions..."
          className="mb-4 bg-white"
          variant="filled"
          onChange={handleSearch}
        />
        <Button
          type="primary"
          onClick={() => {
            navigate('create');
          }}
          disabled={user?.role !== StaffType.SUPERADMIN && user?.role !== StaffType.MANAGER}
        >
          Create Attraction
        </Button>
      </Flex>

      <Card>
        <Table dataSource={filteredAttractions} columns={columns} rowKey="id" loading={loading} scroll={{ x: SCREEN_LG }} />
      </Card>
    </ContentWrapperDark>
  );
};

export default AttractionList;
