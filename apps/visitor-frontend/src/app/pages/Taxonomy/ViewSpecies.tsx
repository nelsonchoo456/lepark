import { LogoText, useAuth } from '@lepark/common-ui';
import {
  addFavoriteSpecies,
  deleteSpeciesFromFavorites,
  getSpeciesById,
  isSpeciesInFavorites,
  SpeciesResponse,
  VisitorResponse,
} from '@lepark/data-access';
import { Button, message, Tabs, Typography } from 'antd';
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
import { IoMdHeart, IoMdHeartDislike } from 'react-icons/io';
import { useLocation, useParams } from 'react-router-dom';
import InformationTab from './components/InformationTab';
import OccurrenceTable from './components/OccurrenceTable';
import SpeciesCarousel from './components/SpeciesCarousel';
import TaxonomyTab from './components/TaxonomyTab';
import { usePark } from '../../park-context/ParkContext';

const ViewSpeciesDetails = () => {
  const { speciesId } = useParams<{ speciesId: string }>();
  const [species, setSpecies] = useState<SpeciesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user, updateUser } = useAuth<VisitorResponse>();
  const [visitor, setVisitor] = useState<VisitorResponse | null>(null);

  const location = useLocation();
  const fromDiscoverPerPark = location.state?.fromDiscoverPerPark || false;
  const { selectedPark } = usePark();

  useEffect(() => {
    const fetchData = async () => {
      if (speciesId) {
        try {
          const speciesResponse = await getSpeciesById(speciesId);
          setSpecies(speciesResponse.data);
          // console.log(speciesResponse.data);
        } catch (error) {
          console.error('Error fetching species data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [speciesId]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && speciesId) {
        try {
          const isAlreadyFavorite = await isSpeciesInFavorites(user.id, speciesId);
          setIsFavorite(isAlreadyFavorite);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };
    checkFavoriteStatus();
  }, [user, speciesId]);

  const handleAddToFavorites = async () => {
    if (species && user) {
      try {
        const addFavoriteSpeciesData = {
          visitorId: user.id,
          speciesId: species.id,
        };
        await addFavoriteSpecies(addFavoriteSpeciesData);
        message.success('Species added to favorites!');
        setIsFavorite(true);
      } catch (error) {
        console.error('Error adding species to favorites:', error);
        message.error('Failed to add species to favorites. Please try again.');
      }
    }
  };

  const handleRemoveFromFavorites = async () => {
    if (species && user) {
      try {
        await deleteSpeciesFromFavorites(user.id, species.id);
        message.success('Species removed from favorites!');
        setIsFavorite(false);
      } catch (error) {
        console.error('Error removing species from favorites:', error);
        message.error('Failed to remove species from favorites. Please try again.');
      }
    }
  };

  const descriptionsItems = [
    {
      key: 'id',
      label: 'Species ID',
      children: species?.id,
    },
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
      key: 'information',
      label: 'Information',
      children: species ? <InformationTab species={species} /> : <p>Loading species data...</p>,
    },
    {
      key: 'occurrences',
      label: 'Occurrences',
      children: species ? (
        <OccurrenceTable speciesId={species.id} loading={false} selectedPark={fromDiscoverPerPark ? selectedPark : undefined} />
      ) : (
        <p>Loading species data...</p>
      ),
    },
    {
      key: 'taxonomy',
      label: 'Taxonomy',
      children: species ? <TaxonomyTab species={species} /> : <p>Loading species data...</p>,
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
    <div className="md:p-4 md:h-screen md:overflow-hidden">
      <div className="w-full gap-4 md:flex md:h-full md:overflow-hidden">
        <div className="md:w-2/5 h-96">
          <div className="z-20 absolute w-full flex justify-between p-4">
            <div className="md:hidden backdrop-blur bg-white/75 px-6 py-2 z-20 rounded-full box-shadow-md">
              <LogoText className="text-3xl font-bold md:text-2xl md:font-semibold md:py-2 md:m-0 ">{species?.commonName}</LogoText>
              <LogoText className="ml-4 italic opacity-75">{species?.speciesName}</LogoText>
            </div>
            {user &&
              user.isVerified &&
              (isFavorite ? (
                <Button
                  icon={<IoMdHeartDislike className="text-2xl text-pastelPink-500" />}
                  shape="circle"
                  type="primary"
                  size="large"
                  className="bg-pastelPink-100/80 hover:bg-pastelPink-200/80 box-shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFromFavorites();
                  }}
                />
              ) : (
                <Button
                  icon={<IoMdHeart className="text-2xl text-pastelPink-500" />}
                  shape="circle"
                  type="primary"
                  size="large"
                  className="bg-pastelPink-100/80 hover:bg-pastelPink-200/80 box-shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToFavorites();
                  }}
                />
              ))}
          </div>
          <SpeciesCarousel images={species?.images || []} />
        </div>
        <div className="flex-[3] flex-col flex p-4 md:p-0 md:h-full md:overflow-x-auto">
          <div className="hidden md:block">
            <LogoText className="text-3xl font-bold md:text-2xl md:font-semibold md:py-2 md:m-0 ">{species?.commonName}</LogoText>
            <LogoText className="ml-4 italic opacity-75">{species?.speciesName}</LogoText>
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
          <div className="flex flex-col-reverse">
            <div className="flex h-24 w-full gap-3 my-2 md:gap-2 md:mt-auto">
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
export default ViewSpeciesDetails;
