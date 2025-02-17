import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { getSpeciesById, SpeciesResponse } from '@lepark/data-access';
import { Card, Descriptions, Spin, Tabs, notification } from 'antd';
import { useEffect, useState, useRef } from 'react';
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
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import InformationTab from './components/InformationTab';
import OccurrenceTable from './components/OccurrenceTable';
import SpeciesCarousel from './components/SpeciesCarousel';

const ViewSpeciesDetails = () => {
  const { speciesId } = useParams<{ speciesId: string }>();
  const [species, setSpecies] = useState<SpeciesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const notificationShown = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (speciesId) {
        try {
          const speciesResponse = await getSpeciesById(speciesId);
          setSpecies(speciesResponse.data);
        } catch (error) {
          console.error('Error fetching species data:', error);
          if (!notificationShown.current) {
            notification.error({
              message: 'Access Denied',
              description: 'You do not have permission to access this resource.',
            });
            notificationShown.current = true;
          }
          navigate('/');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [speciesId, navigate]);

  if (loading) {
    return (
      <ContentWrapperDark>
        <Card>
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </Card>
      </ContentWrapperDark>
    );
  }

  if (!species) {
    return null; // This will handle cases where the species is not found
  }

  const breadcrumbItems = [
    {
      title: "Species Management",
      pathKey: '/species',
      isMain: true,
    },
    {
      title: species?.speciesName ? species?.speciesName : "Details",
      pathKey: `/species/${species?.id}`,
      isCurrent: true
    },
  ]

  const descriptionsItems = [
    // {
    //   key: 'id',
    //   label: 'Species ID',
    //   children: species?.id,
    // },
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
    // {
    //   key: 'speciesDescription',
    //   label: 'Description',
    //   children: species?.speciesDescription,
    // },
  ];

  // Tabs Utility
  const tabsItems = [
    {
      key: 'occurrences',
      label: 'Occurrences',
      children: species ? <OccurrenceTable speciesId={species.id} loading={false} /> : <p>Loading species data...</p>,
    },
    {
      key: 'information',
      label: 'Information',
      children: species ? <InformationTab species={species} /> : <p>Loading species data...</p>,
    }
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

  const carouselSettings = {
    arrows: true,
  };

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems}/>
      <Card>
        {/* <Card className='mb-4 bg-white' styles={{ body: { padding: 0 }}} bordered={false}> */}
        <div className="md:flex w-full gap-4">
          <div className="w-full md:w-1/2 lg:w-1/2 ">
            <SpeciesCarousel images={species?.images || []} />
          </div>

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
