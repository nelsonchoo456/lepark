import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Spin, Divider } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { ContentWrapper, LogoText, useAuth } from '@lepark/common-ui';
import {
  EventTicketResponse,
  getEventTicketsByTransactionId,
  VisitorResponse,
  EventResponse,
  getEventById,
  EventTicketTransactionResponse,
  getEventTicketTransactionById,
} from '@lepark/data-access';
import dayjs from 'dayjs';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';

const { Text, Title } = Typography;

const EventTicketDetails: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [transaction, setTransaction] = useState<EventTicketTransactionResponse | null>(null);
  const [tickets, setTickets] = useState<EventTicketResponse[]>([]);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth<VisitorResponse>();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const navigate = useNavigate();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      if (transactionId) {
        try {
          const response = await getEventTicketsByTransactionId(transactionId);
          setTickets(response.data);
          if (response.data[0].eventTicketListing?.eventId) {
            const eventResponse = await getEventById(response.data[0].eventTicketListing?.eventId);
            setEvent(eventResponse.data);
          }
          const transactionResponse = await getEventTicketTransactionById(transactionId);
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

  useEffect(() => {
    generateQRCode();
  }, [tickets, currentTicketIndex]);

  const handlePrevTicket = () => {
    setCurrentTicketIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : tickets.length - 1));
  };

  const handleNextTicket = () => {
    setCurrentTicketIndex((prevIndex) => (prevIndex < tickets.length - 1 ? prevIndex + 1 : 0));
  };

  const generateQRCode = async () => {
    if (tickets[currentTicketIndex]) {
      try {
        const url = await QRCode.toDataURL(`http://localhost:4200/verify-event-ticket/${tickets[currentTicketIndex].id}`);
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR Code:', error);
      }
    }
  };

  const handleDownloadQRCode = () => {
    const ticketElement = document.getElementById('ticket-details');
    if (!ticketElement) {
      console.error('Ticket element not found');
      return;
    }

    html2canvas(ticketElement)
      .then((canvas) => {
        try {
          const image = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = image;

          // Create a sanitized file name
          const eventTitle = event?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'unknown_event';
          const eventDate = dayjs(transaction?.eventDate).format('YYYY-MM-DD');
          const fileName = `${eventTitle}_${eventDate}_ticket_${currentTicket.id}.png`;

          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error('Error processing ticket image:', error);
        }
      })
      .catch((error) => {
        console.error('Error generating canvas:', error);
      });
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
    <>
      <div className="flex items-center m-4">
        <Button
          icon={<LeftOutlined />}
          onClick={() => navigate(`/event-transaction/${transactionId}`)}
          className="mr-4 text-green-500"
          type="text"
        />
        <LogoText className="text-2xl font-semibold">Event Ticket Details</LogoText>
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
        <div className="p-4" id="ticket-details">
          <div className="mb-4">
            <Title level={3}>{event?.title}</Title>
          </div>
          <div className="mb-5">
            <Text strong>Visitor Account Name:</Text>
            <Text>
              {' '}
              {user?.firstName} {user?.lastName}
            </Text>
          </div>
          <div className="w-full h-px bg-gray-300 my-2"></div>
          <div className="mb-2 mt-5">
            <Text strong>Date:</Text>
            <Text> {dayjs(transaction?.eventDate).format('MMMM D, YYYY')}</Text>
          </div>
          <div className="mb-2">
            <Text strong>Quantity:</Text>
            <Text>
              {' '}
              1 x {currentTicket.eventTicketListing?.nationality} {currentTicket.eventTicketListing?.category}
            </Text>
          </div>
          <div className="mb-2">
            <Text strong>Price: $</Text>
            <Text> {currentTicket.price}</Text>
          </div>
          <div className="mb-2">
            <Text strong>Status:</Text>
            <Text> {currentTicket.status}</Text>
          </div>
          <div className="mb-2">
            <Text strong>Ticket ID:</Text>
            <Text> {currentTicket.id}</Text>
          </div>

          {qrCodeUrl && (
            <div className="mb-4 mt-2">
              <div className="mt-2 flex justify-center">
                <img src={qrCodeUrl} alt="Ticket QR Code" className="w-32 h-32" />
              </div>
            </div>
          )}
          <div className="mb-2 text-center">
            <Text>Present this ticket at the event entrance to gain entry.</Text>
            <br />
            <Text>Proof of identification (e.g. NRIC, Student ID) may be required for admission.</Text>
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <Button onClick={handleDownloadQRCode} className="min-w-fit">
            Download Ticket
          </Button>
        </div>
      </Card>
    </>
  );
};

export default EventTicketDetails;
