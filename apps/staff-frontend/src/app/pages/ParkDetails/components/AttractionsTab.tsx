import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Button, Empty, Col, Row } from 'antd';
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
        <Button type="link" icon={<FiExternalLink />} onClick={handleViewAllAttractions}>
          View All Attractions
        </Button>
      </div>
      <Row gutter={[16, 16]}>
        {attractions.map((attraction) => (
          <Col xs={24} sm={12} md={8} key={attraction.id}>
            <Card
              hoverable
              className="w-full h-full"
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
                <div className="flex flex-col">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <Title level={5} className="m-0 break-words" style={{ maxWidth: '100%' }}>
                      {attraction.title}
                    </Title>
                    <AttractionStatusTag status={attraction.status as AttractionStatusEnum} />
                  </div>
                </div>
              }
                description={
                  <>
                    <Text ellipsis className="mt-2 block text-sm">
                      {attraction.description}
                    </Text>
                    <div className="mt-2"/>
                    <Button type="link" onClick={() => handleViewDetails(attraction.id)} className="p-0 mt-2 text-sm">
                      View Details
                    </Button>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default AttractionsTab;
