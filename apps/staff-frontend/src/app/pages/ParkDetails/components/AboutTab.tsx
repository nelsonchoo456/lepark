import { LogoText } from '@lepark/common-ui';
import { ParkResponse } from '@lepark/data-access';
import { Card, Descriptions, Divider, List, Tag, Typography } from 'antd';
import ParkStatusTag from './ParkStatusTag';
import { useEffect, useState } from 'react';
import moment from 'moment';
const { Text } = Typography;

interface AboutTabProps {
  park: ParkResponse;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AboutTab = ({ park }: AboutTabProps) => {
  const [openingHours, setOpeningHours] = useState<string[]>();
  const [closingHours, setClosingHours] = useState<string[]>();

  useEffect(() => {
    // console.log(park)
    // const openingHours = park?.openingHours.map((hour: string) => (hour ? moment(hour).utc().format('hh:mm a') : null));
    // const closingHours = park?.closingHours.map((hour: string) => (hour ? moment(hour).utc().format('hh:mm a') : null));
    const openingHours = park?.openingHours.map((hour: string) => (hour ? new Date(hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : null));
    const closingHours = park?.closingHours.map((hour: string) => (hour ? new Date(hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : null));

    setOpeningHours(openingHours);
    setClosingHours(closingHours);
  }, [park]);

  const detailsItems = [
    {
      key: 'name',
      label: 'Name',
      children: park?.name,
    },
    {
      key: 'parkStatus',
      label: 'Status',
      children: <ParkStatusTag>{park?.parkStatus}</ParkStatusTag>,
    },
    {
      key: 'description',
      label: 'Description',
      children: <Typography.Paragraph>{park?.description}</Typography.Paragraph>,
    },
  ];

  const contactsItems = [
    {
      key: 'address',
      label: 'Address',
      children: park?.address,
    },
    {
      key: 'contactNumber',
      label: 'Contact Number',
      children: park?.contactNumber,
    },
  ];

  const hoursItems = [
    {
      key: 'address',
      label: 'Address',
      children: park?.address,
    },
    {
      key: 'contactNumber',
      label: 'Contact Number',
      children: park?.contactNumber,
    },
  ];

  return (
    <div>
      <Divider orientation="left">Park Details</Divider>
      <Descriptions key="details" items={detailsItems} column={1} bordered />
      <Divider orientation="left">Contact</Divider>
      <Descriptions key="contact" items={contactsItems} column={1} bordered />
      <Divider orientation="left">Park Hours</Divider>
      <Descriptions bordered column={1}>
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

export default AboutTab;
