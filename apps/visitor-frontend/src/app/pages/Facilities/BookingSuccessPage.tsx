import React from 'react';
import { Typography, Button, Card } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { LogoText } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const BookingSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToBookings = () => {
    navigate('/profile');
  };

  return (
    <div className="p-4 h-full overflow-auto flex flex-col items-center">
      <LogoText className="text-2xl font-semibold mb-4">Payment Successful</LogoText>
      <Card className="w-full max-w-md text-center">
        <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
        <Title level={3}>Your booking payment was successful!</Title>
        <Text className="block mb-6">
          Thank you for your payment. Your booking has been confirmed, and a confirmation email has been sent to you.
        </Text>
        <Button type="primary" size="large" onClick={handleGoToBookings} className="w-full">
          View My Bookings
        </Button>
      </Card>
    </div>
  );
};

export default BookingSuccessPage;
