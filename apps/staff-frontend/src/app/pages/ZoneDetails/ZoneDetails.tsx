import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import PageHeader from '../../components/main/PageHeader';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { Button, Card, Descriptions, Empty, Flex, Space, Tabs, Tag, Typography } from 'antd';
import { getParkById, getZoneById, ParkResponse, ZoneResponse } from '@lepark/data-access';
import { FiSun } from 'react-icons/fi';
import AboutTab from './components/AboutTab';
import ParkStatusTag from './components/ParkStatusTag';
import { RiEdit2Line } from 'react-icons/ri';
const { Text } = Typography;

const ParkDetails = () => {
  const [park, setPark] = useState<ZoneResponse>();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const parkRes = await getZoneById(parseInt(id));
        if (parkRes.status === 200) {
          setPark(parkRes.data);
        }
      } catch (error) {
        //
      }
    }
    fetchData();
  }, [id])

  // Tabs Utility
  const tabsItems = [
    {
      key: 'about',
      label: 'Information',
      // children: park ? <AboutTab park={park} /> : <></>, 
    },
    {
      key: 'occurrences',
      label: 'Occurrences',
      // children: <ActivityLogs occurrenceId={occurrences[0].id} activityLogs={occurrences[0].activityLogs} />,
      children: <Empty description={"Attractions Coming Soon"}></Empty>
    },
 
  ];

  return (
    <ContentWrapperDark>
      <PageHeader>Zone Management</PageHeader>
      <Card>
        {/* <Card className='mb-4 bg-white' styles={{ body: { padding: 0 }}} bordered={false}> */}
        <div className="md:flex w-full gap-4">
          <div
            style={{
              backgroundImage: `url('https://images.squarespace-cdn.com/content/v1/5b008764710699f45ff1e509/1596530511574-RBL8EAUPS22DY2OKWN5Q/HD.Singapore_Bishan+Park_c+Dreiseitl_109+.jpg?format=2500w')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'white',
              overflow: 'hidden',
            }}
            className="h-64 flex-1 rounded-lg shadow-lg p-4"
          />
          <div className="flex-1 flex-col flex">
            <div className='w-full flex justify-between items-center'>
              <Space>
                <LogoText className="text-2xl py-2 m-0">{park?.name}</LogoText>
                <ParkStatusTag>
                  {park?.zoneStatus}
                </ParkStatusTag>
              </Space>
              <Button icon={<RiEdit2Line className="text-lg ml-auto mr-0 r-0" />} type="text" onClick={() => navigate(`/zone/${park?.id}/edit`)}/>
            </div>
            <Typography.Paragraph
              ellipsis={{
                rows: 3,
              }}
            >
              {park?.description}
            </Typography.Paragraph>
            {/* <Descriptions items={descriptionsItems} column={1} size="small"/> */}
          </div>
        </div>

        <Tabs
          centered
          defaultActiveKey="about"
          items={tabsItems}
          renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="border-b-[1px] border-gray-400" />}
          className="mt-4"
        />
      </Card>
    </ContentWrapperDark>
  );
}

export default ParkDetails;