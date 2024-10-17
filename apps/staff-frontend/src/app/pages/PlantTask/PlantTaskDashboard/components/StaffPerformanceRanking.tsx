import React from 'react';
import { Card, Typography, Row, Col } from 'antd';
import { StaffResponse } from '@lepark/data-access';
import { TrophyOutlined, FrownOutlined, CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;

interface StaffPerformanceRankingProps {
  bestPerformer: StaffResponse | null;
  worstPerformer: StaffResponse | null;
  message?: string;
}

const StaffPerformanceRanking: React.FC<StaffPerformanceRankingProps> = ({ bestPerformer, worstPerformer, message }) => {
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

  return (
    <Card className="mb-4">
      {renderTitle()}
      <Row gutter={16}>
        <Col span={12}>
          <Card className="bg-green-50">
            <div className="flex items-center">
              <TrophyOutlined style={{ fontSize: '24px', color: '#52c41a', marginRight: '8px' }} />
              <div>
                <Title level={5} className="mb-0">Best Performer</Title>
                <Text strong>{bestPerformer?.firstName} {bestPerformer?.lastName}</Text>
                <br />
                <Text type="secondary">{bestPerformer?.role}</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card className="bg-red-50">
            <div className="flex items-center">
              <FrownOutlined style={{ fontSize: '24px', color: '#ff4d4f', marginRight: '8px' }} />
              <div>
                <Title level={5} className="mb-0">Needs Improvement</Title>
                <Text strong>{worstPerformer?.firstName} {worstPerformer?.lastName}</Text>
                <br />
                <Text type="secondary">{worstPerformer?.role}</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default StaffPerformanceRanking;
