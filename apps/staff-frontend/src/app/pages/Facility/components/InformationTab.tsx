import React, { useEffect, useState } from 'react';
import { Descriptions, Divider, Tag } from 'antd';
import { FacilityResponse } from '@lepark/data-access';
import moment from 'moment';
import dayjs from 'dayjs';

interface InformationTabProps {
  facility: FacilityResponse;
}

const InformationTab: React.FC<InformationTabProps> = ({ facility }) => {
  const [openingHours, setOpeningHours] = useState<string[]>();
  const [closingHours, setClosingHours] = useState<string[]>();

  useEffect(() => {
    const openingHours = facility?.openingHours
      .map((hour: string) => (hour ? dayjs(hour).format('hh:mm A') : null))
      .filter((hour): hour is string => hour !== null);
    const closingHours = facility?.closingHours
      .map((hour: string) => (hour ? dayjs(hour).format('hh:mm A') : null))
      .filter((hour): hour is string => hour !== null);

    setOpeningHours(openingHours);
    setClosingHours(closingHours);
  }, [facility]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const descriptionsItems = [
    { key: 'description', label: 'Description', children: facility.description },
    {
      key: 'reservationPolicy',
      label: 'Reservation Policy',
      children: facility.reservationPolicy === 'NIL' ? '-' : facility.reservationPolicy,
    },
    { key: 'rulesAndRegulations', label: 'Rules And Regulations', children: facility.rulesAndRegulations },
    { key: 'lastMaintenanceDate', label: 'Last Maintenance Date	', children: moment(facility.lastMaintenanceDate).format('MMMM D, YYYY') },
    { key: 'size', label: 'Size', children: facility?.size ? `${facility.size} m²` : '-' },
    { key: 'capacity', label: 'Capacity', children: facility?.capacity ? `${facility.capacity} pax` : '-' },
    { key: 'fee', label: 'Fee', children: facility?.fee ? `$${facility.fee}` : '-' },
    { key: 'lat', label: 'Latitude', children: facility.lat },
    { key: 'long', label: 'Longitude', children: facility.long },
  ];

  return (
    <div>
      <Divider orientation="left">Facility Details</Divider>
      <Descriptions
        items={descriptionsItems}
        bordered
        column={1}
        size="middle"
        labelStyle={{ width: '40%' }}
        contentStyle={{ width: '60%' }}
      />
      <Divider orientation="left">Facility Hours</Divider>
      <Descriptions bordered column={1} labelStyle={{ width: '15vw' }} contentStyle={{ fontWeight: '500' }}>
        {openingHours &&
          closingHours &&
          daysOfWeek.map((day, index) => (
            <Descriptions.Item label={day} key={index} labelStyle={{ width: '15vw' }}>
              <Tag bordered={false}>{openingHours[index]}</Tag> - <Tag bordered={false}>{closingHours[index]}</Tag>
            </Descriptions.Item>
          ))}
      </Descriptions>
    </div>
  );
};

export default InformationTab;
