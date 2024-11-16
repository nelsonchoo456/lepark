import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { BookingResponse, BookingStatusEnum, StaffResponse } from '@lepark/data-access';
import { Button, Card, Flex, Input, Table, TableProps, Tag, Tooltip, message } from 'antd';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { FiEye, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import { useFetchBookings } from '../../hooks/Booking/useFetchBookings';

const statusConfig: Record<BookingStatusEnum, { color: string; label: string }> = {
  [BookingStatusEnum.PENDING]: { color: 'yellow', label: 'Pending' },
  [BookingStatusEnum.CANCELLED]: { color: 'red', label: 'Cancelled' },
  [BookingStatusEnum.REJECTED]: { color: 'red', label: 'Rejected' },
  [BookingStatusEnum.APPROVED_PENDING_PAYMENT]: { color: 'yellow', label: 'Approved Pending Payment' },
  [BookingStatusEnum.CONFIRMED]: { color: 'green', label: 'Confirmed' },
};

const BookingList: React.FC = () => {
  const { bookings, loading, triggerFetch } = useFetchBookings();
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      return (
        booking.bookingPurpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.bookingStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.facility?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery, bookings]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navigateToDetails = (bookingId: string) => {
    navigate(`/facilities/bookings/${bookingId}`);
  };

  const formatEnumValue = (value: string) => {
    return value
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const columns: TableProps<BookingResponse>['columns'] = [
    {
      title: 'Booking Purpose',
      dataIndex: 'bookingPurpose',
      key: 'bookingPurpose',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.bookingPurpose.localeCompare(b.bookingPurpose),
      width: '15%',
    },
    {
      title: 'Pax',
      dataIndex: 'pax',
      key: 'pax',
      render: (text) => <div>{text}</div>,
      sorter: (a, b) => a.pax - b.pax,
      width: '10%',
    },
    {
      title: 'Booking Status',
      dataIndex: 'bookingStatus',
      key: 'bookingStatus',
      render: (status: BookingStatusEnum) => {
        const { color, label } = statusConfig[status];
        return (
          <Tag color={color} bordered={false}>
            {label}
          </Tag>
        );
      },
      filters: Object.entries(statusConfig).map(([value, { label }]) => ({ text: label, value })),
      onFilter: (value, record) => record.bookingStatus === value,
      width: '15%',
    },
    {
      title: 'Date Start',
      dataIndex: 'dateStart',
      key: 'dateStart',
      render: (text) => moment(text).format('D MMM YY'),
      sorter: (a, b) => moment(a.dateStart).unix() - moment(b.dateStart).unix(),
      width: '15%',
    },
    {
      title: 'Date End',
      dataIndex: 'dateEnd',
      key: 'dateEnd',
      render: (text) => moment(text).format('D MMM YY'),
      sorter: (a, b) => moment(a.dateEnd).unix() - moment(b.dateEnd).unix(),
      width: '15%',
    },
    {
      title: 'Date Booked',
      dataIndex: 'dateBooked',
      key: 'dateBooked',
      render: (text) => moment(text).format('D MMM YY'),
      sorter: (a, b) => moment(a.dateBooked).unix() - moment(b.dateBooked).unix(),
      width: '15%',
    },
    {
      title: 'Payment Deadline',
      dataIndex: 'paymentDeadline',
      key: 'paymentDeadline',
      render: (text) => (text ? moment(text).format('D MMM YY') : 'N/A'),
      sorter: (a, b) => moment(a.paymentDeadline).unix() - moment(b.paymentDeadline).unix(),
      width: '15%',
    },
    {
      title: 'Facility',
      dataIndex: 'facility',
      key: 'facility',
      render: (facility) => <div>{facility.name}</div>,
      filters: Array.from(new Set(bookings.map((booking) => booking.facility?.name).filter((name) => name !== undefined))).map((name) => ({
        text: name,
        value: name,
      })),
      onFilter: (value, record) => record.facility?.name === value,
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigateToDetails(record.id)} />
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Booking Management',
      pathKey: '/facilities/bookings',
      isMain: true,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Flex justify="end" gap={10}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search in Bookings..."
          className="mb-4 bg-white"
          variant="filled"
          onChange={handleSearch}
        />
      </Flex>
      <Card>
        <Table dataSource={filteredBookings} columns={columns} rowKey="id" loading={loading} />
      </Card>
    </ContentWrapperDark>
  );
};

export default BookingList;
