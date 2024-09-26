import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@lepark/common-ui';
import {
  FacilityResponse,
  ParkResponse,
  SensorResponse,
  StaffResponse,
  getFacilityById,
  getParkById,
  getSensorById,
} from '@lepark/data-access';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import PageHeader2 from '../../components/main/PageHeader2';
import { Card, Descriptions, Tabs, Tag, Spin } from 'antd';
import moment from 'moment';
import SensorCarousel from './components/SensorCarousel';
import InformationTab from './components/InformationTab';
import { useRestrictSensors } from '../../hooks/Sensors/useRestrictSensors';

const ViewSensorDetails = () => {
  const { sensorId } = useParams<{ sensorId: string }>();
  const { sensor } = useRestrictSensors(sensorId);
  const [loading, setLoading] = useState(true);
  const [facility, setFacility] = useState<FacilityResponse | null>(null);
  const [park, setPark] = useState<ParkResponse | null>(null);
  const { user } = useAuth<StaffResponse>();
  const [sensorWithoutFacility, setSensorWithoutFacility] = useState<SensorResponse>();

  useEffect(() => {
    const fetchData = async () => {
      if (sensorId) {
        console.log('viewdetails sensor', sensor);
        try {
          if (sensor && sensor.facilityId) {
            console.log('sensor:', sensor);
            const facilityResponse = await getFacilityById(sensor.facilityId);
            if (facilityResponse.status === 200) {
              setFacility(facilityResponse.data);
              //console.log(facilityResponse.data);
              const parkResponse = await getParkById(facilityResponse.data.parkId);
              if (parkResponse.status === 200) {
                //console.log(parkResponse.data);
                setPark(parkResponse.data);
              }
            }
          }
          // Destructure sensor to remove facility and set sensorWithoutFacility
          if (sensor) {
            const { facility, ...sensorWithoutFacility } = sensor;
            setSensorWithoutFacility(sensorWithoutFacility);
          }
        } catch (error) {
          console.error('Error fetching sensor data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [sensorId, sensor]);

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

  const capitalize = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const descriptionsItems = [
    {
      key: 'name',
      label: 'Name',
      children: sensor?.sensorName,
    },
    { key: 'sensorType', label: 'Sensor Type', children: capitalize(sensor?.sensorType ?? '') },
    {
      key: 'sensorStatus',
      label: 'Sensor Status',
      children: (() => {
        switch (sensor?.sensorStatus) {
          case 'ACTIVE':
            return <Tag color="green">ACTIVE</Tag>;
          case 'INACTIVE':
            return <Tag color="silver">INACTIVE</Tag>;
          case 'UNDER_MAINTENANCE':
            return <Tag color="yellow">UNDER MAINTENANCE</Tag>;
          case 'DECOMMISSIONED':
            return <Tag color="red">DECOMMISSIONED</Tag>;
          default:
            return <Tag>{sensor?.sensorStatus}</Tag>;
        }
      })(),
    },
    {
      key: 'facilityName',
      label: 'Facility',
      children: facility?.facilityName,
    },
  ];

  if (sensor?.nextMaintenanceDate) {
    descriptionsItems.push({
      key: 'nextMaintenanceDate',
      label: 'Next Maintenance Date',
      children: moment(sensor.nextMaintenanceDate).format('D MMM YY'),
    });
  }
  const descriptionsItemsForSuperAdmin = [
    ...descriptionsItems,
    {
      key: 'parkName',
      label: 'Park Name',
      children: park?.name,
    },
  ];

  const tabsItems = [
    {
      key: 'information',
      label: 'Information',
      children: sensorWithoutFacility ? <InformationTab sensor={sensorWithoutFacility} /> : <p>Loading sensor data...</p>,
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
            <SensorCarousel image={sensor?.image ?? ''} />
          </div>

          <div className="flex-1 flex-col flex">
            <LogoText className="text-2xl py-2 m-0">{sensor?.serialNumber}</LogoText>
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

export default ViewSensorDetails;
