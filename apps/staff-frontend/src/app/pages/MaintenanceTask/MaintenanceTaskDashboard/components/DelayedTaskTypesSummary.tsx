import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin, Row, Col } from 'antd';
import { getParkMaintenanceTaskDelayedTaskTypesForPeriod, StaffResponse, DelayedTaskTypeData } from '@lepark/data-access';
import { useAuth } from '@lepark/common-ui';
import dayjs from 'dayjs';
import { WarningOutlined } from '@ant-design/icons';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const { Title, Text } = Typography;

const DelayedTaskTypesSummary: React.FC = () => {
  const { user } = useAuth<StaffResponse>();
  const [delayedTaskTypes, setDelayedTaskTypes] = useState<DelayedTaskTypeData[]>([]);
  const [startDate, setStartDate] = useState<string>(dayjs().startOf('month').toISOString());
  const [endDate, setEndDate] = useState<string>(dayjs().endOf('month').toISOString());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDelayedTaskTypes = async () => {
      try {
        const response = await getParkMaintenanceTaskDelayedTaskTypesForPeriod(
          user?.parkId || null,
          new Date(startDate),
          new Date(endDate),
        );
        setDelayedTaskTypes(response.data);
      } catch (error) {
        console.error('Error fetching delayed task types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDelayedTaskTypes();
  }, [user?.park?.id, startDate, endDate]);

  const renderTitle = () => (
    <Title level={4} className="mb-4">
      Delayed Task Types for {dayjs(startDate).format('MMM D')} - {dayjs(endDate).format('MMM D, YYYY')}
    </Title>
  );

  const renderDelayedTaskType = (taskType: DelayedTaskTypeData, index: number) => (
    <Col span={8} key={taskType.taskType}>
      <Card className={`bg-${index === 0 ? 'red' : index === 1 ? 'orange' : 'yellow'}-50`}>
        <div className="flex items-center">
          <WarningOutlined
            style={{ fontSize: '24px', color: index === 0 ? '#ff4d4f' : index === 1 ? '#ffa940' : '#fadb14', marginRight: '8px' }}
          />
          <div>
            <Title level={5} className="mb-0">
              #{index + 1} Delayed Task Type
            </Title>
            <Text strong>{formatEnumLabelToRemoveUnderscores(taskType.taskType)}</Text>
            <br />
            <Text type="secondary">Avg. Completion: {taskType.averageCompletionTime.toFixed(2)} hours</Text>
            <br />
            <Text type="secondary">Completed Tasks: {taskType.completedTaskCount}</Text>
            <br />
            <Text type="secondary">Overdue Tasks: {taskType.overdueTaskCount}</Text>
          </div>
        </div>
      </Card>
    </Col>
  );

  return (
    <Card className="mb-4">
      {renderTitle()}
      {loading ? (
        <div className="flex justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={16}>{delayedTaskTypes.slice(0, 3).map((taskType, index) => renderDelayedTaskType(taskType, index))}</Row>
      )}
    </Card>
  );
};

export default DelayedTaskTypesSummary;
