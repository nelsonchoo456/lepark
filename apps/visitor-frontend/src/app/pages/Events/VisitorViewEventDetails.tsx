import { Tabs, Typography, Tag, Button } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { LogoText } from '@lepark/common-ui';
import moment from 'moment';
import { useRestrictEvents } from '../../hooks/Events/useRestrictEvents';
import EventInformationTab from './components/EventInformationTab';
import SpeciesCarousel from '../Taxonomy/components/SpeciesCarousel';
import withParkGuard from '../../park-context/withParkGuard';

const { Title } = Typography;

const VisitorViewEventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { event, facility, park, loading } = useRestrictEvents(eventId);
  const navigate = useNavigate();

  const tabsItems = [
    {
      key: 'information',
      label: 'Information',
      children: event ? <EventInformationTab event={event} /> : <p>Loading event data...</p>,
    },
    // Add other tabs if necessary
  ];

  const navigateToListings = (eventId: string) => {
    navigate(`/event/${eventId}/listings`);
  };

  return (
    <div className="md:p-4 md:h-screen md:overflow-hidden">
      <div className="w-full gap-4 md:flex md:h-full md:overflow-hidden">
        <div className="md:w-2/5 h-96">
          <div className="z-20 absolute w-full flex justify-between p-4">
            <div className="md:hidden backdrop-blur bg-white/75 px-6 py-2 z-20 rounded-full box-shadow-md">
              <LogoText className="text-3xl font-bold md:text-2xl md:font-semibold md:py-2 md:m-0 leading-tight pb-1">
                {event?.title}
              </LogoText>
            </div>
          </div>
          <SpeciesCarousel images={event?.images || []} />
        </div>
        <div className="flex-[3] flex-col flex p-4 md:p-0 md:h-full md:overflow-x-auto">
          <div className="hidden md:flex items-start">
            <div className="flex-0">
              <LogoText className="text-3xl font-bold md:text-2xl md:font-semibold md:py-2 md:m-0 leading-tight pb-1">
                {event?.title}
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
              Event Schedule
            </LogoText>
            <table className="table-auto text-sm border-collapse border border-gray-300">
              <tbody>
                {event && (
                  <tr className="border border-gray-300">
                    <td className="pr-4 font-semibold p-2">Start Date</td>
                    <td className="p-2">{moment(event.startDate).format('MMMM D, YYYY, h:mm A')}</td>
                  </tr>
                )}
                {event && (
                  <tr className="border border-gray-300">
                    <td className="pr-4 font-semibold p-2">End Date</td>
                    <td className="p-2">{moment(event.endDate).format('MMMM D, YYYY, h:mm A')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Button type="primary" className="w-full" onClick={() => eventId && navigateToListings(eventId)}>
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withParkGuard(VisitorViewEventDetails);
