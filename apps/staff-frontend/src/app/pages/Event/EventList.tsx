import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Table, TableProps, Tag, Flex, Tooltip, message } from 'antd';
import { FiEye, FiSearch } from 'react-icons/fi';
import { useEffect, useMemo, useState } from 'react';
import { EventResponse, StaffType, StaffResponse, deleteEvent, EventStatusEnum, EventTypeEnum } from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';
import PageHeader2 from '../../components/main/PageHeader2';
import { MdDeleteOutline } from 'react-icons/md';
import { useFetchEvents } from '../../hooks/Events/useFetchEvents';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { SCREEN_LG } from '../../config/breakpoints';
import { useFetchFacilities } from '../../hooks/Facilities/useFetchFacilities';
import dayjs from 'dayjs';

const EventList: React.FC = () => {
  const { events, loading: eventsLoading, triggerFetch } = useFetchEvents();
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToBeDeleted, setEventToBeDeleted] = useState<EventResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { parks } = useFetchParks();
  const { facilities, loading: facilitiesLoading } = useFetchFacilities();

  const statusConfig: Record<EventStatusEnum, { color: string; label: string }> = {
    [EventStatusEnum.UPCOMING]: { color: 'processing', label: 'Upcoming' },
    [EventStatusEnum.ONGOING]: { color: 'success', label: 'Ongoing' },
    [EventStatusEnum.COMPLETED]: { color: 'gold', label: 'Completed' },
    [EventStatusEnum.CANCELLED]: { color: 'default', label: 'Cancelled' },
  };

  const typeConfig: Record<EventTypeEnum, { label: string }> = {
    [EventTypeEnum.WORKSHOP]: { label: 'Workshop' },
    [EventTypeEnum.EXHIBITION]: { label: 'Exhibition' },
    [EventTypeEnum.GUIDED_TOUR]: { label: 'Guided Tour' },
    [EventTypeEnum.PERFORMANCE]: { label: 'Performance' },
    [EventTypeEnum.TALK]: { label: 'Talk' },
    [EventTypeEnum.COMPETITION]: { label: 'Competition' },
    [EventTypeEnum.FESTIVAL]: { label: 'Festival' },
    [EventTypeEnum.CONFERENCE]: { label: 'Conference' },
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const facility = facilities.find((f) => f.id === event.facilityId);
      const park = parks.find((p) => p.id === facility?.parkId);
      return (
        Object.values(event).some((value) => value?.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
        park?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery, events, parks]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navigateToDetails = (eventId: string) => {
    navigate(`${eventId}`);
  };

  const columns: TableProps<EventResponse>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.title.localeCompare(b.title),
      fixed: 'left',
    },
    // {
    //   title: 'Description',

    //   dataIndex: 'description',
    //   key: 'description',
    //   ellipsis: true,
    // },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: EventTypeEnum) => {
        const { label } = typeConfig[type];
        return <div>{label}</div>;
      },
      filters: Object.entries(typeConfig).map(([value, { label }]) => ({
        text: label,
        value,
      })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Date & Time',
      key: 'dateTime',
      render: (_, record) => {
        const startDateTime = record.startDate ? dayjs(record.startDate) : null;
        const endDateTime = record.endDate ? dayjs(record.endDate) : null;
        return (
          <div>
            <div>
              {startDateTime ? startDateTime.format('DD MMM YYYY') : 'N/A'} - {endDateTime ? endDateTime.format('DD MMM YYYY') : 'N/A'}
            </div>
            <div>
              {startDateTime ? startDateTime.format('hh:mm A') : 'N/A'} - {endDateTime ? endDateTime.format('hh:mm A') : 'N/A'}
            </div>
          </div>
        );
      },
      sorter: (a, b) => {
        const dateTimeA = dayjs(a.startDate);
        const dateTimeB = dayjs(b.startDate);
        return dateTimeA.isValid() && dateTimeB.isValid() ? dateTimeA.valueOf() - dateTimeB.valueOf() : 0;
      },
    },
    {
      title: user?.role === StaffType.SUPERADMIN ? 'Park, Facility' : 'Facility',
      dataIndex: 'facilityId',
      key: 'park',
      render: (facilityId) => {
        const facility = facilities.find((f) => f.id === facilityId);
        const park = parks.find((p) => p.id === facility?.parkId);
        if (user?.role === StaffType.SUPERADMIN) {
          return (
            <div>
              <div className="font-semibold">{park ? park.name : 'Unknown Park'}</div>
              <div className="flex">
                <p className="opacity-50 mr-2">Zone:</p>
                {facility ? facility.name : 'Unknown Facility'}
              </div>
            </div>
          );
        } else {
          return <div>{facility ? facility.name : 'Unknown Facility'}</div>;
        }
      },
      filters: useMemo(() => {
        if (user?.role === StaffType.SUPERADMIN) {
          const parkFilters = [...new Set(facilities.map((f) => f.parkId))].map((parkId) => {
            const park = parks.find((p) => p.id === parkId);
            return {
              text: park ? park.name : `Park ${parkId}`,
              value: parkId,
              children: facilities.filter((f) => f.parkId === parkId).map((f) => ({ text: f.name, value: f.id })),
            };
          });
          return parkFilters;
        } else {
          return facilities.map((f) => ({ text: f.name, value: f.id }));
        }
      }, [facilities, parks, user?.role]),
      onFilter: (value, record) => {
        const facility = facilities.find((f) => f.id === record.facilityId);
        if (user?.role === StaffType.SUPERADMIN) {
          return facility?.parkId === value || facility?.id === value;
        } else {
          return facility?.id === value;
        }
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: EventStatusEnum) => {
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
    setEventToBeDeleted(null);
    setDeleteModalOpen(false);
  };

  const showDeleteModal = (event: EventResponse) => {
    setDeleteModalOpen(true);
    setEventToBeDeleted(event);
  };

  const deleteEventToBeDeleted = async () => {
    try {
      if (!eventToBeDeleted || !user) {
        throw new Error('Unable to delete Event at this time');
      }
      await deleteEvent(eventToBeDeleted.id);
      triggerFetch();
      setEventToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.open({
        type: 'success',
        content: `Deleted Event: ${eventToBeDeleted.title}.`,
      });
    } catch (error) {
      console.log(error);
      setEventToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.open({
        type: 'error',
        content: `Unable to delete Event at this time. Please try again later.`,
      });
    }
  };

  const breadcrumbItems = [
    {
      title: 'Event Management',
      pathKey: '/event',
      isMain: true,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <ConfirmDeleteModal
        onConfirm={deleteEventToBeDeleted}
        open={deleteModalOpen}
        onCancel={cancelDelete}
        description="Are you sure you want to delete this event?"
      />
      <Flex justify="end" gap={10}>
        <Input suffix={<FiSearch />} placeholder="Search in Events..." className="mb-4 bg-white" variant="filled" onChange={handleSearch} />
        <Button
          type="primary"
          onClick={() => {
            navigate('create');
          }}
          disabled={user?.role !== StaffType.SUPERADMIN && user?.role !== StaffType.MANAGER}
        >
          Create Event
        </Button>
      </Flex>

      <Card>
        <Table
          dataSource={filteredEvents}
          columns={columns}
          rowKey="id"
          loading={eventsLoading || facilitiesLoading}
          scroll={{ x: SCREEN_LG }}
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default EventList;
