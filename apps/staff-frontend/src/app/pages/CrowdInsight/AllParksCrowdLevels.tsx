import React from 'react';
import { Card, Row, Col, Tag, Button, Spin, Tooltip } from 'antd';
import { ContentWrapperDark } from '@lepark/common-ui';
import PageHeader2 from '../../components/main/PageHeader2';
import { useNavigate } from 'react-router-dom';
import { useCrowdCounts } from '../../hooks/CrowdInsights/useCrowdCounts';

const AllParksCrowdLevels: React.FC = () => {
  const navigate = useNavigate();
  const { parks: parkCrowds, loading } = useCrowdCounts();

  const getTrafficTag = (count: number, threshold: number) => {
    const ratio = count / threshold;
    if (ratio > 1) {
      return <Tag color="error">High Traffic</Tag>;
    } else if (ratio > 0.7) {
      return <Tag color="warning">Moderate Traffic</Tag>;
    } else {
      return <Tag color="success">Low Traffic</Tag>;
    }
  };

  const breadcrumbItems = [
    {
      title: 'Crowd Insights',
      pathKey: '/crowdInsights',
      isMain: true,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card title="All Parks Crowd Levels">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Spin size="large" />
            <p className="mt-5">Loading crowd data...</p>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {parkCrowds.map((park) => (
              <Col xs={24} sm={12} md={8} key={park.parkId}>
                <Card
                  hoverable
                  className={`border-l-4 ${
                    park.isOverThreshold ? 'border-red-400' : 'border-green-200'
                  }`}
                  onClick={() =>
                    navigate('/crowdInsights', {
                      state: { selectedParkId: park.parkId },
                    })
                  }
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="text-base font-medium">{park.parkName}</div>
                    <Tooltip title={`Threshold: ${park.threshold}`}>
                      {getTrafficTag(park.liveCount, park.threshold)}
                    </Tooltip>
                  </div>
                  <div className={`text-2xl font-bold mt-2 ${
                    park.isOverThreshold ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {park.liveCount}
                  </div>
                  <Button
                    type="link"
                    className="p-0 mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/crowdInsights', {
                        state: { selectedParkId: park.parkId },
                      });
                    }}
                  >
                    View Details →
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default AllParksCrowdLevels;