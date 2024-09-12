import { Descriptions, Tag } from 'antd';
import { SpeciesResponse } from '@lepark/data-access';
import moment from 'moment';

const InformationTab = ({ species }: { species: SpeciesResponse }) => {
  const formatValue = (key: string, value: any) => {
    if (key.toLowerCase().includes('date')) {
      return moment(value).format('MMMM D, YYYY');
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    if (typeof value === 'boolean') {
      return renderBooleanTag(value);
    }
    return value;
  };

  const renderBooleanTag = (value: boolean) => {
    return value ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>;
  };

  const descriptionsItems = Object.entries(species).map(([key, value]) => ({
    key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), // Convert camelCase to Title Case
    children: formatValue(key, value),
  }));

  return (
    <div>
      <Descriptions items={descriptionsItems} bordered column={1} size="middle" />
    </div>
  );
};

export default InformationTab;
function formatValue(key: string, value: any): any {
  throw new Error('Function not implemented.');
}
