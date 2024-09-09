import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/main/PageHeader';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { Button, Card, Descriptions, Divider, Segmented, Tabs, Tag } from 'antd';
import InformationTab from './components/InformationTab';
import { FiSun } from 'react-icons/fi';
import moment from 'moment';
import AboutTab from './components/AboutTab';
import ActivityLogs from './components/ActivityLogs';
import { ActivityLogResponse, OccurrenceResponse } from '@lepark/data-access';
import { getOccurrenceById } from '@lepark/data-access';

const OccurrenceDetails = () => {
  const { occurrenceId } = useParams<{ occurrenceId: string }>();
  const [occurrence, setOccurrence] = useState<OccurrenceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (occurrenceId) {
        try {
          const occurrenceResponse = await getOccurrenceById(occurrenceId);
          setOccurrence(occurrenceResponse.data);
        } catch (error) {
          console.error('Error fetching occurrence data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [occurrenceId]);

  const descriptionsItems = [
    {
      key: 'id',
      label: 'Occurrence ID',
      children: occurrence?.id,
    },
    {
      key: 'occurrenceStatus',
      label: 'Status',
      children: (
        <Tag color="green" bordered={false}>
          Active
        </Tag>
      ),
    },
    {
      key: 'dateObserved',
      label: 'Last Observed',
      children: moment(occurrence?.dateObserved).fromNow(),
    },
  ];

  // Tabs Utility
  const tabsItems = [
    {
      key: 'about',
      label: 'About',
      children: occurrence ? <AboutTab occurrence={occurrence} /> : <p>Loading occurrence data...</p>,
    },
    {
      key: 'information',
      label: 'Information',
      children: occurrence ? <InformationTab occurrence={occurrence} /> : <p>Loading occurrence data...</p>,
    },
    {
      key: 'activityLogs',
      label: 'Activity Logs',
      children: <ActivityLogs occurrence={occurrence} />,
    },
    {
      key: 'statusLogs',
      label: 'Status Logs',
      children: 'adkeewsm',
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader>Occurrence Management</PageHeader>
      <Card>
        {/* <Card className='mb-4 bg-white' styles={{ body: { padding: 0 }}} bordered={false}> */}
        <div className="md:flex w-full gap-4">
          <div
            style={{
              backgroundImage: `url('https://www.travelbreatherepeat.com/wp-content/uploads/2020/03/Singapore_Orchids_Purple.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'white',
              overflow: 'hidden',
            }}
            className="h-64 flex-1 rounded-lg shadow-lg p-4"
          />
          <div className="flex-1 flex-col flex">
            <LogoText className="text-2xl py-2 m-0">{occurrence?.speciesName}</LogoText>
            <Descriptions items={descriptionsItems} column={1} size="small" />

            <div className="flex h-24 w-full gap-2 mt-auto">
              <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                <FiSun className="text-3xl mt-2" />
                <p className="text-xs mt-2">Partial Shade</p>
              </div>
              <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                <FiSun className="text-3xl mt-2" />
                <p className="text-xs mt-2">Every 2 Days</p>
              </div>
              <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                <FiSun className="text-3xl mt-2" />
                <p className="text-xs mt-2">Fast-growing</p>
              </div>
            </div>
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
};

export default OccurrenceDetails;
