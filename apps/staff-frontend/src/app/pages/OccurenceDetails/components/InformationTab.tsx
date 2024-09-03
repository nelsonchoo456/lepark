import { Descriptions } from 'antd';

const InformationTab = ({ occurence }: any) => {
  const descriptionsItems = Object.entries(occurence).map(([key, val]) => ({
    key,
    label: key,
    children: 'keke',
  }));
  return (
    <div>
      <Descriptions items={descriptionsItems} bordered column={1} />
    </div>
  );
};

export default InformationTab;
