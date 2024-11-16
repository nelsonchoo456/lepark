import React, { useEffect, useState } from 'react';
import { LogoText } from '@lepark/common-ui';
import { BookingResponse, VisitorResponse } from '@lepark/data-access';
import DetailedBookingCard from './components/DetailedBookingCard';
import { getBookingsByVisitorId } from '@lepark/data-access';
import { useAuth } from '@lepark/common-ui';
import { Input, Empty, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Option } = Select;

const ViewBookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingResponse[]>([]);
  const [sortCriteria, setSortCriteria] = useState<string>('all');
  const { user } = useAuth<VisitorResponse>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      if (user?.id) {
        try {
          const response = await getBookingsByVisitorId(user.id);
          setBookings(response.data);
          sortAndFilterBookings(response.data, sortCriteria, '');
        } catch (error) {
          console.error('Error fetching bookings:', error);
        }
      }
    };

    fetchBookings();
  }, [user]);

  const sortAndFilterBookings = (bookingsToSort: BookingResponse[], sort: string, searchValue: string) => {
    let sorted = [...bookingsToSort];

    // Always sort by closest date first
    sorted = sorted.sort((a, b) => dayjs(a.dateStart).diff(dayjs(b.dateStart)));

    switch (sort) {
      case 'upcoming':
        sorted = sorted.filter((b) => dayjs(b.dateStart).isSame(dayjs(), 'day') || dayjs(b.dateStart).isAfter(dayjs()));
        break;
      case 'past':
        sorted = sorted.filter((b) => dayjs(b.dateStart).isBefore(dayjs()));
        break;
      case 'pending':
        sorted = sorted.filter((b) => b.bookingStatus === 'PENDING');
        break;
      case 'confirmed':
        sorted = sorted.filter((b) => b.bookingStatus === 'CONFIRMED');
        break;
      case 'all':
      default:
        // No additional filtering needed for 'all'
        break;
    }

    if (searchValue) {
      sorted = sorted.filter(
        (booking) =>
          booking.facility?.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          booking.bookingPurpose.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }

    setFilteredBookings(sorted);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    sortAndFilterBookings(bookings, sortCriteria, value);
  };

  const handleSort = (value: string) => {
    setSortCriteria(value);
    sortAndFilterBookings(bookings, value, '');
  };

  const handleCardClick = (bookingId: string) => {
    navigate(`/booking/${bookingId}`);
  };

  return (
    <>
      <div className="flex flex-col h-full m-4">
        <div className="sticky top-0 bg-white z-10 shadow-md">
          <div className="pb-4 pl-4 pr-4">
            <LogoText className="text-2xl font-semibold mb-3">My Facility Bookings</LogoText>
            <Space className="w-full">
              <Input placeholder="Search facilities" onChange={handleSearch} className="flex-grow" prefix={<SearchOutlined />} />
              <Select defaultValue="all" onChange={handleSort} style={{ width: 120 }}>
                <Option value="all">All</Option>
                <Option value="upcoming">Upcoming</Option>
                <Option value="past">Past</Option>
                <Option value="pending">Pending</Option>
                <Option value="confirmed">Confirmed</Option>
              </Select>
            </Space>
          </div>
        </div>
        <div className="flex-grow overflow-auto pl-4 pr-4 mt-4 mb-4">
          <div>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <DetailedBookingCard key={booking.id} booking={booking} onClick={() => handleCardClick(booking.id)} />
              ))
            ) : (
              <Empty description="No bookings found" />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewBookings;
