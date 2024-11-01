import React from 'react';
import { Typography, Button, Card } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { LogoText } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { usePark } from '../../park-context/ParkContext';

const { Title, Text } = Typography;

const EventFailedPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPark } = usePark();

  const handleTryAgain = () => {
    navigate(`/event/park/${selectedPark?.id}`); // Assuming this is the correct route to try the purchase again
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="p-4 h-full overflow-auto flex flex-col items-center">
      <LogoText className="text-2xl font-semibold mb-4">Event Booking Failed</LogoText>
      <Card className="w-full max-w-md text-center">
        <CloseCircleOutlined className="text-6xl text-red-500 mb-4" />
        <Title level={3}>Your event booking was unsuccessful</Title>
        <Text className="block mb-6">
          We're sorry, but there was an issue processing your event booking. Please try again or contact our support team if the problem
          persists.
        </Text>
        <Button type="primary" size="large" onClick={handleTryAgain} className="w-full mb-4">
          Try Again
        </Button>
        <Button size="large" onClick={handleGoHome} className="w-full">
          Return to Home
        </Button>
      </Card>
    </div>
  );
};

export default EventFailedPage;
