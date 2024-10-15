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
import { useRestrictVerifyAttractionTicket } from '../../hooks/Attractions/useRestrictVerifyAttractionTicket';

const { Text, Title } = Typography;

const VerifyTicket: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { ticket, attraction, loading, error: accessError } = useRestrictVerifyAttractionTicket(ticketId);
  const [status, setStatus] = useState<'verifying' | 'valid' | 'invalid' | 'not-found'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (loading) {
      console.log('loading', loading);
      return;
    }

    if (!ticket) {
      setStatus('not-found');
      setErrorMessage('Ticket not found');
      return;
    }

    if (accessError) {
      setStatus('invalid');
      setErrorMessage(accessError);
      return;
    }

    if (verificationAttempted.current) return;

    verificationAttempted.current = true;

    const verifyTicket = async () => {
      try {
        const verificationResponse = await verifyAttractionTicket(ticket.id);
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
      }
    };

    verifyTicket();
  }, [ticketId, accessError, loading, ticket, attraction]);

  if (loading) {
    console.log('loading', loading);
    return (
      <Card className="h-screen flex items-center justify-center">
        <Spin size="large" />
      </Card>
    );
  }

  if (status === 'verifying') {
    console.log('status', status);
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
        {attraction?.title}
      </Text>
      <Text>
        <Text strong>Date: </Text>
        {dayjs(ticket?.attractionTicketTransaction?.attractionDate || '').format('DD MMMM YYYY')}
      </Text>
      <Text>
        <Text strong>Ticket Type: </Text>
        {ticket?.attractionTicketListing?.nationality} {ticket?.attractionTicketListing?.category}
      </Text>
      <Text>
        <Text strong>Ticket ID: </Text>
        {ticket?.id}
      </Text>
    </Space>
  );

  return (
    <div className="p-4 h-screen flex flex-col items-center justify-center">
      <Title level={2} className="text-center">
        {status === 'not-found' ? 'Verifying Attraction Ticket' :
        <>
        Verifying Attraction Ticket for
        <br />
        {attraction?.title || 'Unknown Attraction'}
        </>
      }
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
          <>
            {status === 'not-found' ? (
              <Result
                status="error"
                icon={<CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 72 }} />}
                title="Invalid Ticket"
                subTitle="This ticket is not valid or does not exist."
              />
            ) : (
              <Result
                status="error"
                icon={<CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 72 }} />}
                title="Invalid Ticket"
                subTitle={errorMessage || 'This ticket is not valid or has already been used.'}
                extra={ticket && renderTicketDetails()}
                className="py-4"
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default VerifyTicket;
