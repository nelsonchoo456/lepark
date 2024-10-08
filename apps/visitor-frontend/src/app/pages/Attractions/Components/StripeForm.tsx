import React, { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

interface StripeFormProps {
  ticketDetails: {
    id: string;
    description: string;
    quantity: number;
    price: number;
  }[];
  totalPayable: number;
  attractionName: string;
  selectedDate: string;
  paymentIntentId: string;
}

const StripeForm: React.FC<StripeFormProps> = ({ ticketDetails, totalPayable, attractionName, selectedDate, paymentIntentId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-completion/${paymentIntentId}`,
      },
    });

    if (error) {
      message.error(error.message);
    } else {
      message.success('Your payment has been successfully completed!');
      // Navigate to a success page or back to the attraction page
      navigate('/payment-success');
    }

    setIsProcessing(false);
  };

  return (
    <div>
      <PaymentElement />
      <div className="mt-5 flex w-full justify-end">
        <Button type="primary" onClick={handlePayment} disabled={isProcessing} className="w-full md:w-1/5 lg:w-1/5">
          {isProcessing ? 'Processing...' : 'Pay'}
        </Button>
      </div>
    </div>
  );
};

export default StripeForm;
