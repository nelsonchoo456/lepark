import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Card, Row, Col, Button, Checkbox, Spin } from 'antd';
import { LogoText } from '@lepark/common-ui';
import dayjs, { Dayjs } from 'dayjs';
import {
  AttractionResponse,
  AttractionTicketListingResponse,
  getAttractionById,
  getAttractionTicketListingsByAttractionId,
} from '@lepark/data-access';
import SelectDateAndReview from './Components/SelectDateAndReview';
import OrderReview from './Components/OrderReview';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

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

  useEffect(() => {
    const fetchTickets = async () => {
      if (attractionId) {
        try {
          const response = await getAttractionTicketListingsByAttractionId(attractionId);
          setListings(response.data);

          const attractionResponse = await getAttractionById(attractionId);
          setAttraction(attractionResponse.data);
        } catch (error) {
          console.error('Error fetching ticket data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchTickets();
  }, [attractionId]);

  const groupedListings = listings.reduce((acc, listing) => {
    const key = listing.nationality === 'LOCAL' ? 'Local Resident?' : 'Foreign Resident?';
    if (!acc[key]) acc[key] = [];
    acc[key].push(listing);
    return acc;
  }, {} as Record<string, AttractionTicketListingResponse[]>);

  const handleTicketCountChange = (listingId: string, increment: number) => {
    setTicketCounts((prev) => ({
      ...prev,
      [listingId]: Math.max(0, (prev[listingId] || 0) + increment),
    }));
  };

  const handleProceedToDateSelection = () => {
    setStep('select-date');
  };

  const handleBackToTicketSelection = () => {
    setStep('select-tickets');
  };

  const handleDateSelected = (date: Dayjs) => {
    setSelectedDate(date);
    setStep('order-review');
  };

  const handleBackToDateSelection = () => {
    setStep('select-date');
  };

  const handleApplyPromotion = async (code: string) => {
    // Implement the logic to apply promotion code
    // This is a placeholder implementation
    console.log('Applying promotion code:', code);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Set a sample discount (replace with actual logic)
    setDiscount(5);
  };

  const handleProceedToPayment = (totalPayable: number) => {
    setFinalTotalPayable(totalPayable);
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
        totalPayable: finalTotalPayable,
      },
    });
  };

  const renderListingRow = (listing: AttractionTicketListingResponse) => (
    <div key={listing.id} className="mb-4">
      <Row justify="space-between" align="middle" className="mb-1">
        <Col span={14}>
          <Text strong className="text-lg">
            {listing.category}
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
            {Object.entries(groupedListings).map(([nationality, listings]) => (
              <Card key={nationality} className="mb-4 shadow-sm">
                <Title level={4}>{nationality}</Title>
                {nationality === 'Local Resident?' && (
                  <Checkbox className="mb-4 text-sm">
                    I understand that I will not be permitted from entering if I could not prove my identity at the admission gate
                  </Checkbox>
                )}
                {listings.map(renderListingRow)}
              </Card>
            ))}
            <div className="mt-4 pb-16">
              <Button
                type="primary"
                className="w-full h-12 text-lg"
                onClick={handleProceedToDateSelection}
                disabled={Object.values(ticketCounts).every((count) => count === 0)}
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
            ticketDetails={Object.entries(ticketCounts).map(([id, quantity]) => {
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
            ticketDetails={Object.entries(ticketCounts).map(([id, quantity]) => {
              const listing = listings.find((l) => l.id === id);
              return {
                description: `${listing?.nationality} · ${listing?.category}` || '',
                quantity,
                price: listing?.price || 0,
              };
            })}
            discount={discount}
            onApplyPromotion={handleApplyPromotion}
            onBack={handleBackToDateSelection}
            onNext={handleProceedToPayment}
          />
        );
      case 'payment':
        handleNavigateToPayment();
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="md:p-4 md:h-screen md:overflow-hidden">
      <div className="w-full gap-4 md:flex md:h-full md:overflow-hidden">
        <div className="flex-1 flex-col flex md:h-full md:overflow-x-auto">
          <div className="sticky top-0 bg-white z-10 p-4">
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
