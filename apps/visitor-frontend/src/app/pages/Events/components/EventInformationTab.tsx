import { Descriptions, Tag } from 'antd';
import { EventResponse, EventStatusEnum, EventTypeEnum, EventSuitabilityEnum } from '@lepark/data-access';
import moment from 'moment';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const EventInformationTab = ({ event }: { event: EventResponse }) => {
  const formatValue = (key: string, value: any) => {
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) {
      return Array.isArray(value)
        ? value.map((v) => moment(v).format('MMMM D, YYYY, h:mm A')).join(', ')
        : moment(value).format('MMMM D, YYYY, h:mm A');
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    if (typeof value === 'boolean') {
      return value ? <AiOutlineCheck className="text-green-500" /> : <AiOutlineClose className="text-red-500" />;
    }
    return value;
  };

  const excludeKeys = [
    'id',
    'images',
    'description',
    'title',
    'facilityId',
    'status',
    'endTime',
    'startTime',
  ];

  const descriptionsItems = Object.entries(event)
    .filter(([key]) => !excludeKeys.includes(key))
    .map(([key, value]) => ({
      key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()), // Convert camelCase to Title Case
      children: formatValue(key, value),
    }));

  return (
    <div>
      <Descriptions
        items={[
          ...descriptionsItems,
          {
            key: 'status',
            label: 'Event Status',
            children: (() => {
              switch (event?.status) {
                case EventStatusEnum.ONGOING:
                  return (
                    <Tag color="green" bordered={false}>
                      {formatEnumLabelToRemoveUnderscores(event?.status)}
                    </Tag>
                  );
                case EventStatusEnum.UPCOMING:
                  return (
                    <Tag color="blue" bordered={false}>
                      {formatEnumLabelToRemoveUnderscores(event?.status)}
                    </Tag>
                  );
                case EventStatusEnum.COMPLETED:
                  return (
                    <Tag color="gray" bordered={false}>
                      {formatEnumLabelToRemoveUnderscores(event?.status)}
                    </Tag>
                  );
                case EventStatusEnum.CANCELLED:
                  return (
                    <Tag color="red" bordered={false}>
                      {formatEnumLabelToRemoveUnderscores(event?.status)}
                    </Tag>
                  );
                default:
                  return <Tag>{event?.status}</Tag>;
              }
            })(),
          },
        ]}
        bordered
        column={1}
        size="middle"
        labelStyle={{ width: '40%' }} // Adjust the width of the label column
        contentStyle={{ width: '60%' }} // Adjust the width of the content column
      />
    </div>
  );
};

export default EventInformationTab;