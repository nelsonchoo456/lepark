import React, { useState, useEffect, useMemo } from 'react';
import { Card, Typography, Button, Row, Col, Input, message } from 'antd';
import { LogoText } from '@lepark/common-ui';
import { Dayjs } from 'dayjs';
import { PromotionResponse, DiscountTypeEnum, getAllPromotions } from '@lepark/data-access';

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
  appliedPromotion: PromotionResponse | null;
  onApplyPromotion: (promotion: PromotionResponse) => void;
  onBack: () => void;
  onNext: (totalPayable: number) => void;
}

const OrderReview: React.FC<OrderReviewProps> = ({
  attractionName,
  selectedDate,
  ticketDetails,
  appliedPromotion,
  onApplyPromotion,
  onBack,
  onNext,
}) => {
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(() => ticketDetails.reduce((sum, detail) => sum + detail.price * detail.quantity, 0), [ticketDetails]);

  const discount = useMemo(() => {
    if (!appliedPromotion) return 0;
    if (appliedPromotion.discountType === DiscountTypeEnum.FIXED_AMOUNT) {
      return appliedPromotion.discountValue;
    } else {
      return subtotal * (appliedPromotion.discountValue / 100);
    }
  }, [appliedPromotion, subtotal]);

  const totalPayable = subtotal - discount;

  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      try {
        const response = await getAllPromotions(false, true);
        setPromotions(response.data);
      } catch (error) {
        console.error('Error fetching promotions:', error);
        message.error('Failed to load promotions');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const handleApplyPromotion = (promotion: PromotionResponse) => {
    onApplyPromotion(promotion);
  };

  const renderPromotionCard = (promotion: PromotionResponse) => {
    const isApplied = appliedPromotion?.id === promotion.id;
    const isDisabled = appliedPromotion !== null && !isApplied;

    const discountValue =
      promotion.discountType === DiscountTypeEnum.FIXED_AMOUNT ? `$${promotion.discountValue} OFF` : `${promotion.discountValue}% OFF`;

    return (
      <Card key={promotion.id} className="mb-4">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={5}>{promotion.name}</Title>
            <Text>{promotion.description}</Text>
            <Text className="block text-green-600">{discountValue}</Text>
          </Col>
          <Col>
            <Button type={isApplied ? 'primary' : 'default'} onClick={() => handleApplyPromotion(promotion)} disabled={isDisabled}>
              {isApplied ? 'Applied' : 'Apply'}
            </Button>
          </Col>
        </Row>
      </Card>
    );
  };

  const handleNext = () => {
    onNext(totalPayable);
  };

  return (
    <div className="p-4 h-full overflow-auto">
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

      <Title level={5}>Available Promotions</Title>
      {loading ? <div>Loading promotions...</div> : promotions.map(renderPromotionCard)}

      <Row gutter={16} className="mt-4">
        <Col span={12}>
          <Button onClick={onBack} className="w-full">
            Back
          </Button>
        </Col>
        <Col span={12}>
          <Button type="primary" onClick={handleNext} className="w-full">
            Next
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default OrderReview;
