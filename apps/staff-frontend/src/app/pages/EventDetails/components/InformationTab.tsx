import { EventResponse, EventStatusEnum, EventSuitabilityEnum, EventTypeEnum, FacilityResponse, ParkResponse } from '@lepark/data-access';
import { Descriptions, Divider, Tag, Typography } from 'antd';
import EventStatusTag from './EventStatusTag';
import dayjs from 'dayjs';

interface InformationTabProps {
  event: EventResponse;
  facility: FacilityResponse;
  park: ParkResponse;
}

const InformationTab = ({ event, facility, park }: InformationTabProps) => {
  const eventType = [
    { value: EventTypeEnum.WORKSHOP, label: 'Workshop' },
    { value: EventTypeEnum.COMPETITION, label: 'Competition' },
    { value: EventTypeEnum.FESTIVAL, label: 'Festival' },
    { value: EventTypeEnum.CONFERENCE, label: 'Conference' },
    { value: EventTypeEnum.EXHIBITION, label: 'Exhibition' },
    { value: EventTypeEnum.GUIDED_TOUR, label: 'Guided Tour' },
    { value: EventTypeEnum.PERFORMANCE, label: 'Performance' },
    { value: EventTypeEnum.TALK, label: 'Talk' },
  ];

  const eventSuitability = [
    { value: EventSuitabilityEnum.ANYONE, label: 'Anyone' },
    { value: EventSuitabilityEnum.CHILDREN, label: 'Children' },
    { value: EventSuitabilityEnum.FAMILIES_AND_FRIENDS, label: 'Families and Friends' },
    { value: EventSuitabilityEnum.FITNESS_ENTHUSIASTS, label: 'Fitness Enthusiasts' },
    { value: EventSuitabilityEnum.NATURE_ENTHUSIASTS, label: 'Nature Enthusiasts' },
    { value: EventSuitabilityEnum.PETS, label: 'Pets' },
  ];

  const detailsItems = [
    {
      key: 'title',
      label: 'Title',
      children: event?.title,
    },
    {
      key: 'status',
      label: 'Status',
      children: <EventStatusTag status={event?.status as EventStatusEnum} />,
    },
    // {
    //   key: 'type',
    //   label: 'Type',
    //   children: eventType.find((type) => type.value === event?.type)?.label,
    // },
    {
      key: 'description',
      label: 'Description',
      children: <Typography.Paragraph>{event?.description}</Typography.Paragraph>,
    },
    // {
    //   key: 'suitability',
    //   label: 'Suitability',
    //   children: eventSuitability.find((suitability) => suitability.value === event?.suitability)?.label,
    // },
    {
      key: 'maxCapacity',
      label: 'Max Capacity',
      children: event?.maxCapacity,
    },
  ];

  const locationItems = [
    {
      key: 'facility',
      label: 'Facility',
      children: facility?.name,
    },
    {
      key: 'park',
      label: 'Park',
      children: park?.name,
    },
  ];

  const timeItems = [
    {
      key: 'date',
      label: 'Date',
      children: dayjs(event?.startDate).format('D MMMM YYYY') + ' - ' + dayjs(event?.endDate).format('D MMMM YYYY'),
    },
    {
      key: 'time',
      label: 'Time',
      children: (
        <>
          <Tag bordered={false}>{dayjs(event?.startDate).format('h:mm A')}</Tag>-{' '}
          <Tag bordered={false}>{dayjs(event?.endDate).format('h:mm A')}</Tag> daily
        </>
      ),
    },
  ];

  return (
    <div>
      <Divider orientation="left">Event Details</Divider>
      <Descriptions key="details" items={detailsItems} column={1} bordered labelStyle={{ width: '15vw' }} />
      <Divider orientation="left">Event Location</Divider>
      <Descriptions key="location" items={locationItems} column={1} bordered labelStyle={{ width: '15vw' }} />
      <Divider orientation="left">Event Time</Divider>
      <Descriptions key="time" items={timeItems} column={1} bordered labelStyle={{ width: '15vw' }} />
    </div>
  );
};

export default InformationTab;
