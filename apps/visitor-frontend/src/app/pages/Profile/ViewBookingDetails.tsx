import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Typography, Image, Space, Tag, Spin, Button, message } from 'antd';
import {
  BookingResponse,
  getBookingById,
  getParkById,
  ParkResponse,
  //   sendBookingEmail,
  viewVisitorDetails,
} from '@lepark/data-access';
import { LogoText } from '@lepark/common-ui';
import dayjs from 'dayjs';
import { LinkOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const ViewBookingDetails: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooking = async () => {
      if (bookingId) {
        try {
          const response = await getBookingById(bookingId);
          setBooking(response.data);
        } catch (error) {
          console.error('Error fetching booking:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const handleBack = () => {
    navigate('/booking');
  };

  const handleViewFacilityDetails = () => {
    if (booking?.facilityId) {
      navigate(`/facility/${booking.facilityId}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'green';
      case 'PENDING':
        return 'gold';
      case 'CANCELLED':
        return 'red';
      case 'REJECTED':
        return 'red';
      default:
        return 'default';
    }
  };

  const handleRequestEmail = async () => {
    if (booking && !emailSent) {
      try {
        const visitor = await viewVisitorDetails(booking.visitorId);

        const emailData = {
          bookingId: booking.id,
          recipientEmail: visitor.data.email,
        };

        // await sendBookingEmail(emailData);
        message.success('Booking details have been sent to your email');
        setEmailSent(true);
      } catch (error) {
        console.error('Error requesting email:', error);
        message.error('Error sending email');
      }
    }
  };

  const handlePayment = () => {
    if (booking) {
      navigate('/booking-payment', {
        state: {
          bookingId: booking.id,
          facilityName: booking.facility?.name,
          facilityId: booking.facilityId,
          dateStart: booking.dateStart,
          dateEnd: booking.dateEnd,
          totalPayable: booking.facility?.fee || 0,
        },
      });
    }
  };

  if (!booking) {
    return <div>Booking not found</div>;
  }

  return (
    <>
      <div className="flex items-center m-4">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} className="mr-4 text-green-500" type="text" />
        <LogoText className="text-2xl font-semibold">Facility Booking Details</LogoText>
      </div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Image
            alt={booking?.facility?.name}
            src={booking?.facility?.images?.[0]}
            className="rounded-lg w-full max-h-[300px] object-cover"
            preview={false}
          />
          <div>
            <div className="flex items-center mb-1">
              <Title className="mb-0 mr-2" level={3}>
                {booking?.facility?.name}
              </Title>
              <Button type="link" icon={<LinkOutlined />} onClick={handleViewFacilityDetails} />
            </div>
          </div>
          <div className="bg-gray-200 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <Text strong>Booking Status</Text>
              <Tag color={getStatusColor(booking.bookingStatus)}>{booking.bookingStatus}</Tag>
            </div>
            {booking.bookingStatus === 'APPROVED_PENDING_PAYMENT' && (
              <Button type="primary" onClick={handlePayment} className="mt-2 w-full">
                Pay Now
              </Button>
            )}
            <div className="w-full h-px bg-gray-300 my-2"></div>
            <Text strong className="block mb-2">
              {dayjs(booking.dateStart).format('MMMM D, YYYY')} - {dayjs(booking.dateEnd).format('MMMM D, YYYY')}
            </Text>
            <Text className="block">Number of people: {booking.pax}</Text>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <Text strong className="block mb-2">
              Booking Purpose
            </Text>
            <Text className="block">{booking.bookingPurpose}</Text>
            {booking.visitorRemarks && (
              <>
                <Text strong className="block mt-4 mb-2">
                  Additional Remarks
                </Text>
                <Text className="block">{booking.visitorRemarks}</Text>
              </>
            )}
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <Text className="block mb-2">Booking date: {dayjs(booking.dateBooked).format('MMMM D, YYYY')}</Text>
            <Text type="secondary" className="block mb-2">
              Booking ID: {booking.id}
            </Text>
            {!emailSent ? <Button onClick={handleRequestEmail}>Request Email Copy</Button> : <Button disabled>Email Sent</Button>}
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <Text className="block mb-2">Cancellation policy</Text>
            <Text className="block">
              Cancellations must be made at least 24 hours before the booking date. Contact admin for assistance.
            </Text>
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

export default ViewBookingDetails;
