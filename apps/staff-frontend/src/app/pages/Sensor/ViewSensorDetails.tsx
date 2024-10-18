import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@lepark/common-ui';
import {
  FacilityResponse,
  ParkResponse,
  SensorResponse,
  StaffResponse,
  StaffType,
  getFacilityById,
  getParkById,
  getSensorById,
  removeSensorFromHub,
} from '@lepark/data-access';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import PageHeader2 from '../../components/main/PageHeader2';
import { Card, Descriptions, Tabs, Tag, Spin, Carousel, Empty, Button, message, Modal, Result, Tooltip } from 'antd';
import moment from 'moment';
import InformationTab from './components/InformationTab';
import { useRestrictSensors } from '../../hooks/Sensors/useRestrictSensors';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { useFetchZones } from '../../hooks/Zones/useFetchZones';
import LocationTab from './components/LocationTab';
import { MdOutlineHub } from 'react-icons/md';
import ZoneTab from './components/ZoneTab';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { LuUnplug } from 'react-icons/lu';
import { RiExternalLinkLine } from 'react-icons/ri';
import SensorReadingsTab from './components/SensorReadingsTab';

const formatSensorType = (type: string): string => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const ViewSensorDetails = () => {
  const { sensorId } = useParams<{ sensorId: string }>();
  const { sensor, loading, triggerFetch } = useRestrictSensors(sensorId);
  const { user } = useAuth<StaffResponse>();
  const { zones } = useFetchZones();
  const navigate = useNavigate();
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [updatedData, setUpdatedData] = useState<SensorResponse>();

  const canActivateEdit = user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER;

  // Deactivate utility
  const cancelDeactivate = () => {
    setDeactivateModalOpen(false);
  };

  const showDeactivateModal = () => {
    setDeactivateModalOpen(true);
  };

  const handleDeactivateSensor = async () => {
    try {
      if (!sensor) {
        throw new Error('Unable to deactivate Sensor a this time.');
      }
      const sensorRes = await removeSensorFromHub(sensor.id);
      if (sensorRes.status === 200) {
        setUpdatedData(sensorRes.data);

        setTimeout(() => {
          setDeactivateModalOpen(false);
          triggerFetch();
        }, 2000);
      }
    } catch (error) {
      console.log(error);
      if (
        error === 'Sensor is not assigned to any hub' ||
        error === 'Sensor must be active to be removed from a hub' ||
        error === 'Sensor not found'
      ) {
        messageApi.open({
          type: 'error',
          content: error,
        });
        setDeactivateModalOpen(false);
      } else {
        messageApi.open({
          type: 'error',
          content: `Unable to deactivate Sensor at this time. Please try again later.`,
        });
        setDeactivateModalOpen(false);
      }
    }
  };

  const breadcrumbItems = [
    {
      title: 'Sensor Management',
      pathKey: '/sensor',
      isMain: true,
    },
    {
      title: sensor?.identifierNumber ? sensor?.identifierNumber : 'Details',
      pathKey: `/sensor/${sensor?.id}`,
      isCurrent: true,
    },
  ];

  const descriptionsItems = [
    {
      key: 'identifierNumber',
      label: 'Identifier Number',
      children: sensor?.identifierNumber,
    },
    {
      key: 'sensorStatus',
      label: 'Sensor Status',
      children: (() => {
        switch (sensor?.sensorStatus) {
          case 'ACTIVE':
            return (
              <div className="flex w-full items-start justify-between">
                <Tag color="green" bordered={false}>
                  {formatEnumLabelToRemoveUnderscores(sensor.sensorStatus)}
                </Tag>
                {canActivateEdit && (
                  <Button type="primary" onClick={() => showDeactivateModal()} className="-mt-1" danger icon={<LuUnplug />}>
                    Deactivate
                  </Button>
                )}
              </div>
            );
          case 'INACTIVE':
            return (
              <Tag color="blue" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(sensor.sensorStatus)}
              </Tag>
            );
          case 'UNDER_MAINTENANCE':
            return (
              <Tag color="orange" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(sensor.sensorStatus)}
              </Tag>
            );
          case 'DECOMMISSIONED':
            return (
              <Tag color="red" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(sensor.sensorStatus)}
              </Tag>
            );
          default:
            return <Tag>{formatEnumLabelToRemoveUnderscores(sensor?.sensorStatus ?? '')}</Tag>;
        }
      })(),
    },
    { key: 'sensorType', label: 'Sensor Type', children: formatEnumLabelToRemoveUnderscores(sensor?.sensorType ?? '') },
    // {
    //   key: 'nextMaintenanceDate',
    //   label: 'Next Maintenance Date',
    //   children: sensor?.nextMaintenanceDate ? moment(sensor.nextMaintenanceDate).format('MMMM D, YYYY') : '-',
    // },
    ...(user?.role === StaffType.SUPERADMIN
      ? [
          {
            key: 'parkName',
            label: 'Park',
            children: sensor?.park?.name ?? '-',
          },
        ]
      : []),
    ...(sensor?.hub
      ? [
          {
            key: 'hub',
            label: 'Hub',
            children: (
              <p>
                {sensor.hub?.name}
                <Tooltip title="View Hub Details">
                  <Button
                    icon={<RiExternalLinkLine />}
                    type="link"
                    className="inline -mt-2"
                    onClick={() => navigate(`/hubs/${sensor.hub?.id}`)}
                  />
                </Tooltip>
              </p>
            ),
          },
        ]
      : [
          {
            key: 'name',
            label: 'Storage Location',
            children: (
              <div className="flex w-full items-start justify-between">
                {sensor?.facility?.name}{' '}
                {canActivateEdit && sensor?.sensorStatus === 'INACTIVE' && (
                  <Button
                    type="primary"
                    icon={<MdOutlineHub />}
                    onClick={() => navigate(`/sensor/${sensor?.id}/add-to-hub`)}
                    className="-mt-1"
                  >
                    Add to Hub
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
      children: sensor ? <InformationTab sensor={sensor} /> : <p>Loading sensor data...</p>,
    },
    ...(sensor?.hub && sensor.lat && sensor.long
      ? [
          {
            key: 'zone',
            label: 'Zone & Hub',
            children: <ZoneTab hub={sensor.hub} sensor={sensor} lat={sensor.lat} lng={sensor.long} park={sensor.park} zones={zones} />,
          },
        ]
      : [
          sensor && sensor.facility
            ? {
                key: 'location',
                label: 'Storeroom Location',
                children: <LocationTab facility={sensor.facility} park={sensor.park} zones={zones} />,
              }
            : null,
        ]),
    sensor?.sensorStatus === 'ACTIVE'
      ? {
          key: 'readings',
          label: 'Sensor Readings',
          children: sensor ? <SensorReadingsTab sensorId={sensor.id} /> : <p>Loading sensor readings...</p>,
        }
      : null,
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
      <ConfirmDeleteModal
        title="Deactivation of Sensor"
        okText="Confirm Deactivate"
        onConfirm={handleDeactivateSensor}
        open={deactivateModalOpen}
        onCancel={cancelDeactivate}
        // For Success
        description={
          updatedData ? undefined : 'Deactivating a Sensor will disconnect it from its assigned Hub and remove it from the Zone.'
        }
        footer={updatedData && null}
        closable={!updatedData}
      >
        {/* For Success */}
        {updatedData && (
          <Result
            status="success"
            title={updatedData ? `Deactivated ${updatedData.name}` : 'Deactivated Sensor'}
            subTitle="Returning to Sensor Details Page..."
          />
        )}
      </ConfirmDeleteModal>
      <Card>
        <div className="md:flex w-full gap-4">
          <div className="h-64 flex-1 max-w-full overflow-hidden rounded-lg shadow-lg">
            {sensor?.images && sensor.images.length > 0 ? (
              <Carousel style={{ maxWidth: '100%' }}>
                {sensor.images.map((url) => (
                  <div key={url}>
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
            <LogoText className="text-2xl py-2 m-0">{sensor?.name}</LogoText>
            <Descriptions items={descriptionsItems} column={1} size="small" className="mb-4" />
            {/* <Button type="primary" className="w-24" onClick={() => navigate(`/sensor/${sensor?.id}/add-to-hub`)}>
              Add to Hub
            </Button> */}
          </div>
        </div>

        <Tabs
          centered
          defaultActiveKey="information"
          items={tabsItems.filter((item) => item !== null)}
          renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="border-b-[1px] border-gray-400" />}
          className="mt-4"
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default ViewSensorDetails;
