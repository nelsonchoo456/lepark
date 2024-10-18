import { LogoText } from '@lepark/common-ui';
import { AttractionResponse, AttractionStatusEnum, ParkResponse } from '@lepark/data-access';
import { Button, Card, Descriptions, Divider, List, Tag, Typography } from 'antd';
import AttractionStatusTag from './AttractionStatusTag';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { FiMap, FiMapPin } from 'react-icons/fi';
const { Text } = Typography;

interface InformationTabProps {
  attraction: AttractionResponse;
  park: ParkResponse;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const InformationTab = ({ attraction, park }: InformationTabProps) => {
  const [openingHours, setOpeningHours] = useState<string[]>();
  const [closingHours, setClosingHours] = useState<string[]>();

  useEffect(() => {
    const openingHours = attraction?.openingHours.map((hour: string) => (hour ? dayjs(hour).format('hh:mm A') : null));
    const closingHours = attraction?.closingHours.map((hour: string) => (hour ? dayjs(hour).format('hh:mm A') : null));

    setOpeningHours(openingHours);
    setClosingHours(closingHours);
  }, [attraction]);

  const detailsItems = [
    {
      key: 'title',
      label: 'Title',
      children: attraction?.title,
    },
    {
      key: 'status',
      label: 'Status',
      children: <AttractionStatusTag status={attraction?.status as AttractionStatusEnum} />,
    },
    {
      key: 'description',
      label: 'Description',
      children: <Typography.Paragraph>{attraction?.description}</Typography.Paragraph>,
    },
    {
      key: 'ticketingPolicy',
      label: 'Ticketing Policy',
      children: <Typography.Paragraph>{attraction?.ticketingPolicy}</Typography.Paragraph>,
    },
  ];

  const locationItems = [
    {
      key: 'park',
      label: 'Park',
      children: park?.name, 
    },
  ];

  return (
    <div>
      <Divider orientation="left">Attraction Details</Divider>
      <Descriptions key="details" items={detailsItems} column={1} bordered labelStyle={{ width: "15vw"}}/>
      <Divider orientation="left">Attraction Location</Divider>
      <Descriptions key="location" items={locationItems} column={1} bordered labelStyle={{ width: "15vw"}}/>
      <Divider orientation="left">Attraction Hours</Divider>
      <Descriptions bordered column={1} labelStyle={{ width: "15vw" }} contentStyle={{ fontWeight: "500" }}>
        {openingHours &&
          closingHours &&
          daysOfWeek.map((day, index) => (
            <Descriptions.Item label={day} key={index} labelStyle={{ width: "15vw"}}>
              <Tag bordered={false}>{openingHours[index]}</Tag> - <Tag bordered={false}>{closingHours[index]}</Tag>
            </Descriptions.Item>
          ))}
      </Descriptions>
    </div>
  );
};

export default InformationTab;