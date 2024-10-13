import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Card } from 'antd';
import { LogoText } from '@lepark/common-ui';
import { Elements } from '@stripe/react-stripe-js';
import { Appearance, Stripe, StripeElementsOptions, loadStripe } from '@stripe/stripe-js';
import StripeForm from './Components/StripeForm';
import { createPaymentIntent, getStripePublishableKey } from '@lepark/data-access';

const { Title, Text } = Typography;

interface PaymentPageProps {
  attractionName: string;
  attractionId: string;
  selectedDate: string;
  ticketDetails: {
    id: string;
    description: string;
    quantity: number;
    price: number;
  }[];
  totalPayable: number;
}

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const { attractionName, attractionId, selectedDate, ticketDetails, totalPayable } = location.state as PaymentPageProps;

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

  //   useEffect(() => {
  //     apiJson.get(`/config`).then(async (r) => {
  //       const publishableKey = r.publishableKey;
  //       setStripePromise(await loadStripe(publishableKey));
  //     });
  //   }, []);

  useEffect(() => {
    const initializeStripeAndCreatePaymentIntent = async () => {
      try {
        // Initialize Stripe
        const publishableKey = await getStripePublishableKey();
        console.log(publishableKey);
        setStripePromise(await loadStripe(publishableKey));

        // Create payment intent
        if (totalPayable) {
          const response = await createPaymentIntent(totalPayable);
          setClientSecret(response.data.clientSecret);
          setPaymentIntentId(response.data.id);
        }
      } catch (error) {
        console.error('Error initializing Stripe or creating payment intent:', error);
        // Handle error (e.g., show error message to user)
      }
    };

    initializeStripeAndCreatePaymentIntent();
  }, [totalPayable]);

  return (
    <div className="p-4 h-full overflow-auto">
      <LogoText className="text-2xl font-semibold mb-4">Payment</LogoText>
      <Card className="mb-4">
        <Title level={4}>Order Summary</Title>
        <Text>Attraction: {attractionName}</Text>
        <Text className="block">Date: {selectedDate}</Text>
        <Title level={5} className="mt-4">
          Tickets
        </Title>
        {ticketDetails.map((detail, index) => (
          <Text key={index} className="block">
            {detail.quantity} x {detail.description} - S${(detail.price * detail.quantity).toFixed(2)}
          </Text>
        ))}
        <Title level={4} className="mt-4">
          Total Payable: S${totalPayable.toFixed(2)}
        </Title>
      </Card>
      {stripePromise && clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <StripeForm
            ticketDetails={ticketDetails}
            totalPayable={totalPayable}
            attractionName={attractionName}
            selectedDate={selectedDate}
            paymentIntentId={paymentIntentId}
            attractionId={attractionId}
          />
        </Elements>
      )}
    </div>
  );
};

export default PaymentPage;
