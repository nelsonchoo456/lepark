import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Result, Space, Spin, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import {
  AttractionTicketResponse,
  verifyAttractionTicket,
  getAttractionTicketById,
  AttractionResponse,
  getAttractionById,
} from '@lepark/data-access';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const VerifyTicket: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [status, setStatus] = useState<'verifying' | 'valid' | 'invalid'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ticketDetails, setTicketDetails] = useState<AttractionTicketResponse | null>(null);
  const [attractionDetails, setAttractionDetails] = useState<AttractionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (!ticketId || verificationAttempted.current) {
      return;
    }

    verificationAttempted.current = true;
    setIsLoading(true);

    const fetchTicketDetails = async () => {
      try {
        const ticketResponse = await getAttractionTicketById(ticketId);
        setTicketDetails(ticketResponse.data);

        if (ticketResponse.data.attractionTicketListing?.attractionId) {
          const attractionResponse = await getAttractionById(ticketResponse.data.attractionTicketListing.attractionId);
          setAttractionDetails(attractionResponse.data);
        }

        const verificationResponse = await verifyAttractionTicket(ticketId);
        if (verificationResponse.data.isValid) {
          setStatus('valid');
        } else {
          setStatus('invalid');
          setErrorMessage('This ticket is not valid.');
        }
      } catch (error: any) {
        console.error('Error verifying ticket:', error);
        const errorMessage = error.message || error.toString();
        setStatus('invalid');
        setErrorMessage(error.response?.data?.message || errorMessage || 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketDetails();
  }, [ticketId]);

  if (isLoading) {
    return (
      <Card className="h-screen flex items-center justify-center">
        <Spin size="large" />
      </Card>
    );
  }

  if (status === 'verifying') {
    return (
      <Card className="h-screen flex items-center justify-center">
        <Spin size="large" />
      </Card>
    );
  }

  const renderTicketDetails = () => (
    <Space direction="vertical" size="small" className="w-full">
      <Text>
        <Text strong>Attraction: </Text>
        {attractionDetails?.title}
      </Text>
      <Text>
        <Text strong>Date: </Text>
        {dayjs(ticketDetails?.attractionTicketTransaction?.attractionDate || '').format('DD MMMM YYYY')}
      </Text>
      <Text>
        <Text strong>Ticket Type: </Text>
        {ticketDetails?.attractionTicketListing?.nationality} {ticketDetails?.attractionTicketListing?.category}
      </Text>
      <Text>
        <Text strong>Ticket ID: </Text>
        {ticketDetails?.id}
      </Text>
    </Space>
  );

  return (
    <div className="p-4 h-screen flex flex-col items-center justify-center">
      <Title level={2} className="text-center">
        Verifying Attraction Ticket for
        <br />
        {attractionDetails?.title || 'Unknown Attraction'}
      </Title>
      <Card className="w-full max-w-md">
        {status === 'valid' ? (
          <>
            <div className="flex justify-center mt-2">
              <Text type="secondary" strong>
                Verify visitor's citizenship and age as per the ticket type.
              </Text>
            </div>
            <Result
              status="success"
              icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: 72 }} />}
              title="Valid Ticket"
              subTitle="This ticket is valid and can be used for entry."
              extra={renderTicketDetails()}
              className="py-4"
            />
          </>
        ) : (
          <Result
            status="error"
            icon={<CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 72 }} />}
            title="Invalid Ticket"
            subTitle={errorMessage || 'This ticket is not valid or has already been used.'}
            extra={ticketDetails && renderTicketDetails()}
            className="py-4"
          />
        )}
      </Card>
    </div>
  );
};

export default VerifyTicket;
