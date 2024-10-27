import React from 'react';
import { Typography, Button, Card } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { LogoText } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const EventSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="p-4 h-full overflow-auto flex flex-col items-center">
      <LogoText className="text-2xl font-semibold mb-4">Event Booking Successful</LogoText>
      <Card className="w-full max-w-md text-center">
        <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
        <Title level={3}>Your event booking was successful!</Title>
        <Text className="block mb-6">
          Thank you for your purchase. Your event ticket(s) have been confirmed, and a receipt for your purchase has been emailed to you.
        </Text>
        <Button type="primary" size="large" onClick={handleGoHome} className="w-full">
          Return to Home
        </Button>
      </Card>
    </div>
  );
};

export default EventSuccessPage;
