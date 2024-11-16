import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Card } from 'antd';
import { LogoText } from '@lepark/common-ui';
import { Elements } from '@stripe/react-stripe-js';
import { Appearance, Stripe, StripeElementsOptions, loadStripe } from '@stripe/stripe-js';
import BookingStripeForm from './components/BookingStripeForm';
import { createPaymentIntent, getStripePublishableKey } from '@lepark/data-access';

const { Title, Text } = Typography;

interface PaymentPageProps {
  bookingId: string;
  facilityName: string;
  facilityId: string;
  dateStart: string;
  dateEnd: string;
  totalPayable: number;
}

const BookingPaymentPage: React.FC = () => {
  const location = useLocation();
  const { facilityName, bookingId, dateStart, dateEnd, totalPayable } = location.state as PaymentPageProps;

  const [stripePromise, setStripePromise] = useState<Stripe | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');

  const appearance: Appearance = {
    theme: 'stripe',
  };
  const options: StripeElementsOptions | undefined = {
    clientSecret,
    appearance,
  };

  useEffect(() => {
    const initializeStripeAndCreatePaymentIntent = async () => {
      try {
        const publishableKey = await getStripePublishableKey();
        setStripePromise(await loadStripe(publishableKey));

        if (totalPayable > 0) {
          const response = await createPaymentIntent(totalPayable);
          setClientSecret(response.data.clientSecret);
          setPaymentIntentId(response.data.id);
        }
      } catch (error) {
        console.error('Error initializing Stripe or creating payment intent:', error);
      }
    };

    initializeStripeAndCreatePaymentIntent();
  }, [totalPayable]);

  return (
    <div className="p-4 h-full overflow-auto">
      <LogoText className="text-2xl font-semibold mb-4">Payment</LogoText>
      <Card className="mb-4">
        <Title level={4}>Booking Summary</Title>
        <Text>Facility: {facilityName}</Text>
        <Text className="block">Start Date: {new Date(dateStart).toLocaleDateString()}</Text>
        <Text className="block">End Date: {new Date(dateEnd).toLocaleDateString()}</Text>
        <Title level={4} className="mt-4">
          Total Payable: S${totalPayable.toFixed(2)}
        </Title>
      </Card>
      {stripePromise && clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <BookingStripeForm
            bookingId={bookingId}
            facilityName={facilityName}
            totalPayable={totalPayable}
            paymentIntentId={paymentIntentId}
          />
        </Elements>
      )}
    </div>
  );
};

export default BookingPaymentPage;
