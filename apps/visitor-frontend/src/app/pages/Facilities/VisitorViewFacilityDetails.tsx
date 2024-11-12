import { Tabs, Typography, Tag, Button } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import SpeciesCarousel from '../Taxonomy/components/SpeciesCarousel';
import FacilityInformationTab from './components/FacilityInformationTab';
import { LogoText } from '@lepark/common-ui';
import moment from 'moment';
import { useRestrictFacilities } from '../../hooks/Facilities/useRestrictFacilities';
import withParkGuard from '../../park-context/withParkGuard';

const { Title } = Typography;

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const formatHours = (openingHours: string[], closingHours: string[]) => {
  return daysOfWeek.map((day, index) => {
    const opening = openingHours[index] ? moment(openingHours[index], 'HH:mm').format('h:mm A') : 'Closed';
    const closing = closingHours[index] ? moment(closingHours[index], 'HH:mm').format('h:mm A') : 'Closed';
    return { day, hours: `${opening} - ${closing}` };
  });
};

const VisitorViewFacilityDetails = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const { facility, park, loading } = useRestrictFacilities(facilityId);
  const navigate = useNavigate();

  const tabsItems = [
    {
      key: 'information',
      label: 'Information',
      children: facility ? <FacilityInformationTab facility={facility} /> : <p>Loading facility data...</p>,
    },
    // Add other tabs if necessary
  ];

  const navigateToBooking = (facilityId: string) => {
    navigate(`/facility/${facilityId}/book`);
  };

  return (
    <div className="md:p-4 md:h-screen md:overflow-hidden">
      <div className="w-full gap-4 md:flex md:h-full md:overflow-hidden">
        <div className="md:w-2/5 h-96">
          <div className="z-20 absolute w-full flex justify-between p-4">
            <div className="md:hidden backdrop-blur bg-white/75 px-6 py-2 z-20 rounded-full box-shadow-md">
              <LogoText className="text-3xl font-bold md:text-2xl md:font-semibold md:py-2 md:m-0 leading-tight pb-1">
                {facility?.name}
              </LogoText>
            </div>
          </div>
          <SpeciesCarousel images={facility?.images || []} />
        </div>
        <div className="flex-[3] flex-col flex p-4 md:p-0 md:h-full md:overflow-x-auto">
          <div className="hidden md:flex items-start">
            <div className="flex-0">
              <LogoText className="text-3xl font-bold md:text-2xl md:font-semibold md:py-2 md:m-0 leading-tight pb-1">
                {facility?.name}
              </LogoText>
            </div>
          </div>
          <Tabs
            defaultActiveKey="information"
            items={tabsItems}
            renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="border-b-[1px] border-gray-400" />}
            className="md:mt-0 md:p-0"
          />
          <div className="mt-4">
            <LogoText className="text-2xl font-bold md:text-2xl md:font-semibold md:py-2 md:m-0 mb-2 leading-tight pb-1">
              Opening Hours
            </LogoText>
            <table className="table-auto text-sm border-collapse border border-gray-300">
              <tbody>
                {facility &&
                  formatHours(facility.openingHours, facility.closingHours).map(({ day, hours }, index) => (
                    <tr key={index} className="border border-gray-300">
                      <td className="pr-4 font-semibold p-2">{day}</td>
                      <td className="p-2">{hours}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            {facility?.isBookable && (
              <Button type="primary" className="w-full" onClick={() => facilityId && navigateToBooking(facilityId)}>
                Book Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withParkGuard(VisitorViewFacilityDetails);
