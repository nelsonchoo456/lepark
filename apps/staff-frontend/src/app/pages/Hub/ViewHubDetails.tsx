import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import {
  FacilityResponse,
  getFacilityById,
  getParkById,
  getSensorsByHubId,
  HubResponse,
  ParkResponse,
  removeHubFromZone,
  SensorResponse,
  StaffResponse,
  StaffType,
} from '@lepark/data-access';
import { Card, Descriptions, Spin, Tabs, Tag, Carousel, Empty, Button, message, Alert, Flex, Result } from 'antd';
import moment from 'moment';
import { useParams } from 'react-router';
import PageHeader2 from '../../components/main/PageHeader2';
import { useRestrictHub } from '../../hooks/Hubs/useRestrictHubs';
import InformationTab from './components/InformationTab';
import LocationTab from './components/LocationTab';
import { useFetchZones } from '../../hooks/Zones/useFetchZones';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { IoLocationOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import ZoneTab from './components/ZoneTab';
import { useEffect, useState } from 'react';
import SensorsTab from './components/SensorsTab';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { MdError } from 'react-icons/md';

const ViewHubDetails = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const { hub, loading, triggerFetch } = useRestrictHub(hubId);
  const { user } = useAuth<StaffResponse>();
  const { zones } = useFetchZones();
  const navigate = useNavigate();
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [updatedData, setUpdatedData] = useState<HubResponse>();

  const [sensors, setSensors] = useState<SensorResponse[]>();

  const canActivateEdit = user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER;

  useEffect(() => {
    if (hub) {
      fetchSensors(hub.id);
    }
  }, [hub]);

  const fetchSensors = async (hubId: string) => {
    try {
      const sensorsRes = await getSensorsByHubId(hubId);
      if (sensorsRes.status === 200) {
        setSensors(sensorsRes.data);
      }
    } catch (e) {
      //
    }
  };

  // Deactivate utility
  const cancelDeactivate = () => {
    setDeactivateModalOpen(false);
  };

  const showDeactivateModal = () => {
    setDeactivateModalOpen(true);
  };

  const handleDeactivateHub = async () => {
    try {
      if (!hub) {
        throw new Error('Unable to deactivate Hub a this time.');
      }
      const hubRes = await removeHubFromZone(hub.id);

      if (hubRes.status === 200) {
        setUpdatedData(hubRes.data);
        
        setTimeout(() => {
          setDeactivateModalOpen(false);
          triggerFetch();
        }, 2000);
      }
    } catch (error) {
      console.log(error);
      if (
        error === 'Hub is not assigned to any zone' ||
        error === 'Hub must be active to be removed from a zone' ||
        error === 'Hub not found'
      ) {
        messageApi.open({
          type: 'error',
          content: error,
        });
        setDeactivateModalOpen(false);
      } else if (error === 'Hub has sensors assigned to it. Remove the sensors first.') {
        messageApi.open({
          type: 'error',
          content: error,
        });
        setDeactivateModalOpen(false);
      } else {
        messageApi.open({
          type: 'error',
          content: `Unable to deactivate Hub at this time. Please try again later.`,
        });
        setDeactivateModalOpen(false);
      }
    }
  };

  const breadcrumbItems = [
    {
      title: 'Hub Management',
      pathKey: '/hubs',
      isMain: true,
    },
    {
      title: hub?.identifierNumber ? hub?.identifierNumber : 'Details',
      pathKey: `/hubs/${hub?.id}`,
      isCurrent: true,
    },
  ];

  const descriptionsItems = [
    {
      key: 'identifierNumber',
      label: 'Identifier Number',
      children: hub?.identifierNumber,
    },
    {
      key: 'hubStatus',
      label: 'Hub Status',
      children: (() => {
        const formattedStatus = formatEnumLabelToRemoveUnderscores(hub?.hubStatus ?? '');
        switch (hub?.hubStatus) {
          case 'ACTIVE':
            return (
              <div className="flex w-full items-start justify-between">
                <Tag color="green" bordered={false}>
                  {formattedStatus}
                </Tag>
                {canActivateEdit && (
                  <Button type="primary" onClick={() => showDeactivateModal()} className="-mt-1" danger>
                    Deactivate
                  </Button>
                )}
              </div>
            );
          case 'INACTIVE':
            return (
              <Tag color="blue" bordered={false}>
                {formattedStatus}
              </Tag>
            );
          case 'UNDER_MAINTENANCE':
            return (
              <Tag color="yellow" bordered={false}>
                {formattedStatus}
              </Tag>
            );
          case 'DECOMMISSIONED':
            return (
              <Tag color="red" bordered={false}>
                {formattedStatus}
              </Tag>
            );
          default:
            return <Tag>{formattedStatus}</Tag>;
        }
      })(),
    },
    ...(user?.role === StaffType.SUPERADMIN
      ? [
          {
            key: 'parkName',
            label: 'Park Name',
            children: hub?.park?.name ?? '-',
          },
        ]
      : []),
    ...(hub?.zone
      ? [
          {
            key: 'zone',
            label: 'Zone Location',
            children: hub?.zone?.name,
          },
        ]
      : [
          {
            key: 'name',
            label: 'Storage Location',
            children: (
              <div className="flex w-full items-start justify-between">
                {hub?.facility?.name}{' '}
                {hub?.hubStatus === 'INACTIVE' && canActivateEdit && (
                  <Button
                    type="primary"
                    icon={<IoLocationOutline />}
                    onClick={() => navigate(`/hubs/${hub?.id}/place-in-zone`)}
                    className="-mt-1"
                  >
                    Activate
                  </Button>
                )}
              </div>
            ),
          },
        ]),
  ];

  const tabsItems = [
    {
      key: 'information',
      label: 'Information',
      children: hub ? <InformationTab hub={hub} /> : <p>Loading hub data...</p>,
    },
    ...(hub?.zone && hub.lat && hub.long
      ? [
          {
            key: 'zone',
            label: 'Zone Location',
            children: hub ? (
              <ZoneTab hub={hub} lat={hub.lat} lng={hub.long} park={hub.park} zone={hub.zone} zones={zones} sensors={sensors} />
            ) : (
              <p>Loading hub data...</p>
            ),
          },
          {
            key: 'sensors',
            label: 'Connected Sensors',
            children: hub ? <SensorsTab hub={hub} zone={hub.zone} sensors={sensors} fetchSensors={() => fetchSensors(hub.id)}/> : <p>Loading Sensors data...</p>,
          },
        ]
      : [
          {
            key: 'location',
            label: 'Storeroom Location',
            children: hub ? <LocationTab facility={hub.facility} park={hub.park} zones={zones} /> : <p>Loading hub data...</p>,
          },
        ]),
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
      {contextHolder}
      {sensors && sensors.length > 0 ? (
        <ConfirmDeleteModal
          okText="Confirm Deactivate"
          onConfirm={handleDeactivateHub}
          open={deactivateModalOpen}
          onCancel={cancelDeactivate}
          // Restrict if have Sensors
          title="Unable to deactivate Hub"
          footer={null}
          description={
            <p>
              {' '}
              <MdError className="text-error inline mr-2 text-lg" />
              This Hub has <strong className="text-error">{sensors.length}</strong> Sensor(s) assigned to it. Please deactivate the
              Sensor(s) first.
            </p>
          }
        ></ConfirmDeleteModal>
      ) : (
        <ConfirmDeleteModal
          okText="Confirm Deactivate"
          onConfirm={handleDeactivateHub}
          open={deactivateModalOpen}
          onCancel={cancelDeactivate}
          title="Deactivation of Hub"
          
          // For Success
          description={updatedData ? undefined : "Deactivating a Hub will remove the Hub from its current Zone."}
          footer={updatedData && null}
          closable={!updatedData}
        >
          {/* For Success */}
          {updatedData && <Result
            status="success"
            title={updatedData ? `Deactivated ${updatedData.name}` : 'Deactivated Hub'}
            subTitle="Returning to Hub Details Page..."
          />}
        </ConfirmDeleteModal>
      )}

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
