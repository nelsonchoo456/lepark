import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
} from '@lepark/data-access';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import PageHeader2 from '../../components/main/PageHeader2';
import { Card, Descriptions, Tabs, Tag, Spin, Carousel, Empty } from 'antd';
import moment from 'moment';
import InformationTab from './components/InformationTab';
import { useRestrictSensors } from '../../hooks/Sensors/useRestrictSensors';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const formatSensorType = (type: string): string => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const ViewSensorDetails = () => {
  const { sensorId } = useParams<{ sensorId: string }>();
  const { sensor, loading } = useRestrictSensors(sensorId);
  const [facility, setFacility] = useState<FacilityResponse | null>(null);
  const [park, setPark] = useState<ParkResponse | null>(null);
  const { user } = useAuth<StaffResponse>();

  const breadcrumbItems = [
    {
      title: 'Sensor Management',
      pathKey: '/sensor',
      isMain: true,
    },
    {
      title: sensor?.serialNumber ? sensor?.serialNumber : 'Details',
      pathKey: `/sensor/${sensor?.id}`,
      isCurrent: true,
    },
  ];

  const descriptionsItems = [
    {
      key: 'serialNumber',
      label: 'Serial Number',
      children: sensor?.serialNumber,
    },
    {
      key: 'sensorStatus',
      label: 'Sensor Status',
      children: (() => {
        switch (sensor?.sensorStatus) {
          case 'ACTIVE':
            return <Tag color="green">{formatEnumLabelToRemoveUnderscores(sensor.sensorStatus)}</Tag>;
          case 'INACTIVE':
            return <Tag color="blue">{formatEnumLabelToRemoveUnderscores(sensor.sensorStatus)}</Tag>;
          case 'UNDER_MAINTENANCE':
            return <Tag color="orange">{formatEnumLabelToRemoveUnderscores(sensor.sensorStatus)}</Tag>;
          case 'DECOMMISSIONED':
            return <Tag color="red">{formatEnumLabelToRemoveUnderscores(sensor.sensorStatus)}</Tag>;
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
    {
      key: 'name',
      label: 'Facility',
      children: sensor?.facility?.name,
    },
  ];

  console.log('sensor', sensor);

  const tabsItems = [
    {
      key: 'information',
      label: 'Information',
      children: sensor ? <InformationTab sensor={sensor} /> : <p>Loading sensor data...</p>,
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

export default ViewSensorDetails;
