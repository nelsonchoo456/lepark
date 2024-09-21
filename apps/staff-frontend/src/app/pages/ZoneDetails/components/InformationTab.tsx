import { ZoneResponse } from '@lepark/data-access';
import { Descriptions, Divider, Tag, Typography } from 'antd';
import ZoneStatusTag from './ZoneStatusTag';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

interface InformationTabProps {
  zone: ZoneResponse;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const InformationTab = ({ zone }: InformationTabProps) => {
  const [openingHours, setOpeningHours] = useState<string[]>();
  const [closingHours, setClosingHours] = useState<string[]>();

  useEffect(() => {
    const openingHours = zone?.openingHours.map((hour: string) => (hour ? dayjs(hour).format('hh:mm A') : null));
    const closingHours = zone?.closingHours.map((hour: string) => (hour ? dayjs(hour).format('hh:mm A') : null));

    setOpeningHours(openingHours);
    setClosingHours(closingHours);
  }, [zone]);

  const detailsItems = [
    {
      key: 'name',
      label: 'Name',
      children: zone?.name,
    },
    {
      key: 'zoneStatus',
      label: 'Status',
      children: <ZoneStatusTag>{zone?.zoneStatus}</ZoneStatusTag>,
    },
    {
      key: 'description',
      label: 'Description',
      children: <Typography.Paragraph>{zone?.description}</Typography.Paragraph>,
    },
    {
      key: 'parkName',
      label: 'Park Name',
      children: zone?.parkName,
    },
    {
      key: 'parkId',
      label: 'Park ID',
      children: zone?.parkId,
    },
  ];

  return (
    <div>
      <Divider orientation="left">Zone Details</Divider>
      <Descriptions key="details" items={detailsItems} column={1} bordered labelStyle={{ width: "15vw"}} contentStyle={{ fontWeight: "500" }}/>
      <Divider orientation="left">Zone Hours</Divider>
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