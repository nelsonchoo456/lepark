import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/main/PageHeader';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { Button, Card, Descriptions, Divider, Segmented, Tabs, Tag, Spin } from 'antd';
import InformationTab from './components/InformationTab';
import { FiSun, FiDroplet, FiThermometer, FiAlertTriangle } from 'react-icons/fi';
import { MdOutlineTerrain, MdEco } from 'react-icons/md';
import { WiRaindrop, WiRaindrops } from 'react-icons/wi';
import { FaTint } from 'react-icons/fa';
import moment from 'moment';
import AboutTab from './components/AboutTab';
import ActivityLogs from './components/ActivityLogs';
import StatusLogs from './components/StatusLogs';
import { ActivityLogResponse, OccurrenceResponse, SpeciesResponse, LightTypeEnum, SoilTypeEnum, ConservationStatusEnum } from '@lepark/data-access';
import { getOccurrenceById, getSpeciesById } from '@lepark/data-access';
import { WiDaySunny, WiDayCloudy, WiNightAltCloudy } from 'react-icons/wi';

const OccurrenceDetails = () => {
  const { occurrenceId } = useParams<{ occurrenceId: string }>();
  const [occurrence, setOccurrence] = useState<OccurrenceResponse | null>(null);
  const [species, setSpecies] = useState<SpeciesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (occurrenceId) {
        setLoading(true);
        try {
          const occurrenceResponse = await getOccurrenceById(occurrenceId);
          setOccurrence(occurrenceResponse.data);
          
          if (occurrenceResponse.data.speciesId) {
            const speciesResponse = await getSpeciesById(occurrenceResponse.data.speciesId);
            setSpecies(speciesResponse.data);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
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
          {occurrence?.occurrenceStatus}
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
      children: <StatusLogs occurrence={occurrence} />,
    },
  ];

  const getWaterRequirementInfo = (value: number) => {
    if (value <= 30) return { text: 'Low', icon: <FaTint className="text-3xl mt-2 text-blue-300" /> };
    if (value <= 60) return { text: 'Medium', icon: <FaTint className="text-3xl mt-2 text-blue-500" /> };
    return { text: 'High', icon: <FaTint className="text-3xl mt-2 text-blue-700" /> };
  };

  const getLightTypeInfo = (lightType: LightTypeEnum) => {
    switch (lightType) {
      case LightTypeEnum.FULL_SUN:
        return { text: 'Full Sun', icon: <WiDaySunny className="text-3xl mt-2 text-yellow-500" /> };
      case LightTypeEnum.PARTIAL_SHADE:
        return { text: 'Partial Shade', icon: <WiDayCloudy className="text-3xl mt-2 text-yellow-300" /> };
      case LightTypeEnum.FULL_SHADE:
        return { text: 'Full Shade', icon: <WiNightAltCloudy className="text-3xl mt-2 text-gray-500" /> };
      default:
        return { text: 'Unknown', icon: <FiSun className="text-3xl mt-2" /> };
    }
  };

  const getSoilTypeText = (soilType: SoilTypeEnum) => {
    switch (soilType) {
      case SoilTypeEnum.SANDY:
        return 'Sandy';
      case SoilTypeEnum.CLAYEY:
        return 'Clayey';
      case SoilTypeEnum.LOAMY:
        return 'Loamy';
      default:
        return 'Unknown';
    }
  };

  const getConservationStatusText = (status: ConservationStatusEnum) => {
    switch (status) {
      case ConservationStatusEnum.LEAST_CONCERN:
        return 'Least Concern';
      case ConservationStatusEnum.NEAR_THREATENED:
        return 'Near Threatened';
      case ConservationStatusEnum.VULNERABLE:
        return 'Vulnerable';
      case ConservationStatusEnum.ENDANGERED:
        return 'Endangered';
      case ConservationStatusEnum.CRITICALLY_ENDANGERED:
        return 'Critically Endangered';
      case ConservationStatusEnum.EXTINCT_IN_THE_WILD:
        return 'Extinct in the Wild';
      case ConservationStatusEnum.EXTINCT:
        return 'Extinct';
      default:
        return 'Unknown';
    }
  };

  return (
    <ContentWrapperDark>
      <PageHeader>Occurrence Management</PageHeader>
      <Card>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <>
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
                  {species ? (
                    <>
                      <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                        {getWaterRequirementInfo(species.waterRequirement).icon}
                        <p className="text-xs mt-2">{getWaterRequirementInfo(species.waterRequirement).text}</p>
                      </div>
                      <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                        {getLightTypeInfo(species.lightType).icon}
                        <p className="text-xs mt-2">{getLightTypeInfo(species.lightType).text}</p>
                      </div>
                      <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                        <MdOutlineTerrain className="text-3xl mt-2" />
                        <p className="text-xs mt-2">{getSoilTypeText(species.soilType)}</p>
                      </div>
                      <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                        <MdEco className="text-3xl mt-2" />
                        <p className="text-xs mt-2">{getConservationStatusText(species.conservationStatus)}</p>
                      </div>
                    </>
                  ) : (
                    <div className="bg-green-50 h-full w-full rounded-lg flex justify-center items-center text-green-600">
                      <p>Species data not available</p>
                    </div>
                  )}
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
          </>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default OccurrenceDetails;
