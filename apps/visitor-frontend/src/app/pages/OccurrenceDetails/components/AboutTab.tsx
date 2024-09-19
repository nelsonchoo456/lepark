import { LogoText } from '@lepark/common-ui';
import { Card, Col, Descriptions, Divider, Row, Space } from 'antd';

const AboutTab = ({ occurrence }: any) => {
  const descriptionsItems = Object.entries(occurrence).map(([key, val]) => ({
    key,
    label: key,
    children: 'keke',
  }));
  return (
    <div>
      <Space size={20} align="start">
        <div
          style={{
            backgroundImage: `url('https://www.travelbreatherepeat.com/wp-content/uploads/2020/03/Singapore_Orchids_Purple.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            overflow: 'hidden',
          }}
          className="h-16 w-16 md:h-36 md:w-36 rounded-full shadow-lg p-4"
        />
        <div className="md:w-auto">
          <div className="text-lg font-bold">Species</div>
          <LogoText>Orchid</LogoText>
          <Divider/>
          <div>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</div>
        </div>
      </Space>
     
    </div>
  );
};

export default AboutTab;
