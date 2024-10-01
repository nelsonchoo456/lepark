import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { FacilityResponse, getFacilityById, getParkById, ParkResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { Card, Descriptions, Spin, Tabs, Tag, Carousel, Empty } from 'antd';
import moment from 'moment';
import { useParams } from 'react-router';
import PageHeader2 from '../../components/main/PageHeader2';
import { useRestrictHub } from '../../hooks/Hubs/useRestrictHubs';
import InformationTab from './components/InformationTab';
import LocationTab from './components/LocationTab';
import { useFetchZones } from '../../hooks/Zones/useFetchZones';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const ViewHubDetails = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const { hub, loading } = useRestrictHub(hubId);
  const { user } = useAuth<StaffResponse>();
  const { zones } = useFetchZones();

  const breadcrumbItems = [
    {
      title: 'Hub Management',
      pathKey: '/hubs',
      isMain: true,
    },
    {
      title: hub?.serialNumber ? hub?.serialNumber : 'Details',
      pathKey: `/hubs/${hub?.id}`,
      isCurrent: true,
    },
  ];

  const descriptionsItems = [
    {
      key: 'serialNo',
      label: 'Serial Number',
      children: hub?.serialNumber,
    },
    {
      key: 'hubStatus',
      label: 'Hub Status',
      children: (() => {
        const formattedStatus = formatEnumLabelToRemoveUnderscores(hub?.hubStatus ?? '');
        switch (hub?.hubStatus) {
          case 'ACTIVE':
            return <Tag color="green">{formattedStatus}</Tag>;
          case 'INACTIVE':
            return <Tag color="blue">{formattedStatus}</Tag>;
          case 'UNDER_MAINTENANCE':
            return <Tag color="yellow">{formattedStatus}</Tag>;
          case 'DECOMMISSIONED':
            return <Tag color="red">{formattedStatus}</Tag>;
          default:
            return <Tag>{formattedStatus}</Tag>;
        }
      })(),
    },
    {
      key: 'nextMaintenanceDate',
      label: 'Next Maintenance Date',
      children: hub?.nextMaintenanceDate ? moment(hub.nextMaintenanceDate).format('MMMM D, YYYY') : '-',
    },
    ...(user?.role === StaffType.SUPERADMIN ? [
      {
        key: 'parkName',
        label: 'Park Name',
        children: hub?.park?.name ?? '-',
      },
    ] : []),
    {
      key: 'name',
      label: 'Facility',
      children: hub?.facility?.name,
    },
  ];

  const tabsItems = [
    {
      key: 'information',
      label: 'Information',
      children: hub ? <InformationTab hub={hub} /> : <p>Loading hub data...</p>,
    },
    {
      key: 'location',
      label: 'Storeroom Location',
      children: hub ? <LocationTab facility={hub.facility} park={hub.park} zones={zones} /> : <p>Loading hub data...</p>,
    },
  ];

  if (loading) {
    return (
      <ContentWrapperDark style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </ContentWrapperDark>
    );
  }

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <div className="md:flex w-full gap-4">
          <div className="h-64 flex-1 max-w-full overflow-hidden rounded-lg shadow-lg">
            {hub?.images && hub.images.length > 0 ? (
              <Carousel style={{ maxWidth: '100%' }}>
                {hub.images.map((url, index) => (
                  <div key={index}>
                    <div
                      style={{
                        backgroundImage: `url('${url}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: 'white',
                        overflow: 'hidden',
                      }}
                      className="h-64 max-h-64 flex-1 rounded-lg shadow-lg p-4"
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <Empty description="No Image" />
              </div>
            )}
          </div>

          <div className="flex-1 flex-col flex">
            <LogoText className="text-2xl py-2 m-0">{hub?.name}</LogoText>
            <Descriptions
              items={descriptionsItems}
              column={1}
              size="small"
              className="mb-4"
            />
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

export default ViewHubDetails;
