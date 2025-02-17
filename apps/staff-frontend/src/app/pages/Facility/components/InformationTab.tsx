import React, { useEffect, useState } from 'react';
import { Descriptions, Divider, Tag } from 'antd';
import { FacilityResponse } from '@lepark/data-access';
import moment from 'moment';
import dayjs from 'dayjs';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { FacilityStatusEnum, FacilityTypeEnum } from '@lepark/data-access';

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
      children: facility.reservationPolicy,
    },
    {
      key: 'rulesAndRegulations',
      label: 'Rules And Regulations',
      children: (
        <div
          dangerouslySetInnerHTML={{
            __html: facility.rulesAndRegulations
              .replace(/(\d+\.\s)/g, '<br />$1') // Add line breaks before each numbered rule
              .replace(/^(<br\s*\/?>)+/, ''), // Remove any leading <br> tags
          }}
        />
      ),
    },
    { key: 'size', label: 'Size', children: facility?.size ? `${facility.size} m²` : '-' },
    { key: 'capacity', label: 'Capacity', children: facility?.capacity ? `${facility.capacity} pax` : '-' },
    { key: 'fee', label: 'Fee', children: facility?.fee ? `$ ${facility.fee}` : '-' },
    { key: 'lat', label: 'Latitude', children: facility.lat },
    { key: 'long', label: 'Longitude', children: facility.long },
    { 
      key: 'facilityType', 
      label: 'Facility Type', 
      children: formatEnumLabelToRemoveUnderscores(facility.facilityType as FacilityTypeEnum) 
    },
    { 
      key: 'facilityStatus', 
      label: 'Facility Status', 
      children: (() => {
        switch (facility?.facilityStatus) {
          case FacilityStatusEnum.OPEN:
            return <Tag color="green" bordered={false}>{formatEnumLabelToRemoveUnderscores(facility?.facilityStatus)}</Tag>;
          case FacilityStatusEnum.UNDER_MAINTENANCE:
            return <Tag color="yellow" bordered={false}>{formatEnumLabelToRemoveUnderscores(facility?.facilityStatus)}</Tag>;
          case FacilityStatusEnum.CLOSED:
            return <Tag color="red" bordered={false}>{formatEnumLabelToRemoveUnderscores(facility?.facilityStatus)}</Tag>;
          default:
            return <Tag>{facility?.facilityStatus}</Tag>;
        }
      })(),
    },
  ];

  const filteredDescriptionsItems =
    !facility.isBookable || !facility.isPublic
      ? descriptionsItems.filter((item) => item.key !== 'reservationPolicy' && item.key !== 'fee')
      : descriptionsItems;

  return (
    <div>
      <Divider orientation="left">Facility Details</Divider>
      <Descriptions
        items={filteredDescriptionsItems}
        bordered
        column={1}
        labelStyle={{ width: '15vw' }} // Consistent width
      />
      <Divider orientation="left">Facility Hours</Divider>
      <Descriptions
        bordered
        column={1}
        labelStyle={{ width: '15vw' }} // Same width for labels
        contentStyle={{ fontWeight: '500' }} // Same font weight for content
      >
        {openingHours &&
          closingHours &&
          daysOfWeek.map((day, index) => (
            <Descriptions.Item label={day} key={index}>
              <Tag bordered={false}>{openingHours[index]}</Tag> - <Tag bordered={false}>{closingHours[index]}</Tag>
            </Descriptions.Item>
          ))}
      </Descriptions>
    </div>
  );
};

export default InformationTab;
