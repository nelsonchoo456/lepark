import React, { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@lepark/common-ui';
import { createAttractionTicketTransaction, VisitorResponse } from '@lepark/data-access';

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
  attractionId: string;
}

const StripeForm: React.FC<StripeFormProps> = ({
  ticketDetails,
  totalPayable,
  attractionName,
  selectedDate,
  paymentIntentId,
  attractionId,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth<VisitorResponse>();

  const handleProcessing = async () => {
    try {
      console.log(selectedDate);
      const [day, month, year] = selectedDate.split('/').map(Number);
      const attractionDate = new Date(year, month - 1, day);
      attractionDate.setHours(0, 0, 0, 0);

      const purchaseDate = new Date();

      console.log(attractionDate);
      console.log(purchaseDate);

      const tickets = ticketDetails.map((ticket) => ({
        listingId: ticket.id,
        quantity: ticket.quantity,
      }));

      const transactionData = {
        attractionDate: attractionDate,
        purchaseDate: purchaseDate,
        totalAmount: totalPayable,
        attractionId: attractionId,
        visitorId: user?.id || '',
        tickets: tickets,
      };

      console.log(transactionData);

      const response = await createAttractionTicketTransaction(transactionData);

      console.log(response);

      return response.data.id;
    } catch (error) {
      console.error(error);
      message.error('An error occurred while processing your order.');
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const transactionId = await handleProcessing();

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-completion/${transactionId}/${paymentIntentId}`,
        },
      });

      if (error) {
        message.error(error.message);
      } else {
        message.success('Your payment has been successfully completed!');
        navigate('/payment-success');
      }
    } catch (error) {
      console.error(error);
      message.error('An error occurred during payment processing.');
    } finally {
      setIsProcessing(false);
    }
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
