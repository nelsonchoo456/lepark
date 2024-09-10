import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { viewSpeciesDetails, SpeciesResponse } from '@lepark/data-access';
import { Card, Descriptions, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { FiCloud, FiMoon, FiSun } from 'react-icons/fi';
import {
  GiBrokenShield,
  GiClayBrick,
  GiConfirmed,
  GiDesert,
  GiHazardSign,
  GiPlantRoots,
  GiShield,
  GiSiren,
  GiTombstone,
} from 'react-icons/gi';
import { useParams } from 'react-router';
import PageHeader from '../../components/main/PageHeader';
import OccurrencesTab from './components/OccurrencesTab';
import InformationTab from './components/InformationTab';

const ViewSpeciesDetails = () => {
  const { speciesId } = useParams<{ speciesId: string }>();
  const [species, setSpecies] = useState<SpeciesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (speciesId) {
        try {
          const speciesResponse = await viewSpeciesDetails(speciesId);
          setSpecies(speciesResponse.data);
          console.log(speciesResponse.data);
        } catch (error) {
          console.error('Error fetching species data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [speciesId]);

  const descriptionsItems = [
    /*{
      key: 'id',
      label: 'Species ID',
      children: species?.id,
    },*/
    {
      key: 'speciesName',
      label: 'Species Name',
      children: species?.speciesName,
    },
    {
      key: 'commonName',
      label: 'Common Name',
      children: species?.commonName,
    },
    {
      key: 'phylum',
      label: 'Phylum',
      children: species?.phylum,
    },
    {
      key: 'class',
      label: 'Class',
      children: species?.class,
    },
    {
      key: 'order',
      label: 'Order',
      children: species?.order,
    },
    {
      key: 'family',
      label: 'Family',
      children: species?.family,
    },
    {
      key: 'genus',
      label: 'Genus',
      children: species?.genus,
    },
    {
      key: 'originCountry',
      label: 'Country of Origin',
      children: species?.originCountry,
    },
    {
      key: 'speciesDescription',
      label: 'Description',
      children: species?.speciesDescription,
    },
  ];

  // Tabs Utility
  const tabsItems = [
    {
      key: 'occurrences',
      label: 'Occurrences',
      children: species ? <OccurrencesTab species={species} /> : <p>Loading species data...</p>,
    },
    {
      key: 'information',
      label: 'Information',
      children: species ? <InformationTab species={species} /> : <p>Loading species data...</p>,
    },
  ];

  const formatEnumString = (str: string) => {
    return str
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getLightTypeIcon = (lightType: string) => {
    switch (lightType) {
      case 'FULL_SUN':
        return <FiSun className="text-3xl mt-2" />;
      case 'PARTIAL_SHADE':
        return <FiCloud className="text-3xl mt-2" />;
      case 'FULL_SHADE':
        return <FiMoon className="text-3xl mt-2" />;
      default:
        return null;
    }
  };

  const getSoilTypeIcon = (soilType: string) => {
    switch (soilType) {
      case 'SANDY':
        return <GiDesert className="text-3xl mt-2" />;
      case 'CLAYEY':
        return <GiClayBrick className="text-3xl mt-2" />;
      case 'LOAMY':
        return <GiPlantRoots className="text-3xl mt-2" />;
      default:
        return null;
    }
  };

  const getConservationStatusIcon = (status: string) => {
    switch (status) {
      case 'LEAST_CONCERN':
        return <GiConfirmed className="text-3xl mt-2" />;
      case 'NEAR_THREATENED':
        return <GiShield className="text-3xl mt-2" />;
      case 'VULNERABLE':
        return <GiBrokenShield className="text-3xl mt-2" />;
      case 'ENDANGERED':
        return <GiSiren className="text-3xl mt-2" />;
      case 'CRITICALLY_ENDANGERED':
        return <GiHazardSign className="text-3xl mt-2" />;
      case 'EXTINCT':
      case 'EXTINCT_IN_THE_WILD':
        return <GiTombstone className="text-3xl mt-2" />;
      default:
        return null;
    }
  };

  return (
    <ContentWrapperDark>
      <PageHeader>Species Management</PageHeader>
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
              flex: 1,
            }}
            className="rounded-lg shadow-lg p-4"
          />
          <div className="flex-1 flex-col flex">
            <LogoText className="text-2xl py-2 m-0">{species?.commonName}</LogoText>
            <Descriptions items={descriptionsItems} column={1} size="small" className="mb-4" />

            <div className="flex h-24 w-full gap-2 mt-auto">
              <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                {species?.conservationStatus && getConservationStatusIcon(species.conservationStatus)}
                <p className="text-xs mt-2">{species?.conservationStatus && formatEnumString(species.conservationStatus)}</p>
              </div>
              <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                {species?.lightType && getLightTypeIcon(species.lightType)}
                <p className="text-xs mt-2">{species?.lightType && formatEnumString(species.lightType)}</p>
              </div>
              <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                {species?.soilType && getSoilTypeIcon(species.soilType)}
                <p className="text-xs mt-2">{species?.soilType && formatEnumString(species.soilType)}</p>
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

export default ViewSpeciesDetails;
