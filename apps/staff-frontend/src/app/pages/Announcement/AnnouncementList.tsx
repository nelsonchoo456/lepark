import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Table, TableProps, Tag, Flex, Tooltip, message } from 'antd';
import moment from 'moment';
import { FiEye, FiSearch } from 'react-icons/fi';
import { useState, useMemo, Key } from 'react';
import {
  AnnouncementResponse,
  StaffType,
  StaffResponse,
  deleteAnnouncement,
  AnnouncementStatusEnum,
} from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';
import PageHeader2 from '../../components/main/PageHeader2';
import { MdDeleteOutline } from 'react-icons/md';
import { useFetchAnnouncements } from '../../hooks/Announcements/useFetchAnnouncements';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { SCREEN_LG } from '../../config/breakpoints';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const AnnouncementList: React.FC = () => {
  const { announcements, loading, triggerFetch } = useFetchAnnouncements();
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [announcementToBeDeleted, setAnnouncementToBeDeleted] = useState<AnnouncementResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { parks } = useFetchParks();

  const statusConfig: Record<AnnouncementStatusEnum, { color: string; label: string }> = {
    [AnnouncementStatusEnum.UPCOMING]: { color: 'blue', label: formatEnumLabelToRemoveUnderscores(AnnouncementStatusEnum.UPCOMING) },
    [AnnouncementStatusEnum.ACTIVE]: { color: 'green', label: formatEnumLabelToRemoveUnderscores(AnnouncementStatusEnum.ACTIVE) },
    [AnnouncementStatusEnum.EXPIRED]: { color: 'gold', label: formatEnumLabelToRemoveUnderscores(AnnouncementStatusEnum.EXPIRED) },
    [AnnouncementStatusEnum.INACTIVE]: { color: 'default', label: formatEnumLabelToRemoveUnderscores(AnnouncementStatusEnum.INACTIVE) },
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => {
      const park = parks.find((p) => p.id === announcement.parkId);
      const parkName = park ? park.name : 'NParks';
      return (
        Object.values(announcement).some((value) => 
          value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        parkName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery, announcements, parks]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navigateToDetails = (announcementId: string) => {
    navigate(`${announcementId}`);
  };

  const columns: TableProps<AnnouncementResponse>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.title.localeCompare(b.title),
      fixed: 'left',
    },
    // {
    //   title: 'Content',
    //   dataIndex: 'content',
    //   key: 'content',
    //   ellipsis: true,
    // },
    {
      title: 'Park',
      dataIndex: 'parkId',
      key: 'parkId',
      render: (parkId: number | null) => {
        const park = parks.find((p) => p.id === parkId);
        return <div>{park ? park.name : 'NParks'}</div>;
      },
      filters: useMemo(() => {
        if (user?.role === StaffType.SUPERADMIN) {
          const uniqueParkIds = [...new Set(announcements.map((a) => a.parkId))];
          return [
            { text: 'NParks', value: 'nparks' },
            ...uniqueParkIds
              .filter((parkId): parkId is number => parkId !== null)
              .map((parkId) => {
                const park = parks.find((p) => p.id === parkId);
                return { text: park ? park.name : `Park ${parkId}`, value: parkId };
              })
          ];
        } else if (user?.parkId) {
          const userPark = parks.find(p => p.id === user.parkId);
          return [
            { text: 'NParks', value: 'nparks' },
            { text: userPark ? userPark.name : `Park ${user.parkId}`, value: user.parkId }
          ];
        } else {
          return [{ text: 'NParks', value: 'nparks' }];
        }
      }, [announcements, parks, user]),
      onFilter: (value: boolean | Key, record: AnnouncementResponse) => {
        if (value === 'nparks') return record.parkId === null;
        return record.parkId === value;
      },
    },
    {
      title: 'Publish Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => moment(date).format('DD MMM YYYY'),
      sorter: (a, b) => moment(a.startDate).unix() - moment(b.startDate).unix(),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => moment(date).format('DD MMM YYYY'),
      sorter: (a, b) => moment(a.endDate).unix() - moment(b.endDate).unix(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: AnnouncementStatusEnum) => {
        const { color, label } = statusConfig[status];
        return (
          <Tag color={color} bordered={false}>
            {label}
          </Tag>
        );
      },
      filters: Object.entries(statusConfig).map(([value, { label }]) => ({ text: label, value })),
      onFilter: (value, record) => record.status === value,
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

  const cancelDelete = () => {
    setAnnouncementToBeDeleted(null);
    setDeleteModalOpen(false);
  };

  const showDeleteModal = (announcement: AnnouncementResponse) => {
    setDeleteModalOpen(true);
    setAnnouncementToBeDeleted(announcement);
  };

  const deleteAnnouncementToBeDeleted = async () => {
    try {
      if (!announcementToBeDeleted || !user) {
        throw new Error('Unable to delete Announcement at this time');
      }
      await deleteAnnouncement(announcementToBeDeleted.id);
      triggerFetch();
      setAnnouncementToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.open({
        type: 'success',
        content: `Deleted Announcement: ${announcementToBeDeleted.title}.`,
      });
    } catch (error) {
      console.log(error);
      setAnnouncementToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.open({
        type: 'error',
        content: `Unable to delete Announcement at this time. Please try again later.`,
      });
    }
  };

  const breadcrumbItems = [
    {
      title: 'Announcement Management',
      pathKey: '/announcement',
      isMain: true,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <ConfirmDeleteModal
        onConfirm={deleteAnnouncementToBeDeleted}
        open={deleteModalOpen}
        onCancel={cancelDelete}
        description="Are you sure you want to delete this announcement?"
      ></ConfirmDeleteModal>
      <Flex justify="end" gap={10}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search in Announcements..."
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
            Create Announcement
          </Button>
        ) : null}
      </Flex>

      <Card>
        <Table dataSource={filteredAnnouncements} columns={columns} rowKey="id" loading={loading} scroll={{ x: SCREEN_LG }} pagination={{ pageSize: 10 }} />
      </Card>
    </ContentWrapperDark>
  );
};

export default AnnouncementList;