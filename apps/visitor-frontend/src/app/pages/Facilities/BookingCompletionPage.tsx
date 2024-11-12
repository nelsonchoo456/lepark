import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import {
  BookingStatusEnum,
  fetchPayment,
  getBookingById,
  sendBookingEmail,
  updateBookingStatus,
  viewVisitorDetails,
} from '@lepark/data-access';

const BookingCompletionPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent') || '';
  const [error, setError] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const paymentProcessed = useRef(false);

  useEffect(() => {
    const handleCompletion = async () => {
      if (paymentProcessed.current) {
        return;
      }

      paymentProcessed.current = true;

      try {
        const response = await fetchPayment(paymentIntentId);

        if (response.data.status !== 'succeeded') {
          setError(true);
          return;
        }

        // Update booking status to CONFIRMED
        await updateBookingStatus(bookingId || '', { status: BookingStatusEnum.CONFIRMED });

        // Send confirmation email
        const booking = await getBookingById(bookingId || '');
        const visitor = await viewVisitorDetails(booking.data.visitorId);

        const emailData = {
          bookingId: bookingId || '',
          recipientEmail: visitor.data.email,
        };

        await sendBookingEmail(emailData);

        setError(false);
        navigate('/booking-success');
      } catch (error) {
        console.error('Error processing completion:', error);
        setError(true);
        message.error('An error occurred while processing your booking');
      }
    };

    handleCompletion();
  }, [bookingId, paymentIntentId, navigate]);

  if (error === null) {
    return <div className="flex justify-center pt-50 text-2xl">Processing your booking...</div>;
  }

  if (error === true) {
    navigate('/booking-failed');
  }

  return null;
};

export default BookingCompletionPage;
