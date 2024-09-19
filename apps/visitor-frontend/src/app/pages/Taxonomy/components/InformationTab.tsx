import { Descriptions } from 'antd';
import { SpeciesResponse } from '@lepark/data-access';
import moment from 'moment';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';

const InformationTab = ({ species }: { species: SpeciesResponse }) => {
  const formatValue = (key: string, value: any) => {
    if (key.toLowerCase().includes('date')) {
      return moment(value).format('MMMM D, YYYY');
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
    'commonName',
    'speciesDescription',
    'conservationStatus',
    'lightType',
    'soilType',
    'images',
  ]; // Add keys you want to exclude

  const descriptionsItems = Object.entries(species)
    .filter(([key]) => !excludeKeys.includes(key))
    .map(([key, value]) => ({
      key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()), // Convert camelCase to Title Case
      children: formatValue(key, value),
    }));

  return (
    <div>
      <Descriptions
        items={descriptionsItems}
        bordered
        column={1}
        size="middle"
        labelStyle={{ width: '40%' }} // Adjust the width of the label column
        contentStyle={{ width: '60%' }} // Adjust the width of the content column
      />
    </div>
  );
};

export default InformationTab;
