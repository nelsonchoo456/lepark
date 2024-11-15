import React from 'react';
import { Card, Typography, Image } from 'antd';
import { BookingResponse, BookingStatusEnum } from '@lepark/data-access';
import dayjs from 'dayjs';

const { Text } = Typography;

// Add helper function to format booking status
const formatBookingStatus = (status: BookingStatusEnum): string => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'CANCELLED':
      return 'Cancelled';
    case 'REJECTED':
      return 'Rejected';
    case 'APPROVED_PENDING_PAYMENT':
      return 'Approved (Pending Payment)';
    case 'CONFIRMED':
      return 'Confirmed';
    default:
      return status;
  }
};

interface BookingCardProps {
  booking: BookingResponse;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  return (
    <Card
      hoverable
      style={{ width: 240, marginRight: 16 }}
      cover={
        <Image
          alt={booking?.facility?.name}
          src={booking?.facility?.images?.[0]}
          height={160}
          style={{ objectFit: 'cover' }}
          preview={false}
        />
      }
    >
      <Card.Meta
        title={booking.facility?.name}
        description={
          <>
            <Text>{dayjs(booking.dateStart).format('MMM D, YYYY')}</Text>
            <br />
            <Text>Purpose: {booking.bookingPurpose}</Text>
            <br />
            <Text>Status: {formatBookingStatus(booking.bookingStatus)}</Text>
          </>
        }
      />
    </Card>
  );
};

export default BookingCard;
