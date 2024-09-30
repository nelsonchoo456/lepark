import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, Typography, Tag } from 'antd';
import moment from 'moment';
import { LogoText } from '@lepark/common-ui';
import { getParkById, ParkResponse } from '@lepark/data-access';
import SpeciesCarousel from '../Taxonomy/components/SpeciesCarousel';

const { Title } = Typography;

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const formatHours = (openingHours: Date[], closingHours: Date[]) => {
  return daysOfWeek.map((day, index) => {
    const opening = openingHours[index] ? moment(openingHours[index]).format('h:mm A') : 'Closed';
    const closing = closingHours[index] ? moment(closingHours[index]).format('h:mm A') : 'Closed';
    return { day, hours: `${opening} - ${closing}` };
  });
};

const VisitorViewParkDetails = () => {
  const { parkId } = useParams<{ parkId: string }>();
  const [park, setPark] = useState<ParkResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPark = async () => {
      if (parkId) {
        try {
          setLoading(true);
          const response = await getParkById(parseInt(parkId, 10));
          setPark(response.data);
        } catch (error) {
          console.error('Error fetching park:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPark();
  }, [parkId]);

  const tabsItems = [
    {
      key: 'information',
      label: 'Information',
      // children: park ? <ParkInformationTab park={park} /> : <p>Loading park data...</p>,
    },
    // Add other tabs if necessary
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!park) {
    return <div>Park not found</div>;
  }

  return (
    <div className="md:p-4 md:h-screen md:overflow-hidden">
      <div className="w-full gap-4 md:flex md:h-full md:overflow-hidden">
        <div className="md:w-2/5 h-96">
          <div className="z-20 absolute w-full flex justify-between p-4">
            <div className="md:hidden backdrop-blur bg-white/75 px-6 py-2 z-20 rounded-full box-shadow-md">
              <LogoText className="text-3xl font-bold md:text-2xl md:font-semibold md:py-2 md:m-0 ">{park.name}</LogoText>
            </div>
          </div>
          <SpeciesCarousel images={park.images || []} />
        </div>
        <div className="flex-[3] flex-col flex p-4 md:p-0 md:h-full md:overflow-x-auto">
          <div className="hidden md:flex items-start">
            <div className="flex-0">
              <LogoText className="text-3xl font-bold md:text-2xl md:font-semibold md:py-2 md:m-0 ">{park.name}</LogoText>
              <Typography.Paragraph
                ellipsis={{
                  rows: 3,
                  expandable: true,
                  symbol: 'more',
                }}
              >
                {park.description}
              </Typography.Paragraph>
              <div className="mb-4 hidden md:block">
                <Tag color={park.parkStatus === 'OPEN' ? 'green' : 'red'}>{park.parkStatus}</Tag>
              </div>
            </div>
          </div>
          <Tabs
            defaultActiveKey="information"
            items={tabsItems}
            renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="border-b-[1px] border-gray-400" />}
            className="md:mt-0 md:p-0"
          />
          <div className="p-4">
            <div className="mb-4 md:hidden">
              <Tag color={park.parkStatus === 'OPEN' ? 'green' : 'red'}>{park.parkStatus}</Tag>
            </div>
            <Typography.Paragraph
              ellipsis={{
                rows: 3,
                expandable: true,
                symbol: 'more',
              }}
            >
              {park.description}
            </Typography.Paragraph>
            {park.address && (
              <Typography.Paragraph>
                <strong>Address:</strong> {park.address}
              </Typography.Paragraph>
            )}
            {park.contactNumber && (
              <Typography.Paragraph>
                <strong>Contact:</strong> {park.contactNumber}
              </Typography.Paragraph>
            )}
          </div>
          <div className="mt-4">
            <LogoText className="text-2xl font-bold md:text-2xl md:font-semibold md:py-2 md:m-0 mb-2">Opening Hours</LogoText>
            <table className="table-auto text-sm border-collapse border border-gray-300">
              <tbody>
                {formatHours(park.openingHours, park.closingHours).map(({ day, hours }, index) => (
                  <tr key={index} className="border border-gray-300">
                    <td className="pr-4 font-semibold p-2">{day}</td>
                    <td className="p-2">{hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorViewParkDetails;
