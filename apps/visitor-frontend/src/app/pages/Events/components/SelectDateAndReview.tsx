import React, { useState } from 'react';
import { Calendar, Card, Typography, Button, Row, Col } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface TicketDetail {
  description: string;
  quantity: number;
  price: number;
}

interface SelectDateAndReviewProps {
  eventName: string;
  ticketDetails: TicketDetail[];
  eventStartDate: Dayjs;
  eventEndDate: Dayjs;
  onBack: (currentTickets: TicketDetail[]) => void;
  onNext: (selectedDate: Dayjs) => void;
}

const SelectDateAndReview: React.FC<SelectDateAndReviewProps> = ({
  eventName,
  ticketDetails,
  eventStartDate,
  eventEndDate,
  onBack,
  onNext,
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(eventStartDate);

  const totalPayable = ticketDetails.reduce((sum, detail) => sum + detail.price * detail.quantity, 0);

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
  };

  const handleNext = () => {
    if (selectedDate) {
      onNext(selectedDate);
    }
  };

  const disabledDate = (current: Dayjs) => {
    return current.isBefore(eventStartDate, 'day') || current.isAfter(eventEndDate, 'day');
  };

  const handleBack = () => {
    onBack(ticketDetails);
  };

  return (
    <div className="p-4 h-full overflow-auto">
      <Calendar
        fullscreen={false}
        onSelect={handleDateSelect}
        disabledDate={disabledDate}
        validRange={[eventStartDate, eventEndDate]}
        value={selectedDate || eventStartDate}
      />
      <Card className="mt-4">
        <Title level={4}>Total Payable: S${totalPayable.toFixed(2)}</Title>
        <Text>Subtotal: S${totalPayable.toFixed(2)}</Text>
        <Title level={5} className="mt-4">
          Event Details
        </Title>
        <Text>{eventName}</Text>
        {selectedDate && <Text className="block">{selectedDate.format('DD/MM/YYYY')}</Text>}
        {ticketDetails.map((detail, index) => (
          <Text key={index} className="block">
            {detail.quantity} x {detail.description} - S${(detail.price * detail.quantity).toFixed(2)}
          </Text>
        ))}
      </Card>
      <Row gutter={16} className="mt-4">
        <Col span={12}>
          <Button onClick={handleBack} className="w-full">
            Back
          </Button>
        </Col>
        <Col span={12}>
          <Button type="primary" onClick={handleNext} disabled={!selectedDate} className="w-full">
            Next
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default SelectDateAndReview;
