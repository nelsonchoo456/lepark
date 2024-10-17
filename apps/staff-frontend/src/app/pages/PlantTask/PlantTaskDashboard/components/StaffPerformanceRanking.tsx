import React from 'react';
import { Card, Typography, Row, Col } from 'antd';
import { StaffResponse } from '@lepark/data-access';
import { TrophyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;

interface StaffPerformanceRankingProps {
  bestPerformer: StaffResponse | null;
  secondBestPerformer: StaffResponse | null;
  thirdBestPerformer: StaffResponse | null;
  message?: string;
}

const StaffPerformanceRanking: React.FC<StaffPerformanceRankingProps> = ({ bestPerformer, secondBestPerformer, thirdBestPerformer, message }) => {
  const currentMonth = moment().format('MMMM YYYY');

  const renderTitle = () => (
    <Title level={4} className="mb-4">
      Staff Performance Ranking for {currentMonth}
    </Title>
  );

  if (message) {
    return (
      <Card className="mb-4">
        {renderTitle()}
        <div className="flex items-center justify-center">
          <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginRight: '8px' }} />
          <Text strong>{message}</Text>
        </div>
      </Card>
    );
  }

  const renderPerformer = (staff: StaffResponse | null, place: number) => (
    <Col span={8}>
      <Card className={`bg-${place === 1 ? 'yellow' : place === 2 ? 'gray' : 'orange'}-50`}>
        <div className="flex items-center">
          <TrophyOutlined style={{ fontSize: '24px', color: place === 1 ? '#ffd700' : place === 2 ? '#c0c0c0' : '#cd7f32', marginRight: '8px' }} />
          <div>
            <Title level={5} className="mb-0">{place === 1 ? '1st' : place === 2 ? '2nd' : '3rd'} Place</Title>
            <Text strong>{staff?.firstName} {staff?.lastName}</Text>
            <br />
            <Text type="secondary">{staff?.role}</Text>
          </div>
        </div>
      </Card>
    </Col>
  );

  return (
    <Card className="mb-4">
      {renderTitle()}
      <Row gutter={16}>
        {renderPerformer(bestPerformer, 1)}
        {renderPerformer(secondBestPerformer, 2)}
        {renderPerformer(thirdBestPerformer, 3)}
      </Row>
    </Card>
  );
};

export default StaffPerformanceRanking;
