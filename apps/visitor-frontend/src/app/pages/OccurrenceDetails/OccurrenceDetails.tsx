import { useParams } from 'react-router';
import { ContentWrapper, ContentWrapperDark, LogoText } from '@lepark/common-ui';
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
      children: <></>,
    },
    {
      key: 'species',
      label: 'Species',
      children: <AboutTab occurence={plant} />,
    },
    // {
    //   key: 'location',
    //   label: 'Location',
    //   children: <></>
    // },
  ];

  return (
    <div className="md:p-4">
      {/* <Card className="md:p-4" styles={{ body: { padding: 0 } }} bordered={false}> */}
        <div className="md:flex w-full gap-4">
          <div
            style={{
              backgroundImage: `url('https://www.travelbreatherepeat.com/wp-content/uploads/2020/03/Singapore_Orchids_Purple.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'white',
              overflow: 'hidden',
            }}
            className="shadow-lg p-4 rounded-b-3xl h-96 md:h-[45rem] md:flex-[2] md:rounded-lg"
          />
          <div className="flex-[3] flex-col flex p-4 md:p-0">
            <LogoText className="text-3xl font-bold md:text-2xl md:font-semibold md:py-2 md:m-0 ">{plant.speciesName}</LogoText>
            <div className="flex flex-col-reverse">
              <div className="flex h-24 w-full gap-3 my-2 md:gap-2 md:mt-auto">
                <div className="bg-green-50 h-full w-20 rounded-xl md:rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
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
            <div className='py-4'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</div>
            <Tabs
              // centered
              defaultActiveKey="information"
              items={tabsItems}
              renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="border-b-[1px] border-gray-400" />}
              className="md:mt-0 md:p-0"
            />
          </div>
        </div>

        
      {/* </Card> */}
    </div>
  );
};

export default OccurrenceDetails;
