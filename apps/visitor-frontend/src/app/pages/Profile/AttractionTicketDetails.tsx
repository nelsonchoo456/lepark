import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Spin, Divider } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { ContentWrapper, LogoText, useAuth } from '@lepark/common-ui';
import { AttractionTicketResponse, getAttractionTicketsByTransactionId, VisitorResponse, AttractionResponse, getAttractionById, AttractionTicketTransactionResponse, getAttractionTicketTransactionById } from '@lepark/data-access';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const AttractionTicketDetails: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [transaction, setTransaction] = useState<AttractionTicketTransactionResponse | null>(null);
  const [tickets, setTickets] = useState<AttractionTicketResponse[]>([]);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user, updateUser, logout } = useAuth<VisitorResponse>();
  const [attraction, setAttraction] = useState<AttractionResponse | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      if (transactionId) {
        try {
          const response = await getAttractionTicketsByTransactionId(transactionId);
          setTickets(response.data);
          if (response.data[0].attractionTicketListing?.attractionId) {
            const attractionResponse = await getAttractionById(response.data[0].attractionTicketListing?.attractionId);
            setAttraction(attractionResponse.data);
          }
          const transactionResponse = await getAttractionTicketTransactionById(transactionId);
          setTransaction(transactionResponse.data);
        } catch (error) {
          console.error('Error fetching tickets:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTickets();
  }, [transactionId]);

  const handlePrevTicket = () => {
    setCurrentTicketIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : tickets.length - 1));
  };

  const handleNextTicket = () => {
    setCurrentTicketIndex((prevIndex) => (prevIndex < tickets.length - 1 ? prevIndex + 1 : 0));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const currentTicket = tickets[currentTicketIndex];

  return (
    <ContentWrapper>
      <div className="flex items-center mb-4">
        <Button
          icon={<LeftOutlined />}
          onClick={() => navigate(`/attraction-transaction/${transactionId}`)}
          className="mr-4 text-green-500"
          type="text"
        />
        <LogoText className="text-2xl font-semibold">Ticket Details</LogoText>
      </div>
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Button icon={<LeftOutlined />} onClick={handlePrevTicket} disabled={tickets.length <= 1} />
          <Title level={4}>
            Ticket {currentTicketIndex + 1} of {tickets.length}
          </Title>
          <Button icon={<RightOutlined />} onClick={handleNextTicket} disabled={tickets.length <= 1} />
        </div>
        <Divider />
        <div className="mb-4">
          <Title level={3}>{attraction?.title}</Title>
        </div>
        <div className="mb-5">
          <Text strong>Visitor Account Name:</Text>
          <Text> {user?.firstName} {user?.lastName}</Text>
        </div>
        <div className="w-full h-px bg-gray-300 my-2"></div>
        <div className="mb-2 mt-5">
          <Text strong>Date:</Text>
          <Text> {dayjs(transaction?.attractionDate).format('MMMM D, YYYY')}</Text>
        </div>
        <div className="mb-2">
          <Text strong>Quantity:</Text>
          <Text> 1 x {currentTicket.attractionTicketListing?.nationality} {currentTicket.attractionTicketListing?.category}</Text>
        </div>
        <div className="mb-2">
          <Text strong>Status:</Text>
          <Text> {currentTicket.status}</Text>
        </div>
        <div className="mb-2">
          <Text strong>Ticket ID:</Text>
          <Text> {currentTicket.id}</Text>
        </div>
        
        {/* TODO: Add QR code display */}
        
      </Card>
    </ContentWrapper>
  );
};

export default AttractionTicketDetails;