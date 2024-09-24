import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Tag, Typography } from 'antd';
import { FacilityResponse } from '@lepark/data-access';
import moment from 'moment';
import dayjs from 'dayjs';

const { Text } = Typography;

interface FacilityInfoCardProps {
  facility: FacilityResponse | null;
}

const FacilityInfoCard: React.FC<FacilityInfoCardProps> = ({ facility }) => {
  if (!facility) return null;

  const [openingHours, setOpeningHours] = useState<string[]>([]);
  const [closingHours, setClosingHours] = useState<string[]>([]);

  const formatTime = (time: string) => moment(time).format('h:mm A');

  useEffect(() => {
    const formattedOpeningHours = facility.openingHours.map((hour: string) => (hour ? dayjs(hour).format('hh:mm A') : null));
    const formattedClosingHours = facility.closingHours.map((hour: string) => (hour ? dayjs(hour).format('hh:mm A') : null));

    setOpeningHours(formattedOpeningHours.filter(Boolean) as string[]);
    setClosingHours(formattedClosingHours.filter(Boolean) as string[]);
  }, [facility]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <Card title="Facility Information" style={{ marginTop: '20px' }}>
      <Descriptions column={1} style={{ marginBottom: '16px' }}>
        <Descriptions.Item label="Name">
          {facility.facilityName}
          <Tag 
            color={facility.facilityStatus === 'OPEN' ? 'green' : 'red'} 
            style={{ marginLeft: '8px' }}
          >
            {facility.facilityStatus}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Description">{facility.facilityDescription}</Descriptions.Item>
      </Descriptions>
      <Descriptions column={2} style={{ marginBottom: '16px' }}>
        <Descriptions.Item label="Capacity">{facility.capacity}</Descriptions.Item>
        <Descriptions.Item label="Size">{facility.size} sqm</Descriptions.Item>
      </Descriptions>
      <Descriptions title={<span style={{ fontWeight: 'normal' }}>Operating Hours</span>} column={1} style={{ marginTop: '20px' }}>
        {daysOfWeek.map((day, index) => (
          <Descriptions.Item label={day} key={index}>
            {openingHours[index] && closingHours[index] ? (
              <>
                <Tag bordered={false}>{openingHours[index]}</Tag> - <Tag bordered={false}>{closingHours[index]}</Tag>
              </>
            ) : (
              <Text type="secondary">Closed</Text>
            )}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </Card>
  );
};

export default FacilityInfoCard;