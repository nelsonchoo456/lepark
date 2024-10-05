import React, { useState } from 'react';
import { Calendar, Card, Typography, Button, Row, Col } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { LogoText } from '@lepark/common-ui';

const { Title, Text } = Typography;

interface TicketDetail {
  description: string;
  quantity: number;
  price: number;
}

interface SelectDateAndReviewProps {
  attractionName: string;
  ticketDetails: TicketDetail[];
  onBack: () => void;
  onNext: (selectedDate: Dayjs) => void;
}

const SelectDateAndReview: React.FC<SelectDateAndReviewProps> = ({ attractionName, ticketDetails, onBack, onNext }) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const today = dayjs();
  const thirtyDaysLater = today.add(30, 'day');

  const totalPayable = ticketDetails.reduce((sum, detail) => sum + detail.price * detail.quantity, 0);

  const handleDateSelect = (date: Dayjs) => {
    if (date.isAfter(today.subtract(1, 'day')) && date.isBefore(thirtyDaysLater.add(1, 'day'))) {
      setSelectedDate(date);
    }
  };

  const handleNext = () => {
    if (selectedDate) {
      onNext(selectedDate);
    }
  };

  const disabledDate = (current: Dayjs) => {
    return current.isBefore(today, 'day') || current.isAfter(thirtyDaysLater, 'day');
  };

  const dateCellRender = (date: Dayjs) => {
    if (date.isSame(selectedDate, 'day')) {
      return <div className="h-full w-full bg-blue-500 rounded-full"></div>;
    }
    // Here you can implement logic to show different colors for available/selling fast dates
    return <div className="h-full w-full bg-green-400 rounded-full"></div>;
  };

  return (
    <div className="p-4 h-full overflow-auto">
      {/* <LogoText className="text-2xl font-semibold mb-4">Select Date</LogoText> */}
      <Calendar
        fullscreen={false}
        onSelect={handleDateSelect}
        disabledDate={disabledDate}
        cellRender={dateCellRender}
        validRange={[today, thirtyDaysLater]}
        headerRender={({ value, onChange }) => {
          const current = value.clone();
          const nextMonth = current.add(1, 'month');

          return (
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl font-bold">{current.format('MMM YYYY')}</div>
              {current.month() !== nextMonth.month() && (
                <Button type="link" onClick={() => onChange(nextMonth)} className="text-pink-500">
                  {nextMonth.format('MMM')} →
                </Button>
              )}
            </div>
          );
        }}
      />
      <div className="mt-4">
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-400 rounded-full mr-2"></div>
              <Text>Available</Text>
            </div>
          </Col>
          <Col span={12}>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
              <Text>Selling fast</Text>
            </div>
          </Col>
        </Row>
      </div>
      <Card className="mt-4">
        <Title level={4}>Total Payable: S${totalPayable.toFixed(2)}</Title>
        <Text>Subtotal: S${totalPayable.toFixed(2)}</Text>
        <Title level={5} className="mt-4">
          Admissions
        </Title>
        <Text>{attractionName}</Text>
        {selectedDate && <Text className="block">{selectedDate.format('DD/MM/YYYY')}</Text>}
        {ticketDetails.map((detail, index) => (
          <Text key={index} className="block">
            {detail.quantity} x {detail.description} - S${(detail.price * detail.quantity).toFixed(2)}
          </Text>
        ))}
      </Card>
      <Row gutter={16} className="mt-4">
        <Col span={12}>
          <Button onClick={onBack} className="w-full">
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
