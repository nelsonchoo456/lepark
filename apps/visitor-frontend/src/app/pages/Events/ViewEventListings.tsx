import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Row, Col, Button, Checkbox, Spin } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { LogoText } from '@lepark/common-ui';
import dayjs, { Dayjs } from 'dayjs';
import {
  EventResponse,
  EventTicketListingResponse,
  DiscountTypeEnum,
  getEventById,
  getEventTicketListingsByEventId,
  PromotionResponse,
  getEventTicketTransactionsByEventId,
  EventTicketTransactionResponse,
} from '@lepark/data-access';
import SelectDateAndReview from './components/SelectDateAndReview';
import OrderReview from './components/OrderReview';

const { Title, Text } = Typography;

interface TicketDetail {
  description: string;
  quantity: number;
  price: number;
}

const ViewEventTicketListings = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [listings, setListings] = useState<EventTicketListingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({});
  const [step, setStep] = useState('select-tickets');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [discount, setDiscount] = useState(0);
  const [finalTotalPayable, setFinalTotalPayable] = useState<number>(0);
  const navigate = useNavigate();
  const [appliedPromotion, setAppliedPromotion] = useState<PromotionResponse | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [termsChecked, setTermsChecked] = useState(false);
  const [soldTicketsByDate, setSoldTicketsByDate] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchTickets = async () => {
      if (eventId) {
        try {
          const [ticketListingsResponse, eventResponse, transactionsResponse] = await Promise.all([
            getEventTicketListingsByEventId(eventId),
            getEventById(eventId),
            getEventTicketTransactionsByEventId(eventId),
          ]);

          const activeListings = ticketListingsResponse.data.filter((listing) => listing.isActive);
          setListings(activeListings);
          setEvent(eventResponse.data);

          const ticketsByDate = transactionsResponse.data.reduce((acc, transaction) => {
            const dateKey = dayjs(transaction.eventDate).format('YYYY-MM-DD');
            acc[dateKey] = (acc[dateKey] || 0) + transaction.eventTickets.length;
            return acc;
          }, {} as Record<string, number>);

          setSoldTicketsByDate(ticketsByDate);
          console.log(ticketsByDate);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchTickets();
  }, [eventId]);

  const groupedListings = listings.reduce((acc, listing) => {
    const key = listing.nationality === 'LOCAL' ? 'Local Resident' : 'Standard';
    if (!acc[key]) acc[key] = [];
    acc[key].push(listing);
    return acc;
  }, {} as Record<string, EventTicketListingResponse[]>);

  const handleTicketCountChange = (listingId: string, increment: number) => {
    setTicketCounts((prev) => ({
      ...prev,
      [listingId]: Math.max(0, (prev[listingId] || 0) + increment),
    }));
  };

  const handleProceedToDateSelection = () => {
    setStep('select-date');
  };

  const handleBackToTicketSelection = (currentTickets: TicketDetail[]) => {
    const updatedTicketCounts = currentTickets.reduce((acc, ticket) => {
      const listing = listings.find((l) => `${l.nationality} · ${l.category}` === ticket.description);
      if (listing) {
        acc[listing.id] = ticket.quantity;
      }
      return acc;
    }, {} as Record<string, number>);

    setTicketCounts(updatedTicketCounts);
    setStep('select-tickets');
  };

  const handleDateSelected = (date: Dayjs) => {
    setSelectedDate(date);
    setStep('order-review');
  };

  const handleBackToDateSelection = () => {
    setStep('select-date');
  };

  const handleApplyPromotion = (promotion: PromotionResponse | null) => {
    setAppliedPromotion(promotion);
  };

  const handleProceedToPayment = (totalPayable: number, calculatedSubtotal: number, calculatedDiscount: number) => {
    setFinalTotalPayable(totalPayable);
    setSubtotal(calculatedSubtotal);
    setDiscount(calculatedDiscount);
    setStep('payment');
  };

  const handleNavigateToPayment = () => {
    const selectedTickets = Object.entries(ticketCounts)
      .filter(([_, quantity]) => quantity > 0)
      .map(([id, quantity]) => {
        const listing = listings.find((l) => l.id === id);
        return {
          id,
          description: `${listing?.nationality} · ${listing?.category}`,
          quantity,
          price: listing?.price || 0,
        };
      });

    navigate('/event-payment', {
      state: {
        eventName: event?.title || '',
        eventId: eventId,
        selectedDate: selectedDate?.format('DD/MM/YYYY'),
        ticketDetails: selectedTickets,
        subtotal: subtotal,
        discount: discount,
        totalPayable: finalTotalPayable,
      },
    });
  };

  const renderListingRow = (listing: EventTicketListingResponse) => (
    <div key={listing.id} className="mb-4">
      <Row justify="space-between" align="middle" className="mb-1">
        <Col span={14}>
          <Text strong className="text-lg">
            {listing.category.charAt(0).toUpperCase() + listing.category.slice(1).toLowerCase()}
          </Text>
          <Text strong className="text-lg ml-2">
            S${listing.price}
          </Text>
        </Col>
        <Col span={10} className="flex items-center justify-end">
          <Button onClick={() => handleTicketCountChange(listing.id, -1)}>-</Button>
          <Text className="mx-2 text-base">{ticketCounts[listing.id] || 0}</Text>
          <Button onClick={() => handleTicketCountChange(listing.id, 1)}>+</Button>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Text className="text-sm text-gray-600">{listing.description}</Text>
        </Col>
      </Row>
    </div>
  );

  const renderContent = () => {
    switch (step) {
      case 'select-tickets':
        return (
          <>
            {Object.entries(groupedListings).map(([category, listings]) => (
              <Card key={category} className="mb-4 shadow-sm">
                <div className="mb-4">
                  <Title level={4}>{category}</Title>
                </div>
                {listings.map(renderListingRow)}
              </Card>
            ))}
            <div className="mt-4 pb-16">
              <Checkbox className="mb-4 text-sm" checked={termsChecked} onChange={handleTermsCheckbox}>
                I understand that I will not be permitted from entering if I do not have the necessary proof of identification (e.g. NRIC,
                Student ID)
              </Checkbox>
              <Button
                type="primary"
                className="w-full h-12 text-lg"
                onClick={handleProceedToDateSelection}
                disabled={Object.values(ticketCounts).every((count) => count === 0) || !termsChecked}
              >
                Proceed to Date Selection
              </Button>
            </div>
          </>
        );
      case 'select-date':
        return (
          <SelectDateAndReview
            eventName={event?.title || ''}
            eventStartDate={dayjs(event?.startDate)}
            eventEndDate={dayjs(event?.endDate)}
            maxCapacity={event?.maxCapacity || 0}
            soldTicketsByDate={soldTicketsByDate}
            ticketDetails={Object.entries(ticketCounts)
              .filter(([_, quantity]) => quantity > 0)
              .map(([id, quantity]) => {
                const listing = listings.find((l) => l.id === id);
                return {
                  description: `${listing?.nationality} · ${listing?.category}` || '',
                  quantity,
                  price: listing?.price || 0,
                };
              })}
            onBack={handleBackToTicketSelection}
            onNext={handleDateSelected}
          />
        );
      case 'order-review':
        return (
          <OrderReview
            eventName={event?.title || ''}
            selectedDate={selectedDate!}
            ticketDetails={Object.entries(ticketCounts)
              .filter(([_, quantity]) => quantity > 0)
              .map(([id, quantity]) => {
                const listing = listings.find((l) => l.id === id);
                return {
                  description: `${listing?.nationality} · ${listing?.category}` || '',
                  quantity,
                  price: listing?.price || 0,
                };
              })}
            appliedPromotion={appliedPromotion}
            onApplyPromotion={handleApplyPromotion}
            onBack={handleBackToDateSelection}
            onNext={(totalPayable, subtotal, discount) => handleProceedToPayment(totalPayable, subtotal, discount)}
          />
        );
      case 'payment':
        handleNavigateToPayment();
        return null;
      default:
        return null;
    }
  };

  const handleTermsCheckbox = (e: CheckboxChangeEvent) => {
    setTermsChecked(e.target.checked);
  };

  return (
    <div className="md:p-4 md:h-screen md:overflow-hidden">
      <div className="w-full gap-4 md:flex md:h-full md:overflow-hidden">
        <div className="flex-1 flex-col flex md:h-full md:overflow-x-auto">
          <div className="sticky top-0 bg-white z-10 p-4">
            <LogoText className="text-2xl font-semibold">
              {step === 'select-tickets' ? 'Select Tickets' : step === 'select-date' ? 'Select Date' : 'Order Review'}
            </LogoText>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Spin size="large" />
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEventTicketListings;
