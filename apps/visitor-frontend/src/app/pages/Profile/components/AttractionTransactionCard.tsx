import React from 'react';
import { Card, Typography, Image } from 'antd';
import { AttractionTicketTransactionResponse } from '@lepark/data-access';
import dayjs from 'dayjs';

const { Text } = Typography;

interface AttractionTransactionCardProps {
  transaction: AttractionTicketTransactionResponse;
}

const AttractionTransactionCard: React.FC<AttractionTransactionCardProps> = ({ transaction }) => {
  return (
    <Card
      hoverable
      style={{ width: 240, marginRight: 16 }}
      cover={
        <Image
          alt={transaction?.attraction?.title}
          src={transaction?.attraction?.images?.[0]}
          height={160}
          style={{ objectFit: 'cover' }}
          preview={false}
        />
      }
    >
      <Card.Meta
        title={transaction.attraction?.title}
        description={
          <>
            <Text>{dayjs(transaction.attractionDate).format('MMM D, YYYY')}</Text>
            <br />
            <Text>Total paid: ${transaction.totalAmount.toFixed(2)}</Text>
            <br />
          </>
        }
      />
    </Card>
  );
};

export default AttractionTransactionCard;