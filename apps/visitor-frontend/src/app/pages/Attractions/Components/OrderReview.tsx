import React, { useState } from 'react';
import { Card, Typography, Button, Row, Col, Input, message } from 'antd';
import { LogoText } from '@lepark/common-ui';
import { Dayjs } from 'dayjs';

const { Title, Text } = Typography;

interface TicketDetail {
  description: string;
  quantity: number;
  price: number;
}

interface OrderReviewProps {
  attractionName: string;
  selectedDate: Dayjs;
  ticketDetails: TicketDetail[];
  discount: number;
  onApplyPromotion: (code: string) => Promise<void>;
  onBack: () => void;
  onNext: () => void;
}

const OrderReview: React.FC<OrderReviewProps> = ({
  attractionName,
  selectedDate,
  ticketDetails,
  discount,
  onApplyPromotion,
  onBack,
  onNext,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  const subtotal = ticketDetails.reduce((sum, detail) => sum + detail.price * detail.quantity, 0);
  const totalPayable = subtotal - discount;

  const handleApplyPromotion = async () => {
    if (!promoCode.trim()) {
      message.error('Please enter a promotion code');
      return;
    }
    setApplyingPromo(true);
    try {
      await onApplyPromotion(promoCode);
      message.success('Promotion code applied successfully');
    } catch (error) {
      message.error('Failed to apply promotion code');
    } finally {
      setApplyingPromo(false);
    }
  };

  return (
    <div className="p-4 h-full overflow-auto">
      {/* <LogoText className="text-2xl font-semibold mb-4">Order Review</LogoText> */}
      <Card className="mb-4">
        <Title level={4}>Total Payable: S${totalPayable.toFixed(2)}</Title>
        <Text>Subtotal: S${subtotal.toFixed(2)}</Text>
        {discount > 0 && <Text className="block text-green-600">Discount: -S${discount.toFixed(2)}</Text>}
        <Title level={5} className="mt-4">
          Admissions
        </Title>
        <Text>{attractionName}</Text>
        <Text className="block">{selectedDate.format('DD/MM/YYYY')}</Text>
        {ticketDetails.map((detail, index) => (
          <Text key={index} className="block">
            {detail.quantity} x {detail.description} - S${(detail.price * detail.quantity).toFixed(2)}
          </Text>
        ))}
      </Card>
      <Card className="mb-4">
        <Title level={5}>Promotion Code</Title>
        <Input.Group compact>
          <Input
            style={{ width: 'calc(100% - 80px)' }}
            placeholder="Enter promotion code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <Button type="primary" onClick={handleApplyPromotion} loading={applyingPromo} style={{ width: '80px' }}>
            Apply
          </Button>
        </Input.Group>
      </Card>
      <Row gutter={16}>
        <Col span={12}>
          <Button onClick={onBack} className="w-full">
            Back
          </Button>
        </Col>
        <Col span={12}>
          <Button type="primary" onClick={onNext} className="w-full">
            Next
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default OrderReview;
