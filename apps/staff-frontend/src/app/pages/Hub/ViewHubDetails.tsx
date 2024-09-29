import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { FacilityResponse, getFacilityById, getParkById, ParkResponse, StaffResponse } from '@lepark/data-access';
import { Card, Descriptions, Spin, Tabs, Tag } from 'antd';
import moment from 'moment';
import { useParams } from 'react-router';
import PageHeader2 from '../../components/main/PageHeader2';
import { useRestrictHub } from '../../hooks/Hubs/useRestrictHubs';
import HubCarousel from './components/HubCarousel';
import InformationTab from './components/InformationTab';

const ViewHubDetails = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const { hub, loading } = useRestrictHub(hubId);
  const { user } = useAuth<StaffResponse>();

  const breadcrumbItems = [
    {
      title: 'Hub Management',
      pathKey: '/hubs',
      isMain: true,
    },
    {
      title: hub?.name ? hub?.name : 'Details',
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
        switch (hub?.hubStatus) {
          case 'ACTIVE':
            return <Tag color="green">ACTIVE</Tag>;
          case 'INACTIVE':
            return <Tag color="gray">INACTIVE</Tag>;
          case 'UNDER_MAINTENANCE':
            return <Tag color="yellow">UNDER MAINTENANCE</Tag>;
          case 'DECOMMISSIONED':
            return <Tag color="red">DECOMMISSIONED</Tag>;
          default:
            return <Tag>{hub?.hubStatus}</Tag>;
        }
      })(),
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      children: hub?.ipAddress,
    },
    {
      key: 'macAddress',
      label: 'MAC Address',
      children: hub?.macAddress,
    },
    {
      key: 'radioGroup',
      label: 'Radio Group',
      children: hub?.radioGroup,
    },
    {
      key: 'hubSecret',
      label: 'Hub Secret',
      children: hub?.hubSecret,
    },
    {
      key: 'name',
      label: 'Facility',
      children: hub?.facility?.name,
    },
  ];

  if (hub?.nextMaintenanceDate) {
    descriptionsItems.push({
      key: 'nextMaintenanceDate',
      label: 'Next Maintenance Date',
      children: moment(hub.nextMaintenanceDate).format('D MMM YY'),
    });
  }

  const descriptionsItemsForSuperAdmin = [
    ...descriptionsItems,
    {
      key: 'parkName',
      label: 'Park Name',
      children: hub?.park?.name,
    },
  ];

  const tabsItems = [
    {
      key: 'information',
      label: 'Information',
      children: hub ? <InformationTab hub={hub} /> : <p>Loading hub data...</p>,
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
          <div className="w-full md:w-1/2 lg:w-1/2 ">
            <HubCarousel images={hub?.images || []} />
          </div>

          <div className="flex-1 flex-col flex">
            <LogoText className="text-2xl py-2 m-0">{hub?.name}</LogoText>
            <Descriptions
              items={user?.role === 'SUPERADMIN' ? descriptionsItemsForSuperAdmin : descriptionsItems}
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
