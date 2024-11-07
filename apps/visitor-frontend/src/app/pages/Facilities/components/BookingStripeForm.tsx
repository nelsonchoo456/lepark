import React, { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { StripePaymentElementChangeEvent } from '@stripe/stripe-js';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@lepark/common-ui';
import { updateBookingStatus, VisitorResponse } from '@lepark/data-access';

interface BookingStripeFormProps {
  bookingId: string;
  facilityName: string;
  totalPayable: number;
  paymentIntentId: string;
}

const BookingStripeForm: React.FC<BookingStripeFormProps> = ({ bookingId, facilityName, totalPayable, paymentIntentId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth<VisitorResponse>();
  const [isComplete, setIsComplete] = useState(false);

  const handlePayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-payment-completion/${bookingId}`,
        },
      });

      if (error) {
        message.error(error.message);
        navigate(`/booking-payment-completion/${bookingId}?payment_intent=${paymentIntentId}`);
      }
    } catch (error) {
      console.error(error);
      message.error('An error occurred during payment processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentElementChange = (event: StripePaymentElementChangeEvent) => {
    setIsComplete(event.complete);
  };

  return (
    <div>
      <PaymentElement onChange={handlePaymentElementChange} />
      <div className="mt-5 flex w-full justify-end">
        <Button type="primary" onClick={handlePayment} disabled={isProcessing || !isComplete} className="w-full md:w-1/5 lg:w-1/5">
          {isProcessing ? 'Processing...' : 'Pay'}
        </Button>
      </div>
    </div>
  );
};

export default BookingStripeForm;
