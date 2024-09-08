import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import PageHeader from '../../components/main/PageHeader';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { Card, Empty, Tabs } from 'antd';
import { getParkById, ParkResponse } from '@lepark/data-access';
import { FiSun } from 'react-icons/fi';

const ParkDetails = () => {
  const [park, setPark] = useState<ParkResponse>()
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const parkRes = await getParkById(parseInt(id));
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
        key: 'zones',
        label: 'Zones',
        // children: <ActivityLogs occurrenceId={occurrences[0].id} activityLogs={occurrences[0].activityLogs} />,
      },
      {
        key: 'attractions',
        label: 'Attractions',
        // children: <ActivityLogs occurrenceId={occurrences[0].id} activityLogs={occurrences[0].activityLogs} />,
        children: <Empty description={"Attractions Coming Soon"}></Empty>
      },
      {
        key: 'events',
        label: 'Events',
        // children: <ActivityLogs occurrenceId={occurrences[0].id} activityLogs={occurrences[0].activityLogs} />,
        children: <Empty description={"Events Coming Soon"}></Empty>
      },
    ];

  return (
    <ContentWrapperDark>
      <PageHeader>Park Management</PageHeader>
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
            <LogoText className="text-2xl py-2 m-0">{park?.name}</LogoText>
            {/* <Descriptions items={descriptionsItems} column={1} size="small" /> */}

            
          </div>
        </div>

        <Tabs
          centered
          defaultActiveKey="information"
          items={tabsItems}
          renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="border-b-[1px] border-gray-400" />}
          className="mt-4"
        />
      </Card>
    </ContentWrapperDark>
  );
}

export default ParkDetails;