import { HubResponse, SensorResponse } from "@lepark/data-access";
import { formatEnumLabelToRemoveUnderscores } from "@lepark/data-utility";
import { Tag } from "antd";

export const getHubDescriptionsItems = (hub: HubResponse) => [
  {
    key: 'identifierNumber',
    label: 'Identifier Number',
    children: hub?.identifierNumber,
  },
  {
    key: 'hubStatus',
    label: 'Hub Status',
    children: (() => {
      const formattedStatus = formatEnumLabelToRemoveUnderscores(hub?.hubStatus ?? '');
      switch (hub?.hubStatus) {
        case 'ACTIVE':
          return (
            <Tag color="green" bordered={false}>
              {formattedStatus}
            </Tag>
          );
        case 'INACTIVE':
          return (
            <Tag color="blue" bordered={false}>
              {formattedStatus}
            </Tag>
          );
        case 'UNDER_MAINTENANCE':
          return (
            <Tag color="yellow" bordered={false}>
              {formattedStatus}
            </Tag>
          );
        case 'DECOMMISSIONED':
          return (
            <Tag color="red" bordered={false}>
              {formattedStatus}
            </Tag>
          );
        default:
          return <Tag>{formattedStatus}</Tag>;
      }
    })(),
  },
  ...(hub?.zone
    ? [
        {
          key: 'zone',
          label: 'Zone Location',
          children: hub?.zone?.name,
        },
      ]
    : []
  )
];

export const getSensorDescriptionItems = (sensor: SensorResponse) => [
  {
    key: 'identifierNumber',
    label: 'Identifier Number',
    children: sensor?.identifierNumber,
  },
  {
    key: 'sensorStatus',
    label: 'Sensor Status',
    children: (() => {
      switch (sensor?.sensorStatus) {
        case 'ACTIVE':
          return (
            <Tag color="green" bordered={false}>
              {formatEnumLabelToRemoveUnderscores(sensor.sensorStatus)}
            </Tag>
          );
        case 'INACTIVE':
          return (
            <Tag color="blue" bordered={false}>
              {formatEnumLabelToRemoveUnderscores(sensor.sensorStatus)}
            </Tag>
          );
        case 'UNDER_MAINTENANCE':
          return (
            <Tag color="orange" bordered={false}>
              {formatEnumLabelToRemoveUnderscores(sensor.sensorStatus)}
            </Tag>
          );
        case 'DECOMMISSIONED':
          return (
            <Tag color="red" bordered={false}>
              {formatEnumLabelToRemoveUnderscores(sensor.sensorStatus)}
            </Tag>
          );
        default:
          return <Tag>{formatEnumLabelToRemoveUnderscores(sensor?.sensorStatus ?? '')}</Tag>;
      }
    })(),
  },
  { key: 'sensorType', label: 'Sensor Type', children: formatEnumLabelToRemoveUnderscores(sensor?.sensorType ?? '') },
]