import { EventResponse, EventStatusEnum, EventSuitabilityEnum, EventTypeEnum, FacilityResponse, ParkResponse } from '@lepark/data-access';
import { Descriptions, Divider, Tag, Typography } from 'antd';
import EventStatusTag from './EventStatusTag';
import dayjs from 'dayjs';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

interface InformationTabProps {
  event: EventResponse;
  facility: FacilityResponse;
  park: ParkResponse;
}

const InformationTab = ({ event, facility, park }: InformationTabProps) => {
  const eventType = [
    { value: EventTypeEnum.WORKSHOP, label: formatEnumLabelToRemoveUnderscores(EventTypeEnum.WORKSHOP) },
    { value: EventTypeEnum.COMPETITION, label: formatEnumLabelToRemoveUnderscores(EventTypeEnum.COMPETITION) },
    { value: EventTypeEnum.FESTIVAL, label: formatEnumLabelToRemoveUnderscores(EventTypeEnum.FESTIVAL) },
    { value: EventTypeEnum.CONFERENCE, label: formatEnumLabelToRemoveUnderscores(EventTypeEnum.CONFERENCE) },
    { value: EventTypeEnum.EXHIBITION, label: formatEnumLabelToRemoveUnderscores(EventTypeEnum.EXHIBITION) },
    { value: EventTypeEnum.GUIDED_TOUR, label: formatEnumLabelToRemoveUnderscores(EventTypeEnum.GUIDED_TOUR) },
    { value: EventTypeEnum.PERFORMANCE, label: formatEnumLabelToRemoveUnderscores(EventTypeEnum.PERFORMANCE) },
    { value: EventTypeEnum.TALK, label: formatEnumLabelToRemoveUnderscores(EventTypeEnum.TALK) },
  ];

  const eventSuitability = [
    { value: EventSuitabilityEnum.ANYONE, label: formatEnumLabelToRemoveUnderscores(EventSuitabilityEnum.ANYONE) },
    { value: EventSuitabilityEnum.CHILDREN, label: formatEnumLabelToRemoveUnderscores(EventSuitabilityEnum.CHILDREN) },
    { value: EventSuitabilityEnum.FAMILIES_AND_FRIENDS, label: formatEnumLabelToRemoveUnderscores(EventSuitabilityEnum.FAMILIES_AND_FRIENDS) },
    { value: EventSuitabilityEnum.FITNESS_ENTHUSIASTS, label: formatEnumLabelToRemoveUnderscores(EventSuitabilityEnum.FITNESS_ENTHUSIASTS) },
    { value: EventSuitabilityEnum.NATURE_ENTHUSIASTS, label: formatEnumLabelToRemoveUnderscores(EventSuitabilityEnum.NATURE_ENTHUSIASTS) },
    { value: EventSuitabilityEnum.PETS, label: formatEnumLabelToRemoveUnderscores(EventSuitabilityEnum.PETS) },
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
      <Descriptions key="time" items={timeItems} column={1} bordered labelStyle={{ width: '15vw' }} contentStyle={{ fontWeight: '500' }} />
    </div>
  );
};

export default InformationTab;
