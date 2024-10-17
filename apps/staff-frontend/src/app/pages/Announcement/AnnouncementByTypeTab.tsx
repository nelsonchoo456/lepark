import React, { Key, useMemo, useState } from 'react';
import { Button, Input, Table, Flex, Tag, Card, Tooltip, message, TableProps } from 'antd';
import { AnnouncementResponse, AnnouncementStatusEnum, deleteAnnouncement, ParkResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { FiEye, FiSearch } from 'react-icons/fi';
import { RiEdit2Line } from 'react-icons/ri';
import { Logo, LogoText, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { SCREEN_LG } from '../../config/breakpoints';
import moment from 'moment';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { MdDeleteOutline } from 'react-icons/md';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';

interface AnnouncementByTypeTabProps {
  announcements: AnnouncementResponse[];
  triggerFetch: () => void;
  tableShowParks?: boolean;
}

const AnnouncementByTypeTab: React.FC<AnnouncementByTypeTabProps> = ({ announcements, triggerFetch, tableShowParks = false }) => {
  const { user } = useAuth<StaffResponse>();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [announcementToBeDeleted, setAnnouncementToBeDeleted] = useState<AnnouncementResponse | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
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

  const columns: TableProps<AnnouncementResponse>['columns'] = [
    {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        render: (text: string) => <div className="font-semibold">{text}</div>,
        sorter: (a: AnnouncementResponse, b: AnnouncementResponse) => a.title.localeCompare(b.title),
        fixed: 'left',
      },
      {
        title: 'Publish Date',
        dataIndex: 'startDate',
        key: 'startDate',
        render: (date: string) => moment(date).format('DD MMM YYYY'),
        sorter: (a: AnnouncementResponse, b: AnnouncementResponse) => moment(a.startDate).unix() - moment(b.startDate).unix(),
      },
      {
        title: 'End Date',
        dataIndex: 'endDate',
        key: 'endDate',
        render: (date: string) => moment(date).format('DD MMM YYYY'),
        sorter: (a: AnnouncementResponse, b: AnnouncementResponse) => moment(a.endDate).unix() - moment(b.endDate).unix(),
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
        onFilter: (value: boolean | Key, record: AnnouncementResponse) => {
          if (value === 'nparks') return record.parkId === null;
          return record.status === value;
        },
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_: any, record: AnnouncementResponse) => (
          <Flex justify="center" gap={8}>
            <Tooltip title="View Details">
              <Button type="link" icon={<FiEye />} onClick={() => navigate(`/announcement/${record.id}`)} />
            </Tooltip>
            {user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER || user?.role === StaffType.PARK_RANGER ? (
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

  const columnsWithParks: TableProps<AnnouncementResponse>['columns'] = [
    {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        render: (text: string) => <div className="font-semibold">{text}</div>,
        sorter: (a: AnnouncementResponse, b: AnnouncementResponse) => a.title.localeCompare(b.title),
        fixed: 'left',
      },
      {
        title: 'Park',
        dataIndex: 'parkId',
        key: 'parkId',
        render: (parkId: number | null) => 
            parkId === null ? (
              <div className="flex gap-2">
                <Logo size={1.2} />
                <LogoText>NParks-Wide</LogoText>
              </div>
            ) : (
              <div className="font-semibold">{
                parks.find((p: ParkResponse) => p.id === parkId)?.name
              }</div>
            ),
        // render: (parkId: number | null) => {
        //   const park = parks.find((p: ParkResponse) => p.id === parkId);
        //   return <div>{park ? park.name : 'NParks'}</div>;
        // },
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
        render: (date: string) => moment(date).format('DD MMM YYYY'),
        sorter: (a: AnnouncementResponse, b: AnnouncementResponse) => moment(a.startDate).unix() - moment(b.startDate).unix(),
      },
      {
        title: 'End Date',
        dataIndex: 'endDate',
        key: 'endDate',
        render: (date: string) => moment(date).format('DD MMM YYYY'),
        sorter: (a: AnnouncementResponse, b: AnnouncementResponse) => moment(a.endDate).unix() - moment(b.endDate).unix(),
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
        onFilter: (value: boolean | Key, record: AnnouncementResponse) => {
          if (value === 'nparks') return record.parkId === null;
          return record.status === value;
        },
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_: any, record: AnnouncementResponse) => (
          <Flex justify="center" gap={8}>
            <Tooltip title="View Details">
              <Button type="link" icon={<FiEye />} onClick={() => navigate(`/announcement/${record.id}`)} />
            </Tooltip>
            {user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER || user?.role === StaffType.PARK_RANGER ? (
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

  const handleSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

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

  return (
    <Card styles={{ body: { padding: 0 } }} className="p-4 border-t-0 rounded-tl-none">
      <Flex justify="end" gap={10}>
        <Input 
          suffix={<FiSearch />} 
          placeholder="Search for an Announcement..." 
          onChange={handleSearchBar} 
          className="mb-4" 
          variant="filled" 
        />
        <Button type="primary" onClick={() => navigate('/announcement/create')}>
          Create Announcement
        </Button>
      </Flex>
      <Table
        columns={tableShowParks ? columnsWithParks : columns}
        dataSource={filteredAnnouncements}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        scroll={{ x: SCREEN_LG }}
      />
        <ConfirmDeleteModal
        onConfirm={deleteAnnouncementToBeDeleted}
        open={deleteModalOpen}
        onCancel={cancelDelete}
        description="Are you sure you want to delete this announcement?"
      ></ConfirmDeleteModal>
    </Card>
  );
};

const statusConfig = {
  UPCOMING: { color: 'blue', label: formatEnumLabelToRemoveUnderscores('UPCOMING') },
  ACTIVE: { color: 'green', label: formatEnumLabelToRemoveUnderscores('ACTIVE') },
  EXPIRED: { color: 'gold', label: formatEnumLabelToRemoveUnderscores('EXPIRED') },
  INACTIVE: { color: 'default', label: formatEnumLabelToRemoveUnderscores('INACTIVE') },
};

export default AnnouncementByTypeTab;