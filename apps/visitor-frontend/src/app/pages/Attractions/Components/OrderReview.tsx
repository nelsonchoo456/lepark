import React, { useState, useEffect, useMemo } from 'react';
import { Card, Typography, Button, Row, Col, Input, message, Spin } from 'antd';
import { LogoText } from '@lepark/common-ui';
import { Dayjs } from 'dayjs';
import { PromotionResponse, DiscountTypeEnum, getAllPromotions } from '@lepark/data-access';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// Extend dayjs with the plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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
  onApplyPromotion: (promotion: PromotionResponse | null) => void;
  onBack: () => void;
  onNext: (totalPayable: number, subtotal: number, discount: number) => void;
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
    let calculatedDiscount;
    if (appliedPromotion.discountType === DiscountTypeEnum.FIXED_AMOUNT) {
      calculatedDiscount = appliedPromotion.discountValue;
    } else {
      calculatedDiscount = subtotal * (appliedPromotion.discountValue / 100);
    }
    // Ensure discount doesn't exceed subtotal
    return Math.min(calculatedDiscount, subtotal);
  }, [appliedPromotion, subtotal]);

  const totalPayable = subtotal - discount;

  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      try {
        const response = await getAllPromotions(false, true);
        const currentDate = dayjs();
        const validPromotions = response.data.filter((promotion) => {
          const validFrom = dayjs(promotion.validFrom);
          const validUntil = dayjs(promotion.validUntil);
          return currentDate.isSameOrAfter(validFrom, 'day') && currentDate.isSameOrBefore(validUntil, 'day');
        });
        setPromotions(validPromotions);
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
    if (appliedPromotion?.id === promotion.id) {
      // If the same promotion is clicked again, unapply it
      onApplyPromotion(null);
    } else {
      // Apply the new promotion
      onApplyPromotion(promotion);
    }
  };

  const renderPromotionCard = (promotion: PromotionResponse) => {
    const isApplied = appliedPromotion?.id === promotion.id;

    const discountValue =
      promotion.discountType === DiscountTypeEnum.FIXED_AMOUNT
        ? `S$${promotion.discountValue.toFixed(2)} OFF`
        : `${promotion.discountValue}% OFF`;

    const validityPeriod = `Valid from ${dayjs(promotion.validFrom).format('DD MMM YYYY')} to ${dayjs(promotion.validUntil).format(
      'DD MMM YYYY',
    )}`;

    return (
      <Card key={promotion.id} className="mb-4">
        <div className="flex flex-col h-full">
          <div className="flex-grow">
            <Title level={5}>{promotion.name}</Title>
            <Text>{promotion.description}</Text>
          </div>
          <div className="mt-4 flex justify-between items-end">
            <div>
              <Text className="block text-green-600 font-semibold">{discountValue}</Text>
              <Text className="block text-xs text-gray-500">{validityPeriod}</Text>
            </div>
            <Button
              type={isApplied ? 'primary' : 'default'}
              onClick={() => handleApplyPromotion(promotion)}
              disabled={!isApplied && appliedPromotion !== null}
            >
              {isApplied ? 'Applied' : 'Apply'}
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const handleNext = () => {
    onNext(totalPayable, subtotal, discount);
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

      <Title level={5} className="mt-6 mb-4">
        Available Promotions
      </Title>
      {loading ? (
        <div className="text-center">
          <Spin size="large" />
          <Text className="block mt-2">Loading promotions...</Text>
        </div>
      ) : (
        promotions.map(renderPromotionCard)
      )}

      <Row gutter={16} className="mt-6">
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
