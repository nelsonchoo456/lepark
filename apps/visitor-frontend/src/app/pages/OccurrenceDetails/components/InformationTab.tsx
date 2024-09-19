import { Descriptions } from 'antd';

const InformationTab = ({ occurrence }: any) => {
  const descriptionsItems = Object.entries(occurrence).map(([key, val]) => ({
    key,
    label: key,
    children: <div className='w-96'>'keke'</div>,
  }));
  return (
    <div>
      <Descriptions items={descriptionsItems} bordered column={1} size="middle" />
    </div>
  );
};

export default InformationTab;
