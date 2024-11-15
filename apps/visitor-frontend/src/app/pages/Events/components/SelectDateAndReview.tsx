import React, { useState } from 'react';
import { Calendar, Card, Typography, Button, Row, Col } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import classNames from 'classnames';

const { Title, Text } = Typography;

interface TicketDetail {
  description: string;
  quantity: number;
  price: number;
}

interface SelectDateAndReviewProps {
  eventName: string;
  ticketDetails: TicketDetail[];
  onBack: (currentTickets: TicketDetail[]) => void;
  onNext: (selectedDate: Dayjs) => void;
  eventStartDate: Dayjs;
  eventEndDate: Dayjs;
  maxCapacity: number;
  soldTicketsByDate: Record<string, number>;
}

const SelectDateAndReview: React.FC<SelectDateAndReviewProps> = ({
  eventName,
  ticketDetails,
  onBack,
  onNext,
  eventStartDate,
  eventEndDate,
  maxCapacity,
  soldTicketsByDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(eventStartDate);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const totalPayable = ticketDetails.reduce((sum, detail) => sum + detail.price * detail.quantity, 0);
  const totalTicketsSelected = ticketDetails.reduce((sum, detail) => sum + detail.quantity, 0);

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
    console.log(soldTicketsByDate);
  };

  const handleNext = () => {
    if (selectedDate) {
      onNext(selectedDate);
    }
  };

  const disabledDate = (current: Dayjs) => {
    const today = dayjs().startOf('day');
    const dateKey = current.format('YYYY-MM-DD');
    const soldTickets = soldTicketsByDate[dateKey] || 0;

    return (
      current.isBefore(today, 'day') || // Disable past dates
      current.isBefore(eventStartDate, 'day') ||
      current.isAfter(eventEndDate, 'day') ||
      soldTickets + totalTicketsSelected > maxCapacity // Disable dates where capacity would be exceeded
    );
  };

  const handleMonthChange = (date: Dayjs) => {
    setCurrentMonth(date);
  };

  const handleBack = () => {
    onBack(ticketDetails);
  };

  const fullCellRender = (date: Dayjs) => {
    const dateKey = date.format('YYYY-MM-DD');
    const soldTickets = soldTicketsByDate[dateKey] || 0;
    const isSellingFast = soldTickets >= maxCapacity * 0.5;

    return (
      <div
        className={classNames('ant-picker-cell-inner', {
          'bg-yellow-200 border-2 border-yellow-200': isSellingFast && !disabledDate(date),
        })}
      >
        {date.date()}
      </div>
    );
  };

  return (
    <div className="p-4 h-full overflow-auto">
      <Calendar
        fullscreen={false}
        onSelect={handleDateSelect}
        disabledDate={disabledDate}
        validRange={[eventStartDate, eventEndDate]}
        value={currentMonth}
        onChange={handleMonthChange}
        fullCellRender={fullCellRender}
        headerRender={({ value, type, onChange, onTypeChange }) => {
          const current = value;
          const nextMonth = current.add(1, 'month').startOf('month');
          const showNextMonthButton = eventEndDate.isAfter(current.endOf('month'));
          const showPrevMonthButton = !current.isSame(eventStartDate, 'month');

          return (
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl font-bold">{current.format('MMM YYYY')}</div>
              <div>
                {showPrevMonthButton && (
                  <Button type="link" onClick={() => onChange(current.subtract(1, 'month'))} className="text-green-500 mr-2">
                    ← {current.subtract(1, 'month').format('MMM')}
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

      {/* Legend */}
      <div className="mt-4 flex gap-4">
        <div className="flex items-center">
          <div className="w-5 h-5 bg-[#6da696] mr-2"></div>
          <span className="text-sm text-gray-600">Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-5 h-5 bg-yellow-300 border-2 border-yellow-300 mr-2"></div>
          <span className="text-sm text-gray-600">Selling Fast</span>
        </div>
        <div className="flex items-center">
          <div className="w-5 h-5 bg-gray-100 mr-2"></div>
          <span className="text-sm text-gray-600">Unavailable</span>
        </div>
      </div>

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
