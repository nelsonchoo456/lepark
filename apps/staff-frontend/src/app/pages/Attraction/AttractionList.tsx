import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Table, TableProps, Tag, Flex, Tooltip, message, Modal } from 'antd';
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
  updateAttractionDetails,
} from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';
import PageHeader2 from '../../components/main/PageHeader2';
import { MdDeleteOutline } from 'react-icons/md';
import { useFetchAttractions } from '../../hooks/Attractions/useFetchAttractions';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { SCREEN_LG } from '../../config/breakpoints';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const AttractionList: React.FC = () => {
  const { attractions, loading, triggerFetch } = useFetchAttractions();
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [attractionToBeDeleted, setAttractionToBeDeleted] = useState<AttractionResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { parks } = useFetchParks();
  const [closeAttractionModalOpen, setCloseAttractionModalOpen] = useState(false);

  const statusConfig: Record<AttractionStatusEnum, { color: string; label: string }> = {
    [AttractionStatusEnum.OPEN]: { color: 'green', label: formatEnumLabelToRemoveUnderscores(AttractionStatusEnum.OPEN) },
    [AttractionStatusEnum.CLOSED]: { color: 'red', label: formatEnumLabelToRemoveUnderscores(AttractionStatusEnum.CLOSED) },
    [AttractionStatusEnum.UNDER_MAINTENANCE]: {
      color: 'yellow',
      label: formatEnumLabelToRemoveUnderscores(AttractionStatusEnum.UNDER_MAINTENANCE),
    },
  };

  const filteredAttractions = useMemo(() => {
    const filtered = attractions;

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
    } catch (error: any) {
      console.log(error);
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('Attraction has existing visitor transactions and cannot be deleted')) {
        // messageApi.open({
        //   type: 'error',
        //   content: `Attraction has existing visitor transactions and cannot be deleted.`,
        // });
        if (attractionToBeDeleted) {
          setDeleteModalOpen(false);
          setCloseAttractionModalOpen(true);
        }
      } else {
        messageApi.open({
          type: 'error',
          content: `Unable to delete Attraction at this time. Please try again later.`,
        });
        setAttractionToBeDeleted(null);
        setDeleteModalOpen(false);
      }
    }
  };

  const handleSetAttractionAsClosed = async () => {
    try {
      if (!attractionToBeDeleted) return;
      
      await updateAttractionDetails(attractionToBeDeleted.id, { status: AttractionStatusEnum.CLOSED });
      triggerFetch();
      messageApi.open({
        type: 'success',
        content: `Attraction "${attractionToBeDeleted.title}" has been closed.`,
      });
    } catch (error) {
      console.error(error);
      messageApi.open({
        type: 'error',
        content: 'Failed to close the attraction. Please try again later.',
      });
    } finally {
      setCloseAttractionModalOpen(false);
      setAttractionToBeDeleted(null);
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
        {user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER ? (
          <Button
            type="primary"
            onClick={() => {
              navigate('create');
            }}
          >
            Create Attraction
          </Button>
        ) : null}
      </Flex>

      <Card>
        <Table dataSource={filteredAttractions} columns={columns} rowKey="id" loading={loading} scroll={{ x: SCREEN_LG }} />
      </Card>

      <Modal
        title="Close Attraction"
        open={closeAttractionModalOpen}
        onOk={handleSetAttractionAsClosed}
        onCancel={() => {
          setCloseAttractionModalOpen(false);
          setAttractionToBeDeleted(null);
        }}
      >
        <p>This attraction cannot be deleted because it has existing visitor ticket transactions.</p>
        <p>Would you like to close the attraction instead?</p>
      </Modal>
    </ContentWrapperDark>
  );
};

export default AttractionList;
