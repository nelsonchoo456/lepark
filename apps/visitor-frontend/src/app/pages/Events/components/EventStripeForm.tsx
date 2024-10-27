import React, { useState } from 'react';
import { PaymentElement, useElements, useStripe, Elements } from '@stripe/react-stripe-js';
import { StripePaymentElementChangeEvent } from '@stripe/stripe-js';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@lepark/common-ui';
import { createEventTicketTransaction, deleteEventTicketTransaction, VisitorResponse } from '@lepark/data-access';

interface EventStripeFormProps {
  ticketDetails: {
    id: string;
    description: string;
    quantity: number;
    price: number;
  }[];
  totalPayable: number;
  eventName: string;
  selectedDate: string;
  paymentIntentId: string;
  eventId: string;
  isFreeTicket?: boolean;
}

const EventStripeForm: React.FC<EventStripeFormProps> = ({
  ticketDetails,
  totalPayable,
  eventName,
  selectedDate,
  paymentIntentId,
  eventId,
  isFreeTicket = false,
}) => {
  const stripe = isFreeTicket ? null : useStripe();
  const elements = isFreeTicket ? null : useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth<VisitorResponse>();
  const [isComplete, setIsComplete] = useState(false);

  const handleProcessing = async () => {
    try {
      const [day, month, year] = selectedDate.split('/').map(Number);
      const eventDate = new Date(year, month - 1, day);
      eventDate.setHours(0, 0, 0, 0);

      const purchaseDate = new Date();

      const tickets = ticketDetails.map((ticket) => ({
        listingId: ticket.id,
        quantity: ticket.quantity,
      }));

      const transactionData = {
        eventDate: eventDate,
        purchaseDate: purchaseDate,
        totalAmount: totalPayable,
        eventId: eventId,
        visitorId: user?.id || '',
        tickets: tickets,
      };

      const response = await createEventTicketTransaction(transactionData);

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
      navigate(`/event-payment-completion/${transactionId}`);
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

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/event-payment-completion/${transactionId}`,
        },
      });

      if (error) {
        await deleteEventTicketTransaction(transactionId);
        navigate(`/event-payment-completion/${transactionId}?payment_intent=${paymentIntentId}`);
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
      {!isFreeTicket && <PaymentElement onChange={handlePaymentElementChange} />}
      {isFreeTicket && <div className="mb-4">This is a free ticket. Click the button below to confirm your order.</div>}
      <div className="mt-5 flex w-full justify-end">
        <Button
          type="primary"
          onClick={handlePayment}
          disabled={isProcessing || (!isFreeTicket && !isComplete)}
          className="w-full md:w-1/5 lg:w-1/5"
        >
          {isProcessing ? 'Processing...' : isFreeTicket ? 'Confirm Free Ticket' : 'Pay'}
        </Button>
      </div>
    </div>
  );
};

export default EventStripeForm;
