import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Button, Empty, Space } from 'antd';
import { EventResponse, EventStatusEnum, getEventsByParkId } from '@lepark/data-access';
import { useNavigate } from 'react-router-dom';
import EventStatusTag from '../../EventDetails/components/EventStatusTag';
import { FiExternalLink } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useFetchPublicFacilitiesForEventsByPark } from '../../../hooks/Facilities/useFetchPublicFacilitiesForEventsByPark';

const { Text, Title } = Typography;

interface EventsTabProps {
  parkId: number;
}

const EventsTab: React.FC<EventsTabProps> = ({ parkId }) => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { facilities } = useFetchPublicFacilitiesForEventsByPark(parkId);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getEventsByParkId(parkId);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [parkId]);

  const handleViewDetails = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  if (loading) {
    return <div>Loading events...</div>;
  }

  if (events.length === 0) {
    return <Empty description="No events found for this park" />;
  }

  const handleViewAllEvents = () => {
    const facilityIds = facilities.map(facility => facility.id);
    navigate('/event', { state: { parkId, facilityIds } });
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button type="link" icon={<FiExternalLink />} onClick={handleViewAllEvents}>
          View All Events
        </Button>
      </div>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={events}
        renderItem={(event) => (
          <List.Item>
            <Card
              hoverable
              className="w-full"
              cover={
                event.images && event.images.length > 0 ? (
                  <img alt={event.title} src={event.images[0]} className="h-[150px] object-cover" />
                ) : (
                  <div className="h-[150px] bg-gray-100 flex items-center justify-center">
                    <Empty description="No Image" />
                  </div>
                )
              }
            >
              <Card.Meta
                title={
                  <div className="flex justify-between items-center">
                    <Title level={5} className="m-0">{event.title}</Title>
                    <EventStatusTag status={event.status as EventStatusEnum} />
                  </div>
                }
                description={
                  <>
                    <div className="mt-2 text-sm text-gray-600">
                      <div>{dayjs(event.startDate).format('MMM D, YYYY')} - {dayjs(event.endDate).format('MMM D, YYYY')}</div>
                      <div>{dayjs(event.startDate).format('h:mm A')} - {dayjs(event.endDate).format('h:mm A')}</div>
                    </div>
                    <Button 
                      type="link" 
                      onClick={() => handleViewDetails(event.id)} 
                      className="p-0 mt-2 text-sm"
                    >
                      View Details
                    </Button>
                  </>
                }
              />
            </Card>
          </List.Item>
        )}
      />
    </>
  );
};

export default EventsTab;