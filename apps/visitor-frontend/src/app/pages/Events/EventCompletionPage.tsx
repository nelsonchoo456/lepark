import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { Stripe, loadStripe } from '@stripe/stripe-js';
import { message } from 'antd';
import {
  fetchPayment,
  getEventTicketTransactionById,
  getStripePublishableKey,
  sendEventTicketEmail,
  viewVisitorDetails,
  VisitorResponse,
} from '@lepark/data-access';

const EventCompletionPage: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [searchParams] = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent') || '';
  const [error, setError] = useState<boolean | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | undefined>();
  const navigate = useNavigate();
  const paymentProcessed = useRef(false);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const publishableKey = await getStripePublishableKey();
        setStripePromise(loadStripe(publishableKey));
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
        message.error('Failed to initialize payment system');
      }
    };

    initializeStripe();
  }, []);

  useEffect(() => {
    const handleCompletion = async () => {
      if (paymentProcessed.current) {
        return;
      }

      paymentProcessed.current = true;

      try {
        const response = await fetchPayment(paymentIntentId);

        console.log(response.data);

        if (response.data.status !== 'succeeded') {
          setError(true);
          setClientSecret(response.data.secret);
          return;
        }
      } catch (error) {
        console.error(error);
      }

      try {
        const transaction = await getEventTicketTransactionById(transactionId || '');

        if (transaction.data.totalAmount > 0) {
          // Paid ticket
          if (!paymentIntentId) {
            throw new Error('Payment intent ID is missing for a paid ticket');
          }
        }

        // At this point, either it's a free ticket or the payment has succeeded
        const visitor = await viewVisitorDetails(transaction.data.visitorId);

        const emailTicketsData = {
          transactionId: transactionId || '',
          recipientEmail: visitor.data.email,
        };

        await sendEventTicketEmail(emailTicketsData);

        setError(false);
        navigate('/event-success');
      } catch (error) {
        console.error('Error processing completion:', error);
        setError(true);
        message.error('An error occurred while processing your order');
      }
    };

    handleCompletion();
  }, [transactionId, paymentIntentId, navigate]);

  if (error === null) {
    return <div className="flex justify-center pt-50 text-2xl">Processing your order...</div>;
  }

  if (error === true) {
    navigate('/event-failed');
  }

  return null;
};

export default EventCompletionPage;
