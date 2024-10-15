import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { Stripe, loadStripe } from '@stripe/stripe-js';
import { message } from 'antd';
// import RetryForm from './RetryForm'; // Assuming you have a RetryForm component
import {
  fetchPayment,
  getAttractionTicketTransactionById,
  getStripePublishableKey,
  sendAttractionTicketEmail,
  viewVisitorDetails,
  VisitorResponse,
} from '@lepark/data-access';

interface PaymentData {
  amount: number;
  time: Date;
  paymentType: string;
  transactionId: string;
  description: string;
}

const CompletionPage: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string; paymentIntentId: string }>();
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
    const handleFetchPayment = async () => {
      if (paymentProcessed.current) {
        return;
      }

      paymentProcessed.current = true;

      try {
        console.log(paymentIntentId);
        const response = await fetchPayment(paymentIntentId);

        console.log(response);

        if (response.data.status === 'succeeded') {
          //   const payment: PaymentData = {
          //     amount: res.amount / 100,
          //     time: new Date(),
          //     paymentType: res.type,
          //     transactionId: paymentIntentId,
          //     description: res.description,
          //   };

          //   await apiJson.post(`/api/attractionTickets/completePayment/${transactionId}`, { payment });
          const transaction = await getAttractionTicketTransactionById(transactionId || '');
          const visitor = await viewVisitorDetails(transaction.data.visitorId);

          const emailTicketsData = {
            transactionId: transactionId || '',
            recipientEmail: visitor.data.email,
          };

          await sendAttractionTicketEmail(emailTicketsData);

          setError(false);
          navigate('/success');
        } else {
          setError(true);
          setClientSecret(response.data.secret);
        }
      } catch (error) {
        console.error('Error fetching payment:', error);
        setError(true);
        message.error('An error occurred while processing your payment');
      }
    };

    if (transactionId && paymentIntentId) {
      handleFetchPayment();
    }
  }, [transactionId, paymentIntentId, navigate]);

  if (error === null) {
    return <div className="flex justify-center pt-50 text-2xl">Processing your payment...</div>;
  }

  if (error === true && clientSecret && stripePromise) {
    return (
      //   <Elements stripe={stripePromise} options={{ clientSecret }}>
      //     <RetryForm transactionId={transactionId} paymentIntentId={paymentIntentId} />
      //   </Elements>
      <></>
    );
  }

  return null;
};

export default CompletionPage;
