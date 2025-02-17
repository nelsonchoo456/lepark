import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Card, Row, Col, Button, Checkbox, Spin, Steps, message } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { LogoText } from '@lepark/common-ui';
import dayjs, { Dayjs } from 'dayjs';
import {
  AttractionResponse,
  AttractionTicketListingResponse,
  DiscountTypeEnum,
  getAttractionById,
  getAttractionTicketListingsByAttractionId,
  PromotionResponse,
  getAttractionTicketTransactionsByAttractionId,
} from '@lepark/data-access';
import SelectDateAndReview from './Components/SelectDateAndReview';
import OrderReview from './Components/OrderReview';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface TicketDetail {
  description: string;
  quantity: number;
  price: number;
}

const ViewAttractionTicketListings = () => {
  const { attractionId } = useParams<{ attractionId: string }>();
  const [listings, setListings] = useState<AttractionTicketListingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({});
  const [step, setStep] = useState('select-tickets');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [attraction, setAttraction] = useState<AttractionResponse | null>(null);
  const [discount, setDiscount] = useState(0);
  const [finalTotalPayable, setFinalTotalPayable] = useState<number>(0);
  const navigate = useNavigate();
  const [appliedPromotion, setAppliedPromotion] = useState<PromotionResponse | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [termsChecked, setTermsChecked] = useState(false);
  const [soldTicketsByDate, setSoldTicketsByDate] = useState<Record<string, number>>({});

  const totalTicketsSelected = Object.values(ticketCounts).reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    const fetchTickets = async () => {
      if (attractionId) {
        try {
          const [ticketListingsResponse, attractionResponse, transactionsResponse] = await Promise.all([
            getAttractionTicketListingsByAttractionId(attractionId),
            getAttractionById(attractionId),
            getAttractionTicketTransactionsByAttractionId(attractionId),
          ]);

          const activeListings = ticketListingsResponse.data.filter((listing) => listing.isActive);
          setListings(activeListings);
          setAttraction(attractionResponse.data);

          // Calculate sold tickets by date
          const ticketsByDate = transactionsResponse.data.reduce((acc, transaction) => {
            const dateKey = dayjs(transaction.attractionDate).format('YYYY-MM-DD');
            acc[dateKey] = (acc[dateKey] || 0) + transaction.attractionTickets.length;
            return acc;
          }, {} as Record<string, number>);

          setSoldTicketsByDate(ticketsByDate);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchTickets();
  }, [attractionId]);

  const groupedListings = listings.reduce((acc, listing) => {
    const key = listing.nationality === 'LOCAL' ? 'Local Resident' : 'Standard';
    if (!acc[key]) acc[key] = [];
    acc[key].push(listing);
    return acc;
  }, {} as Record<string, AttractionTicketListingResponse[]>);

  const handleTicketCountChange = (listingId: string, increment: number) => {
    const newCount = Math.max(0, (ticketCounts[listingId] || 0) + increment);
    const newTotalTickets = totalTicketsSelected - (ticketCounts[listingId] || 0) + newCount;

    if (newTotalTickets > (attraction?.maxCapacity || 0)) {
      message.error(`Cannot exceed maximum capacity of ${attraction?.maxCapacity} tickets`);
      return;
    }

    setTicketCounts((prev) => ({
      ...prev,
      [listingId]: newCount,
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

    navigate('/payment', {
      state: {
        attractionName: attraction?.title || '',
        attractionId: attractionId,
        selectedDate: selectedDate?.format('DD/MM/YYYY'),
        ticketDetails: selectedTickets,
        subtotal: subtotal,
        discount: discount,
        totalPayable: finalTotalPayable,
      },
    });
  };

  const renderListingRow = (listing: AttractionTicketListingResponse) => (
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
          <Button onClick={() => handleTicketCountChange(listing.id, -1)} disabled={ticketCounts[listing.id] === 0}>
            -
          </Button>
          <Text className="mx-2 text-base">{ticketCounts[listing.id] || 0}</Text>
          <Button onClick={() => handleTicketCountChange(listing.id, 1)} disabled={totalTicketsSelected >= (attraction?.maxCapacity || 0)}>
            +
          </Button>
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
            {Object.entries(groupedListings).map(([nationality, listings]) => (
              <Card key={nationality} className="mb-4 shadow-sm">
                <div className="mb-4">
                  <Title level={4}>{nationality}</Title>
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
            attractionName={attraction?.title || ''}
            maxCapacity={attraction?.maxCapacity || 0}
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
            attractionName={attraction?.title || ''}
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

  const hasLocalResidentTickets = () => {
    return listings.some((listing) => listing.nationality === 'LOCAL' && ticketCounts[listing.id] > 0);
  };

  return (
    <div className="md:p-4 md:h-screen md:overflow-hidden">
      <div className="w-full gap-4 md:flex md:h-full md:overflow-hidden">
        <div className="flex-1 flex-col flex md:h-full md:overflow-x-auto">
          <div className="sticky top-0 bg-white z-10 px-4 py-2">
            <div className="flex gap-2 pb-2 items-center w-full">
              <div className={`rounded-full h-8 w-8 flex items-center justify-center text-white font-bold bg-green-500`}>1</div>
              <div className="h-[1px] flex-[1] bg-gray-300" />
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center text-white font-bold ${
                  step === 'select-date' || step === 'order-review' ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                2
              </div>
              <div className="h-[1px] flex-[1] bg-gray-300" />
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center text-white font-bold ${
                  step === 'order-review' ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                3
              </div>
            </div>
            <LogoText className="text-2xl font-semibold">
              {step === 'select-tickets' ? 'Select Listing' : step === 'select-date' ? 'Select Date' : 'Order Review'}
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
export default ViewAttractionTicketListings;
