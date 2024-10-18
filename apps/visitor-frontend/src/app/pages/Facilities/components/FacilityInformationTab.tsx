import { Descriptions, Tag } from 'antd';
import { FacilityResponse, FacilityStatusEnum } from '@lepark/data-access';
import moment from 'moment';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const FacilityInformationTab = ({ facility }: { facility: FacilityResponse }) => {
  const formatValue = (key: string, value: any) => {
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('hours')) {
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
    'openingHours',
    'closingHours',
    'parkId',
    'lat',
    'long',
    'facilityStatus',
    'lastMaintenanceDate',
    'description',
    'isPublic',
    'name',
    'rulesAndRegulations',
    'isBookable',
    'facilityType',
  ]; // Add keys you want to exclude

  const descriptionsItems = Object.entries(facility)
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
            key: 'facilityStatus',
            label: 'Facility Status',
            children: (() => {
              switch (facility?.facilityStatus) {
                case FacilityStatusEnum.OPEN:
                  return (
                    <Tag color="green" bordered={false}>
                      {formatEnumLabelToRemoveUnderscores(facility?.facilityStatus)}
                    </Tag>
                  );
                case FacilityStatusEnum.UNDER_MAINTENANCE:
                  return (
                    <Tag color="yellow" bordered={false}>
                      {formatEnumLabelToRemoveUnderscores(facility?.facilityStatus)}
                    </Tag>
                  );
                case FacilityStatusEnum.CLOSED:
                  return (
                    <Tag color="red" bordered={false}>
                      {formatEnumLabelToRemoveUnderscores(facility?.facilityStatus)}
                    </Tag>
                  );
                default:
                  return <Tag>{facility?.facilityStatus}</Tag>;
              }
            })(),
          },
          {
            key: 'facilityType',
            label: 'Facility Type',
            children: (
              <Tag color="blue" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(facility?.facilityType)}
              </Tag>
            ),
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

export default FacilityInformationTab;
