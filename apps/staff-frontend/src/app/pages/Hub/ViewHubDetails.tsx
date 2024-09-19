import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { getHubById, HubResponse } from '@lepark/data-access';
import { Card, Descriptions, Tabs, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { FiCloud, FiSun } from 'react-icons/fi';
import { useParams } from 'react-router';
import PageHeader2 from '../../components/main/PageHeader2';
import moment from 'moment';
import InformationTab from './components/InformationTab';
import HubCarousel from './components/HubCarousel';

const ViewHubDetails = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const [hub, setHub] = useState<HubResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (hubId) {
        try {
          const hubResponse = await getHubById(hubId);
          setHub(hubResponse.data);
        } catch (error) {
          console.error('Error fetching hub data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [hubId]);

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
      key: 'serialNumber',
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
              return <Tag color="silver">INACTIVE</Tag>;
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
      key: 'nextMaintenanceDate',
      label: 'Next Maintenance Date',
      children: hub?.nextMaintenanceDate ? moment(hub.nextMaintenanceDate).format('D MMM YY') : null,
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
  ];

  const tabsItems = [
    {
      key: 'information',
      label: 'Information',
      children: hub ? <InformationTab hub={hub} /> : <p>Loading hub data...</p>,
    },
  ];

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
            <Descriptions items={descriptionsItems} column={1} size="small" className="mb-4" />
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
