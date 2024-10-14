import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Typography, Image, Space, Tag, Spin, Button } from 'antd';
import {
  AttractionTicketCategoryEnum,
  AttractionTicketNationalityEnum,
  AttractionTicketResponse,
  AttractionTicketTransactionResponse,
  getAttractionTicketsByTransactionId,
  getAttractionTicketTransactionById,
  getParkById,
  ParkResponse,
} from '@lepark/data-access';
import { ContentWrapper, LogoText } from '@lepark/common-ui';
import dayjs from 'dayjs';
import { LinkOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { TagOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const AttractionTransactionDetails: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [transaction, setTransaction] = useState<AttractionTicketTransactionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<AttractionTicketResponse[]>([]);
  const [park, setPark] = useState<ParkResponse | null>(null);
  const navigate = useNavigate();

  const groupTickets = (tickets: AttractionTicketResponse[]) => {
    return tickets.reduce((acc, ticket) => {
      const key = `${ticket.attractionTicketListing?.nationality} - ${ticket.attractionTicketListing?.category}`;
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key]++;
      return acc;
    }, {} as Record<string, number>);
  };

  const groupedTickets = groupTickets(tickets);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (transactionId) {
        try {
          const response = await getAttractionTicketTransactionById(transactionId);
          setTransaction(response.data);
          const ticketResponse = await getAttractionTicketsByTransactionId(transactionId);
          setTickets(ticketResponse.data);
          const parkResponse = await getParkById(Number(response.data.attraction?.parkId));
          setPark(parkResponse.data);
        } catch (error) {
          console.error('Error fetching transaction:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTransaction();
  }, [transactionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const handleBack = () => {
    navigate('/attraction-transaction');
  };

  const handleViewAttractionDetails = () => {
    if (transaction?.attractionId) {
      navigate(`/attractions/${transaction.attractionId}`);
    }
  };

  if (!transaction) {
    return <div>Transaction not found</div>;
  }

  return (
    <>
      <div className="flex items-center m-4">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} className="mr-4 text-green-500" type="text" />
        <LogoText className="text-2xl font-semibold">Attraction Booking Details</LogoText>
      </div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Image
            alt={transaction?.attraction?.title}
            src={transaction?.attraction?.images?.[0]}
            className="rounded-lg w-full max-h-[300px] object-cover"
            preview={false}
          />
          <div>
            <div className="flex items-center mb-1">
              <Title className="mb-0 mr-2" level={3}>
                {transaction?.attraction?.title}
              </Title>
              <Button type="link" icon={<LinkOutlined />} onClick={handleViewAttractionDetails} />
            </div>
            <Text>@ {park?.name}</Text>
          </div>
          <div className="bg-gray-200 p-4 rounded-lg">
            <Text strong className="block mb-2">
              {dayjs(transaction?.attractionDate).format('MMMM D, YYYY')}
            </Text>
            <div className="w-full h-px bg-gray-300 my-2"></div>
            <div className="flex items-center mb-2">
              <Text>Number of tickets: {tickets.length}</Text>
              <Button
                type="link"
                icon={<TagOutlined />}
                onClick={() => navigate(`/attraction-transaction/${transactionId}/tickets`)}
                className="p-0 ml-2"
              />
            </div>
            <Space direction="vertical" size="small">
              {Object.entries(groupedTickets).map(([key, count], index) => (
                <Text key={index}>
                  {count} x {key}
                </Text>
              ))}
            </Space>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <Text className="block mb-2">Total paid: ${transaction?.totalAmount.toFixed(2)}</Text>
            <Text className="block mb-2">Purchase date: {dayjs(transaction?.purchaseDate).format('MMMM D, YYYY')}</Text>
            <Text type="secondary" className="block">
              Transaction ID: {transaction?.id}
            </Text>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <Text className="block mb-2">Cancellation policy</Text>
            <Text className="block">No refunds will be issued for cancellations. Tickets are non-transferable.</Text>
          </div>
          {/* <div className="bg-gray-100 p-4 rounded-lg">
      <Text className="block mb-2">Getting there</Text>
    </div> */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <Text className="block mb-2">Need help?</Text>
            <Text className="block">Contact customer support at admin@lepark.com</Text>
          </div>
        </Space>
      </Card>
    </>
  );
};

export default AttractionTransactionDetails;
