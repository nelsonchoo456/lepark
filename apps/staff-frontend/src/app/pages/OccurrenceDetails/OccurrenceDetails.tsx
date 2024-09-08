import { useParams } from 'react-router';
import PageHeader from '../../components/main/PageHeader';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { Button, Card, Descriptions, Divider, Segmented, Tabs, Tag } from 'antd';
import InformationTab from './components/InformationTab';
import { FiSun } from 'react-icons/fi';
import moment from 'moment';
import AboutTab from './components/AboutTab';
import ActivityLogs from './components/ActivityLogs';

const plant = {
  id: 1,
  latitude: 1.3521,
  longitude: 103.8198,
  dateObserved: '2024-09-03',
  occurrenceStatus: 'ACTIVE',
  numberOfPlants: 150,
  dateOfBirth: '2024-01-10',
  biomass: 1200.5,
  occurrenceDescription: 'Mangrove restoration area',
  decarbonizationType: 'CARBON_SEQUESTRATION',
  speciesId: 1001,
  speciesName: 'Orchid',
  activityLogs: [
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

const occurrences = [
  {
    "id": "occurrence-1-uuid",
    "lat": 1.3521,
    "lng": 103.8198,
    "dateObserved": "2024-09-08T10:00:00Z",
    "dateOfBirth": "2022-06-15T10:00:00Z",
    "numberOfPlants": 50.0,
    "biomass": 200.0,
    "title": "Mangrove Restoration",
    "description": "Observing the growth of newly planted mangroves.",
    "decarbonizationType": "CARBON_SEQUESTRATION",
    "speciesId": "species-1-uuid",
    "activityLogs": [
      {
        "id": "activity-log-1-uuid",
        "name": "Watering Mangroves",
        "description": "Watered the newly planted mangroves",
        "dateCreated": "2024-09-07T10:00:00Z",
        "images": ["water-mangroves-1.jpg"],
        "activityLogType": "WATERED"
      },
      {
        "id": "activity-log-2-uuid",
        "name": "Pruned Mangroves",
        "description": "Pruned the mangroves to promote growth",
        "dateCreated": "2024-09-07T11:00:00Z",
        "images": ["prune-mangroves-1.jpg"],
        "activityLogType": "PRUNED"
      }
    ],
    "statusLogs": [
      {
        "id": "status-log-1-uuid",
        "name": "Healthy Growth",
        "description": "Plants are healthy with no issues observed",
        "dateCreated": "2024-09-08T10:30:00Z",
        "images": ["healthy-mangroves.jpg"],
        "statusLogType": "HEALTHY"
      }
    ]
  },
  {
    "id": "occurrence-2-uuid",
    "lat": 1.2803,
    "lng": 103.8519,
    "dateObserved": "2024-09-07T14:00:00Z",
    "dateOfBirth": "2021-05-01T10:00:00Z",
    "numberOfPlants": 100.0,
    "biomass": 450.0,
    "title": "Urban Tree Canopy Monitoring",
    "description": "Monitoring tree growth in urban areas",
    "decarbonizationType": "CARBON_REDUCTION",
    "speciesId": "species-2-uuid",
    "activityLogs": [
      {
        "id": "activity-log-2-uuid",
        "name": "Pruned Trees",
        "description": "Pruned trees to promote growth",
        "dateCreated": "2024-09-07T15:00:00Z",
        "images": ["prune-trees-1.jpg"],
        "activityLogType": "PRUNED"
      }
    ],
    "statusLogs": [
      {
        "id": "status-log-2-uuid",
        "name": "Needs Attention",
        "description": "Some trees showed signs of pest infestation",
        "dateCreated": "2024-09-07T15:30:00Z",
        "images": ["infested-trees.jpg"],
        "statusLogType": "NEEDS_ATTENTION"
      }
    ]
  }
]


const OccurrenceDetails = () => {
  const { id } = useParams();

  const descriptionsItems = [
    {
      key: 'id',
      label: 'Occurrence ID',
      children: plant.id,
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
      children: moment(plant.dateObserved).fromNow(),
    },
  ];

  // Tabs Utility
  const tabsItems = [
    {
      key: 'about',
      label: 'About',
      children: <AboutTab occurrence={plant} />,
    },
    {
      key: 'information',
      label: 'Information',
      children: <InformationTab occurrence={occurrences[0]} />,
    },
    {
      key: 'activityLogs',
      label: 'Activity Logs',
      children: <ActivityLogs occurrenceId={occurrences[0].id} activityLogs={occurrences[0].activityLogs} />,
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
            <LogoText className="text-2xl py-2 m-0">{plant.speciesName}</LogoText>
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
