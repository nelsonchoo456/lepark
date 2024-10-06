import { LogoText, useAuth } from '@lepark/common-ui';
import {
  getDecarbonizationAreaById,
  DecarbonizationAreaResponse,
  VisitorResponse,
  getParkById,
  ParkResponse
} from '@lepark/data-access';
import { Button, Carousel, message, Tabs, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import DecarbOccurrenceTab from './components/DecarbOccurrenceTab';
import { usePark } from '../../park-context/ParkContext';

const DecarbViewDetails = () => {
  const { decarbAreaId } = useParams<{ decarbAreaId: string }>();
  const [decarbArea, setDecarbArea] = useState<DecarbonizationAreaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth<VisitorResponse>();
  const { selectedPark } = usePark();
  const [park, setPark] = useState<ParkResponse | null>(null);

  const location = useLocation();
  const fromDiscoverPerPark = location.state?.fromDiscoverPerPark || false;


  useEffect(() => {
    const fetchData = async () => {
      if (decarbAreaId) {
        try {
          const decarbAreaResponse = await getDecarbonizationAreaById(decarbAreaId);
          setDecarbArea(decarbAreaResponse.data);
        } catch (error) {
          console.error('Error fetching decarbonization area data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [decarbAreaId]);

  const tabsItems = [
    {
      key: 'occurrences',
      label: 'Occurrences',
      children: decarbArea ? (
        <DecarbOccurrenceTab
          decarbAreaId={decarbArea.id}
          loading={false}
          selectedPark={fromDiscoverPerPark && selectedPark ? selectedPark : undefined}
        />
      ) : (
        <p>Loading decarbonization area data...</p>
      ),
    },
    // Add more tabs as needed
  ];


  useEffect(() => {
    const fetchPark = async () => {
      if (decarbArea?.parkId) {
        console.log("fetching park");
        try {
          setLoading(true);
          const response = await getParkById(Number(decarbArea.parkId));

          setPark(response.data);
          console.log(response.data);
        } catch (error) {
          console.error('Error fetching park:', error);
        } finally {
          setLoading(false);
        }
      }


    };

    fetchPark();
  }, [decarbArea?.parkId]);

  return (
    <div className="md:p-4 md:h-screen md:overflow-hidden">
      <div className="w-full gap-4 md:flex md:h-full md:overflow-hidden">
        <div className="md:w-2/5 h-96 relative">
          <div className="z-20 absolute w-full h-full flex flex-col justify-between p-4">
            <div className="md:hidden backdrop-blur bg-white/75 px-6 py-2 z-20 rounded-full box-shadow-md self-start">
              <LogoText className="text-3xl font-bold md:text-2xl md:font-semibold">{decarbArea?.name}</LogoText>
              <p className="text-sm mt-1">{park?.name}</p>
            </div>
            <Typography.Paragraph
              className="backdrop-blur bg-white/75 p-4 rounded-lg max-w-full"
              ellipsis={{
                rows: 3,
                expandable: true,
                symbol: 'more',
              }}
            >
              {decarbArea?.description}
            </Typography.Paragraph>
          </div>
          <Carousel>
            {park?.images?.map((image) => (
              <div key={image}>
                <img src={image} alt={park?.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </Carousel>
          {/* Add an image or map component here if available */}
        </div>
        <div className="flex-[3] flex-col flex p-4 md:p-0 md:h-full md:overflow-x-auto">
          <div className="hidden md:block">
            <LogoText className="text-3xl font-bold md:text-2xl md:font-semibold md:py-2 md:m-0 ">{decarbArea?.name}</LogoText>
          </div>
          <Typography.Paragraph
            ellipsis={{
              rows: 3,
              expandable: true,
              symbol: 'more',
            }}
          >
            {decarbArea?.description}
          </Typography.Paragraph>
          <div className="flex flex-col-reverse">
            <div className="flex h-24 w-full gap-3 my-2 md:gap-2 md:mt-auto">
              {/* Add any relevant information or icons for the decarbonization area */}
            </div>
          </div>

          <Tabs
            defaultActiveKey="occurrences"
            items={tabsItems}
            renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="border-b-[1px] border-gray-400" />}
            className="md:mt-0 md:p-0"
          />
        </div>
      </div>
    </div>
  );
};

export default DecarbViewDetails;
