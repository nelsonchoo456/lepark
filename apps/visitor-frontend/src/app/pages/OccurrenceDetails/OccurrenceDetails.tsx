import { LogoText } from '@lepark/common-ui';
import { Descriptions, Empty, Tabs, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { FaTint } from 'react-icons/fa';
import { FiSun } from 'react-icons/fi';
import { MdEco, MdOutlineTerrain } from 'react-icons/md';
import { WiDayCloudy, WiDaySunny, WiNightAltCloudy } from 'react-icons/wi';
import { useNavigate, useParams } from 'react-router-dom';
import AboutTab from './components/AboutTab';
import InformationTab from './components/InformationTab';

import {
  ConservationStatusEnum,
  getOccurrenceById,
  getSpeciesById,
  LightTypeEnum,
  OccurrenceResponse,
  SoilTypeEnum,
  SpeciesResponse,
} from '@lepark/data-access';
import moment from 'moment';
import OccurrenceTable from '../Taxonomy/components/OccurrenceTable';
import SpeciesCarousel from '../Taxonomy/components/SpeciesCarousel';

const OccurrenceDetails = () => {
  const { occurrenceId } = useParams<{ occurrenceId: string }>();
  const [occurrence, setOccurrence] = useState<OccurrenceResponse | null>(null);
  const [species, setSpecies] = useState<SpeciesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      key: 'occurrenceSpecies',
      label: 'Species',
      children: species ? species.speciesName : 'Loading...',
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
      key: 'information',
      label: 'Information',
      children: occurrence ? <InformationTab occurrence={occurrence} /> : <p>Loading occurrence data...</p>,
    },
    {
      key: 'about',
      label: 'Species',
      children: species && occurrence ? <AboutTab species={species} occurrence={occurrence} /> : <p>Loading Species data...</p>,
    },
    {
      key: 'occurrences',
      label: 'Other Occurrences',
      children: species ? <OccurrenceTable speciesId={species.id} loading={false} /> : <p>Loading data...</p>,
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
    <div className="md:p-4 md:h-screen md:overflow-hidden">
      <div className="w-full gap-4 md:flex md:h-full md:overflow-hidden">
        <div className="md:w-2/5 h-96">
            {occurrence?.images && occurrence.images.length > 0 ? (
              <SpeciesCarousel images={occurrence?.images || []} />
            ) : (
              <div className="h-96 bg-gray-200 flex items-center justify-center">
                <Empty description="No Image" />
              </div>
            )}
        </div>
        <div className="flex-[3] flex-col flex p-4 md:p-0 md:h-full md:overflow-x-auto">
          <div className="hidden md:block">
            <LogoText className="text-3xl font-bold md:text-2xl md:font-semibold md:py-2 md:m-0 ">{occurrence?.title}</LogoText>
          </div>
          <Typography.Paragraph
            ellipsis={{
              rows: 3,
              expandable: true,
              symbol: 'more',
            }}
          >
            {species?.speciesDescription}
          </Typography.Paragraph>
          <Descriptions items={descriptionsItems} column={1} size="small" />
          <div className="flex h-24 w-full gap-2 mt-2">
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
          <Tabs
            defaultActiveKey="information"
            items={tabsItems}
            renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="border-b-[1px] border-gray-400" />}
            className="md:mt-0 md:p-0"
          />
        </div>
      </div>
    </div>
  );
};

export default OccurrenceDetails;
