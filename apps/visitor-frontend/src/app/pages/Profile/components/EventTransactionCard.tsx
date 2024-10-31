import React from 'react';
import { Card, Typography, Image } from 'antd';
import { EventTicketTransactionResponse } from '@lepark/data-access';
import dayjs from 'dayjs';

const { Text } = Typography;

interface EventTransactionCardProps {
  transaction: EventTicketTransactionResponse;
}

const EventTransactionCard: React.FC<EventTransactionCardProps> = ({ transaction }) => {
  return (
    <Card
      hoverable
      style={{ width: 240, marginRight: 16 }}
      cover={
        <Image
          alt={transaction?.event?.title}
          src={transaction?.event?.images?.[0]}
          height={160}
          style={{ objectFit: 'cover' }}
          preview={false}
        />
      }
    >
      <Card.Meta
        title={transaction.event?.title}
        description={
          <>
            <Text>{dayjs(transaction.eventDate).format('MMM D, YYYY')}</Text>
            <br />
            <Text>Total paid: ${transaction.totalAmount.toFixed(2)}</Text>
          </>
        }
      />
    </Card>
  );
};

export default EventTransactionCard;
