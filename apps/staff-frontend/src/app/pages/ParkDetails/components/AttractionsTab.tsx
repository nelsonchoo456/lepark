import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Button, Empty } from 'antd';
import { AttractionResponse, AttractionStatusEnum, getAttractionsByParkId } from '@lepark/data-access';
import { useNavigate } from 'react-router-dom';
import AttractionStatusTag from '../../AttractionDetails/components/AttractionStatusTag';
import { FiExternalLink } from 'react-icons/fi';

const { Text, Title } = Typography;

interface AttractionsTabProps {
  parkId: number;
}

const AttractionsTab: React.FC<AttractionsTabProps> = ({ parkId }) => {
  const [attractions, setAttractions] = useState<AttractionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const response = await getAttractionsByParkId(parkId);
        setAttractions(response.data);
      } catch (error) {
        console.error('Error fetching attractions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttractions();
  }, [parkId]);

  const handleViewDetails = (attractionId: string) => {
    navigate(`/attraction/${attractionId}`);
  };

  if (loading) {
    return <div>Loading attractions...</div>;
  }

  if (attractions.length === 0) {
    return <Empty description="No attractions found for this park" />;
  }

  const handleViewAllAttractions = () => {
    navigate('/attraction', { state: { parkId: parkId } });
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button 
          type="link" 
          icon={<FiExternalLink />} 
          onClick={handleViewAllAttractions}
        >
          View All Attractions
        </Button>
      </div>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={attractions}
        renderItem={(attraction) => (
          <List.Item>
            <Card
              hoverable
              className="w-full"
              cover={
                attraction.images && attraction.images.length > 0 ? (
                  <img alt={attraction.title} src={attraction.images[0]} className="h-[150px] object-cover" />
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
                    <Title level={5} className="m-0">{attraction.title}</Title>
                    <AttractionStatusTag status={attraction.status as AttractionStatusEnum} />
                  </div>
                }
                description={
                  <>
                    <Text ellipsis className="mt-2 block text-sm">
                      {attraction.description}
                    </Text>
                    <div></div>
                    <Button 
                      type="link" 
                      onClick={() => handleViewDetails(attraction.id)} 
                      className="p-0 mt-2 text-sm self-start"
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

export default AttractionsTab;