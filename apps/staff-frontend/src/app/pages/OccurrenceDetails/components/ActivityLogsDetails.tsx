import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Image, Typography, Space, Tag } from 'antd';
import { ContentWrapperDark } from '@lepark/common-ui';
import PageHeader from '../../../components/main/PageHeader';
import moment from 'moment';

const { Title } = Typography;

interface ActivityLogDetail {
  id: string;
  occurrenceName: string;
  name: string;
  description: string;
  dateCreated: string;
  images: string[];
  activityLogType: string;
}

const ActivityLogDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activityLog, setActivityLog] = useState<ActivityLogDetail | null>(null);

  useEffect(() => {
    // Fetch activity log details
    // Replace this with your actual API call
    const fetchActivityLogDetails = async () => {
      // const response = await fetch(`/api/activity-log/${id}`);
      // const data = await response.json();
      // setActivityLog(data);

      // Mocked data for demonstration
      setActivityLog({
        id: id || '',
        occurrenceName: 'Sample Occurrence',
        name: 'Sample Activity Log',
        description: 'This is a sample activity log description.',
        dateCreated: '2023-04-15T10:30:00Z',
        images: [
          'https://www.travelbreatherepeat.com/wp-content/uploads/2020/03/Singapore_Orchids_Purple.jpg',
          'https://media.istockphoto.com/id/1369976302/photo/beautiful-purple-orchid-phalaenopsis-flower-background.jpg?s=1024x1024&w=is&k=20&c=tjYJgwcVPRZ6uDvI9_dq7K4IT8nxGibQFkLwQ5u56Xg=',
        ],
        activityLogType: 'Observation',
      });
    };

    fetchActivityLogDetails();
  }, [id]);

  if (!activityLog) {
    return <div>Loading...</div>;
  }

  return (
    <ContentWrapperDark>
      <PageHeader>Activity Log Details</PageHeader>
      <Card>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="ID">{activityLog.id}</Descriptions.Item>
          <Descriptions.Item label="Occurrence Name">{activityLog.occurrenceName}</Descriptions.Item>
          <Descriptions.Item label="Name">{activityLog.name}</Descriptions.Item>
          <Descriptions.Item label="Description">{activityLog.description}</Descriptions.Item>
          <Descriptions.Item label="Date Created">{moment(activityLog.dateCreated).format('D MMM YY, HH:mm')}</Descriptions.Item>
          <Descriptions.Item label="Activity Type">
            <Tag>{activityLog.activityLogType}</Tag>
          </Descriptions.Item>
        </Descriptions>

        <Title level={4} className="mt-4 mb-2">
          Images
        </Title>
        <Space size="large" wrap>
          {activityLog.images.map((image, index) => (
            <Image key={index} width={200} src={image} />
          ))}
        </Space>
      </Card>
    </ContentWrapperDark>
  );
};

export default ActivityLogDetails;
