import React from 'react';
import { Card, Typography, Image } from 'antd';
import { BookingResponse } from '@lepark/data-access';
import dayjs from 'dayjs';

const { Text } = Typography;

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
            <Text>Status: {booking.bookingStatus}</Text>
          </>
        }
      />
    </Card>
  );
};

export default BookingCard;
