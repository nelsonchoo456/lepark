import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { getFacilityById, FacilityResponse } from '@lepark/data-access';
import { Card, Descriptions, Tabs, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import PageHeader2 from '../../components/main/PageHeader2';
import moment from 'moment';
import InformationTab from './components/InformationTab';
import LocationTab from './components/LocationTab';
import FacilityCarousel from './components/FacilityCarousel';
import { FaCalendarCheck, FaCalendarTimes, FaUsers, FaUmbrella, FaUserSlash, FaCloudRain } from 'react-icons/fa';

const ViewFacilityDetails = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const [facility, setFacility] = useState<FacilityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (facilityId) {
        try {
          const facilityResponse = await getFacilityById(facilityId);
          setFacility(facilityResponse.data);
        } catch (error) {
          console.error('Error fetching facility data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [facilityId]);

  const breadcrumbItems = [
    {
      title: 'Facility Management',
      pathKey: '/facilities',
      isMain: true,
    },
    {
      title: facility?.facilityName ? facility.facilityName : 'Details',
      pathKey: `/facilities/${facility?.id}`,
      isCurrent: true,
    },
  ];

  const descriptionsItems = [
    {
      key: 'facilityType',
      label: 'Facility Type',
      children: facility?.facilityType,
    },
    {
      key: 'facilityStatus',
      label: 'Facility Status',
      children: (() => {
        switch (facility?.facilityStatus) {
          case 'OPEN':
            return <Tag color="green">ACTIVE</Tag>;
          case 'MAINTENANCE':
            return <Tag color="yellow">UNDER MAINTENANCE</Tag>;
          case 'CLOSED':
            return <Tag color="red">CLOSED</Tag>;
          default:
            return <Tag>{facility?.facilityStatus}</Tag>;
        }
      })(),
    },
  ];

  const tabsItems = [
    {
      key: 'information',
      label: 'Information',
      children: facility ? <InformationTab facility={facility} /> : <p>Loading facility data...</p>,
    },
    {
      key: 'location',
      label: 'Location',
      children: facility ? <LocationTab facility={facility} /> : <p>Loading facility data...</p>,
    }
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <div className="md:flex w-full gap-4">
          <div className="w-full md:w-1/2 lg:w-1/2 ">
            <FacilityCarousel images={facility?.images || []} />
          </div>

          <div className="flex-1 flex-col flex">
            <LogoText className="text-2xl py-2 m-0">{facility?.facilityName}</LogoText>
            <Descriptions items={descriptionsItems} column={1} size="small" className="mb-4" />

            <div className="flex h-24 w-full gap-2 mt-auto">
              <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                {facility?.isBookable ? <FaCalendarCheck className="text-3xl mt-2" /> : <FaCalendarTimes className="text-3xl mt-2" />}
                <p className="text-xs mt-2">{facility?.isBookable ? 'Bookable' : 'Not Bookable'}</p>
              </div>
              <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                  {facility?.isPublic ? <FaUsers className="text-3xl mt-2" /> : <FaUserSlash className="text-3xl mt-2" />}
                  <p className="text-xs mt-2">{facility?.isPublic ? 'Open to public' : 'Not open to public'}</p>
                </div>
              </div>
              <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                <div className="bg-green-50 h-full w-20 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                  {facility?.isSheltered ? <FaUmbrella className="text-3xl mt-2" /> : <FaCloudRain className="text-3xl mt-2" />}
                  <p className="text-xs mt-2">{facility?.isSheltered ? 'Sheltered' : 'Not sheltered'}</p>
                </div>
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

export default ViewFacilityDetails;
