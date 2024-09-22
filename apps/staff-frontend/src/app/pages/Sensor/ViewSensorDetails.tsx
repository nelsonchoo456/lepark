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

const ViewSensorDetails = () => {
  const { sensorId } = useParams<{ sensorId: string }>();
  const [sensor, setSensor] = useState<SensorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [facility, setFacility] = useState<FacilityResponse | null>(null);
  const [park, setPark] = useState<ParkResponse | null>(null);
  const { user } = useAuth<StaffResponse>();

  useEffect(() => {
    const fetchData = async () => {
      if (sensorId) {
        try {
          const response = await getSensorById(sensorId);
          setSensor(response.data);
          if (response.data.facilityId) {
            const facilityResponse = await getFacilityById(response.data.facilityId);
            setFacility(facilityResponse.data);
            console.log(facilityResponse.data);
            const parkResponse = await getParkById(facilityResponse.data.parkId);
            setPark(parkResponse.data);
          }
        } catch (error) {
          console.error('Error fetching sensor data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [sensorId]);

  const breadcrumbItems = [
    {
      title: 'Sensor Management',
      pathKey: '/sensor',
      isMain: true,
    },
    {
      title: sensor?.sensorName ? sensor?.sensorName : 'Details',
      pathKey: `/sensor/${sensor?.id}`,
      isCurrent: true,
    },
  ];

  const descriptionsItems = [
    //  { key: 'sensorName', label: 'Sensor Name', children: sensor?.sensorName },
    { key: 'sensorType', label: 'Sensor Type', children: sensor?.sensorType },
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
      key: 'nextMaintenanceDate',
      label: 'Next Maintenance Date',
      children: sensor?.nextMaintenanceDate ? moment(sensor.nextMaintenanceDate).format('D MMM YY') : null,
    },
    {
      key: 'facilityName',
      label: 'Facility',
      children: facility?.facilityName,
    },
    /* { key: 'latitude', label: 'Latitude', children: sensor?.latitude },
    { key: 'longitude', label: 'Longitude', children: sensor?.longitude },
    { key: 'supplier', label: 'Supplier', children: sensor?.supplier },
    { key: 'supplierContactNumber', label: 'Supplier Contact', children: sensor?.supplierContactNumber },*/
  ];

  const tabsItems = [
    {
      key: 'information',
      label: 'Information',
      children: sensor ? <InformationTab sensor={sensor} /> : <p>Loading sensor data...</p>,
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <div className="md:flex w-full gap-4">
          <div className="w-full md:w-1/2 lg:w-1/2 ">
            <SensorCarousel image={sensor?.image ?? ''} />
          </div>

          <div className="flex-1 flex-col flex">
            <LogoText className="text-2xl py-2 m-0">{sensor?.sensorName}</LogoText>
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
