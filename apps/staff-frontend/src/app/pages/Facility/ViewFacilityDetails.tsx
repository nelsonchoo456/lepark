import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { getFacilityById, FacilityResponse, StaffResponse, StaffType, FacilityStatusEnum, FacilityTypeEnum } from '@lepark/data-access';
import { Button, Card, Descriptions, Tabs, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import PageHeader2 from '../../components/main/PageHeader2';
import moment from 'moment';
import InformationTab from './components/InformationTab';
import LocationTab from './components/LocationTab';
import FacilityCarousel from './components/FacilityCarousel';
import { FaCalendarCheck, FaCalendarTimes, FaUsers, FaUmbrella, FaUserSlash, FaCloudRain } from 'react-icons/fa';
import { RiEdit2Line } from 'react-icons/ri';
import { useRestrictFacilities } from '../../hooks/Facilities/useRestrictFacilities';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import CameraSensorTab from './components/CameraSensorTab';

const ViewFacilityDetails = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const { facility, park, loading, triggerFetch } = useRestrictFacilities(facilityId);

  const breadcrumbItems = [
    {
      title: 'Facility Management',
      pathKey: '/facilities',
      isMain: true,
    },
    {
      title: facility?.name ? facility.name : 'Details',
      pathKey: `/facilities/${facility?.id}`,
      isCurrent: true,
    },
  ];

  const descriptionsItems = [
    {
      key: 'facilityType',
      label: 'Facility Type',
      children: (() => {
        const formattedType = formatEnumLabelToRemoveUnderscores(facility?.facilityType ?? '');
        return formattedType;
      })(),
    },
    {
      key: 'facilityStatus',
      label: 'Facility Status',
      children: (() => {
        switch (facility?.facilityStatus) {
          case FacilityStatusEnum.OPEN:
            return <Tag color="green" bordered={false}>{formatEnumLabelToRemoveUnderscores(facility?.facilityStatus)}</Tag>;
          case FacilityStatusEnum.UNDER_MAINTENANCE:
            return <Tag color="yellow" bordered={false}>{formatEnumLabelToRemoveUnderscores(facility?.facilityStatus)}</Tag>;
          case FacilityStatusEnum.CLOSED:
            return <Tag color="red" bordered={false}>{formatEnumLabelToRemoveUnderscores(facility?.facilityStatus)}</Tag>;
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
      children: facility ? <LocationTab facility={facility} park={park} /> : <p>Loading facility data...</p>,
    },
    {
      key: 'crowd',
      label: 'Crowd',
      children: facility ? <CameraSensorTab facility={facility} park={park} triggerFetchFacility={triggerFetch}/> : <p>Loading crowd data...</p>,
    },
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
            <div className="w-full flex justify-between items-center">
              <LogoText className="text-2xl py-2 m-0">{facility?.name}</LogoText>
              {user?.role !== StaffType.ARBORIST && user?.role !== StaffType.BOTANIST ? (
                <Button icon={<RiEdit2Line className="text-lg ml-auto mr-0 r-0" />} type="text" onClick={() => navigate(`edit`)} />
              ) : null}
            </div>
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
