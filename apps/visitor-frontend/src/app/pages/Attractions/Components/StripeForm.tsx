import React, { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@lepark/common-ui';
import { createAttractionTicketTransaction, deleteAttractionTicketTransaction, VisitorResponse } from '@lepark/data-access';

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
  isFreeTicket?: boolean;
}

const StripeForm: React.FC<StripeFormProps> = ({
  ticketDetails,
  totalPayable,
  attractionName,
  selectedDate,
  paymentIntentId,
  attractionId,
  isFreeTicket = false,
}) => {
  const stripe = isFreeTicket ? null : useStripe();
  const elements = isFreeTicket ? null : useElements();
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

      console.log(paymentIntentId);
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

  const handleFreeTicket = async () => {
    setIsProcessing(true);
    try {
      const transactionId = await handleProcessing();
      navigate(`/payment-completion/${transactionId}`);
    } catch (error) {
      console.error(error);
      message.error('An error occurred while processing your free ticket.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (isFreeTicket) {
      await handleFreeTicket();
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const transactionId = await handleProcessing();

      console.log(transactionId);

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-completion/${transactionId}`,
        },
      });

      if (error) {
        await deleteAttractionTicketTransaction(transactionId);
        // message.error(error.message);
        navigate(`/payment-completion/${transactionId}?payment_intent=${paymentIntentId}`);
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
      {!isFreeTicket && <PaymentElement />}
      {isFreeTicket && <div className="mb-4">This is a free ticket. Click the button below to confirm your order.</div>}
      <div className="mt-5 flex w-full justify-end">
        <Button type="primary" onClick={handlePayment} disabled={isProcessing} className="w-full md:w-1/5 lg:w-1/5">
          {isProcessing ? 'Processing...' : isFreeTicket ? 'Confirm Free Ticket' : 'Pay'}
        </Button>
      </div>
    </div>
  );
};

export default StripeForm;
