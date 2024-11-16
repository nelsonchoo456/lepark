import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Typography, Image, Space, Spin, Button, message } from 'antd';
import {
  EventTicketResponse,
  EventTicketTransactionResponse,
  getEventTicketsByTransactionId,
  getEventTicketTransactionById,
  sendRequestedEventTicketEmail,
  viewVisitorDetails,
} from '@lepark/data-access';
import { LogoText } from '@lepark/common-ui';
import dayjs from 'dayjs';
import { LinkOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { TagOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const EventTransactionDetails: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [transaction, setTransaction] = useState<EventTicketTransactionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<EventTicketResponse[]>([]);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const groupTickets = (tickets: EventTicketResponse[]) => {
    return tickets.reduce((acc, ticket) => {
      const key = `${ticket.eventTicketListing?.nationality} - ${ticket.eventTicketListing?.category}`;
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
          const response = await getEventTicketTransactionById(transactionId);
          setTransaction(response.data);
          const ticketResponse = await getEventTicketsByTransactionId(transactionId);
          setTickets(ticketResponse.data);
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
    navigate('/profile');
  };

  const handleViewEventDetails = () => {
    if (transaction?.eventId) {
      navigate(`/events/${transaction.eventId}`);
    }
  };

  const handleRequestPDFEmail = async () => {
    if (transaction && !emailSent) {
      try {
        const visitor = await viewVisitorDetails(transaction.visitorId);

        const emailTicketsData = {
          transactionId: transaction.id,
          recipientEmail: visitor.data.email,
        };

        await sendRequestedEventTicketEmail(emailTicketsData);
        message.success('PDF of tickets have been sent to your email');
        setEmailSent(true);
      } catch (error) {
        console.error('Error requesting PDF email:', error);
        message.error('Error sending PDF to email');
      }
    }
  };

  if (!transaction) {
    return <div>Transaction not found</div>;
  }

  return (
    <>
      <div className="flex items-center m-4">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} className="mr-4 text-green-500" type="text" />
        <LogoText className="text-2xl font-semibold">Event Booking Details</LogoText>
      </div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Image
            alt={transaction?.event?.title}
            src={transaction?.event?.images?.[0]}
            className="rounded-lg w-full max-h-[300px] object-cover"
            preview={false}
          />
          <div>
            <div className="flex items-center mb-1">
              <Title className="mb-0 mr-2" level={3}>
                {transaction?.event?.title}
              </Title>
              <Button type="link" icon={<LinkOutlined />} onClick={handleViewEventDetails} />
            </div>
            <Text>{transaction?.event?.description}</Text>
          </div>
          <div className="bg-gray-200 p-4 rounded-lg">
            <Text strong className="block mb-2">
              {dayjs(transaction?.eventDate).format('MMMM D, YYYY')}
            </Text>
            <div className="w-full h-px bg-gray-300 my-2"></div>
            <div className="flex items-center mb-2">
              <Text>Number of tickets: {tickets.length}</Text>
              <Button
                type="link"
                icon={<TagOutlined />}
                onClick={() => navigate(`/event-transaction/${transactionId}/tickets`)}
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
            <Text type="secondary" className="block mb-2">
              Transaction ID: {transaction?.id}
            </Text>
            {!emailSent ? <Button onClick={handleRequestPDFEmail}>Request PDF</Button> : <Button disabled>PDF sent</Button>}
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <Text className="block mb-2">Cancellation policy</Text>
            <Text className="block">No refunds will be issued for cancellations. Tickets are non-transferable.</Text>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <Text className="block mb-2">Need help?</Text>
            <Text className="block">Contact customer support at admin@lepark.com</Text>
          </div>
        </Space>
      </Card>
    </>
  );
};

export default EventTransactionDetails;
