import React from 'react';
import { Typography, Button, Card } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { LogoText } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const BookingFailedPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="p-4 h-full overflow-auto flex flex-col items-center">
      <LogoText className="text-2xl font-semibold mb-4">Payment Failed</LogoText>
      <Card className="w-full max-w-md text-center">
        <CloseCircleOutlined className="text-6xl text-red-500 mb-4" />
        <Title level={3}>Your booking payment was unsuccessful</Title>
        <Text className="block mb-6">
          We're sorry, but there was an issue processing your payment. Please try again from your bookings page or contact our support team
          if the problem persists.
        </Text>
        <Button size="large" onClick={handleGoHome} className="w-full">
          Return to Home
        </Button>
      </Card>
    </div>
  );
};

export default BookingFailedPage;
