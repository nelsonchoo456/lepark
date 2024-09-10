import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { getSpeciesById, SpeciesResponse } from '@lepark/data-access';
import { Card, Descriptions, Tabs, Tag } from 'antd';
import moment from 'moment';
import { FiSun } from 'react-icons/fi';
import { useParams } from 'react-router';
import PageHeader from '../../components/main/PageHeader';
import AboutTab from './components/AboutTab';
import InformationTab from './components/InformationTab';
import { useEffect, useState } from 'react';

const ViewSpeciesDetails = () => {
  const { speciesId } = useParams<{ speciesId: string }>();
  const [species, setSpecies] = useState<SpeciesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (speciesId) {
        try {
          const speciesResponse = await getSpeciesById(speciesId);
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
    {
      key: 'id',
      label: 'Species ID',
      children: species?.id,
    },
  ];

  // Tabs Utility
  const tabsItems = [
    {
      key: 'about',
      label: 'About',
      children: species ? <AboutTab species={species} /> : <p>Loading species data...</p>,
    },
    {
      key: 'information',
      label: 'Information',
      children: species ? <InformationTab species={species} /> : <p>Loading species data...</p>,
    },
  ];

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
            }}
            className="h-64 flex-1 rounded-lg shadow-lg p-4"
          />
          <div className="flex-1 flex-col flex">
            <LogoText className="text-2xl py-2 m-0">{species?.speciesName}</LogoText>
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

export default ViewSpeciesDetails;
