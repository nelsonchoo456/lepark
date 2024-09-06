import { LogoText } from '@lepark/common-ui';
import { Card, Descriptions, Divider } from 'antd';

const AboutTab = ({ occurence }: any) => {
  const descriptionsItems = Object.entries(occurence).map(([key, val]) => ({
    key,
    label: key,
    children: 'keke',
  }));
  return (
    <div className="flex gap-4">
      <Card className="flex-1 p-4 cursor-pointer hover:bg-green-50 transition-3s" styles={{ body: { padding: 0 } }}>
        <div className="flex gap-4">
          <div
            style={{
              backgroundImage: `url('https://www.travelbreatherepeat.com/wp-content/uploads/2020/03/Singapore_Orchids_Purple.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'white',
              overflow: 'hidden',
            }}
            className="h-20 w-20 rounded-full shadow-lg p-4"
          />
          <div className="w-64">
            <div className='text-lg font-bold'>Species</div>
            <LogoText>Orchid</LogoText>
          </div>
        </div>
      </Card>
      <Card className="flex-1" styles={{ body: { padding: 0 } }}></Card>
    </div>
  );
};

export default AboutTab;
