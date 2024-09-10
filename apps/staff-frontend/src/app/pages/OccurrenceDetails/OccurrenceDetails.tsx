import { useParams } from 'react-router';
import PageHeader from '../../components/main/PageHeader';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { Button, Card, Descriptions, Divider, Segmented, Tabs, Tag } from 'antd';
import InformationTab from './components/InformationTab';
import { FiSun } from 'react-icons/fi';
import moment from 'moment';
import AboutTab from './components/AboutTab';

const plant = {
  id: 1,
  latitude: 1.3521,
  longitude: 103.8198,
  dateObserved: '2024-09-03',
  occurenceStatus: 'ACTIVE',
  numberOfPlants: 150,
  dateOfBirth: '2024-01-10',
  biomass: 1200.5,
  occurenceDescription: 'Mangrove restoration area',
  decarbonizationType: 'CARBON_SEQUESTRATION',
  speciesId: 1001,
  speciesName: 'Orchid',
  statusLogs: [
    {
      logId: 1,
      status: 'HEALTHY',
      dateLogged: '2024-02-15',
      remarks: 'Plants are growing well',
    },
    {
      logId: 2,
      status: 'MONITORED',
      dateLogged: '2024-03-10',
      remarks: 'Area requires periodic monitoring',
    },
  ],
  decarbonizationAreaId: 501,
};

const OccurrenceDetails = () => {
  const { id } = useParams();

  const descriptionsItems = [
    {
      key: 'id',
      label: 'Occurrence ID',
      children: plant.id,
    },
    {
      key: 'occurenceStatus',
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
      children: moment(plant.dateObserved).fromNow(),
    },
  ];

  // Tabs Utility
  const tabsItems = [
    {
      key: 'about',
      label: 'About',
      children: <AboutTab occurence={plant}/>,
    },
    {
      key: 'information',
      label: 'Information',
      children: <InformationTab occurence={plant}/>,
    },
    {
      key: 'activityLogs',
      label: 'Activity Logs',
      children: 'adksm',
    },
    {
      key: 'statuseLogs',
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
            <LogoText className="text-2xl py-2 m-0">
              {plant.speciesName}
            </LogoText>
            <Descriptions
              items={descriptionsItems}
              column={1}
              size="small"
            />
            
            <div className='flex h-24 w-full gap-2 mt-auto'>
              <div className='bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1'>
                <FiSun className='text-3xl mt-2'/>
                <p className='text-xs mt-2'>Partial Shade</p>
              </div>
              <div className='bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1'>
                <FiSun className='text-3xl mt-2'/>
                <p className='text-xs mt-2'>Every 2 Days</p>
              </div>
              <div className='bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1'>
                <FiSun className='text-3xl mt-2'/>
                <p className='text-xs mt-2'>Fast-growing</p>
              </div>
            </div>
            

          </div> 
        </div>

        <Tabs
          centered
          defaultActiveKey="information"
          items={tabsItems}
          renderTabBar={(props, DefaultTabBar) => (
            <DefaultTabBar
              {...props}
              className="border-b-[1px] border-gray-400"
            />
          )}
          className="mt-4"
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default OccurrenceDetails;
