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
  attractionName: string;
  ticketDetails: TicketDetail[];
  onBack: (currentTickets: TicketDetail[]) => void;
  onNext: (selectedDate: Dayjs) => void;
}

const SelectDateAndReview: React.FC<SelectDateAndReviewProps> = ({ attractionName, ticketDetails, onBack, onNext }) => {
  const today = dayjs().startOf('day');
  const thirtyDaysLater = today.add(29, 'day'); // 29 days later to include today
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(today);

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
    return current.isBefore(today, 'day') || current.isAfter(thirtyDaysLater, 'day');
  };

  const handleMonthChange = (date: Dayjs) => {
    if (date.isSame(today, 'month') || date.isSame(thirtyDaysLater, 'month')) {
      setCurrentMonth(date);
    }
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
        validRange={[today, thirtyDaysLater]}
        value={currentMonth}
        onChange={handleMonthChange}
        headerRender={({ value, onChange }) => {
          const current = value.clone();
          const nextMonth = current.add(1, 'month').startOf('month');
          const showNextMonthButton = thirtyDaysLater.isAfter(current.endOf('month'));
          const showPrevMonthButton = !current.isSame(today, 'month');

          return (
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl font-bold">{current.format('MMM YYYY')}</div>
              <div>
                {showPrevMonthButton && (
                  <Button type="link" onClick={() => onChange(today)} className="text-green-500 mr-2">
                    ← {today.format('MMM')}
                  </Button>
                )}
                {showNextMonthButton && (
                  <Button type="link" onClick={() => onChange(nextMonth)} className="text-green-500">
                    {nextMonth.format('MMM')} →
                  </Button>
                )}
              </div>
            </div>
          );
        }}
      />
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
