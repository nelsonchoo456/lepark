import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import {
  addSensorToHub,
  getHubsFiltered,
  HubResponse,
  SensorResponse,
  StaffResponse,
  StaffType,
} from '@lepark/data-access';
import { Button, Card, Flex, Form, Input, Result, Select, Steps, message } from 'antd';
import { ZoneResponse } from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import PlaceZoneMapStep from './components/AddSensorMapStep';
import { useRestrictSensors } from '../../hooks/Sensors/useRestrictSensors';
const { TextArea } = Input;
const center = {
  lat: 1.3503881629328163,
  lng: 103.85132690751749,
};

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const SensorAddToHub = () => {
  const { sensorId } = useParams<{ sensorId: string }>();
  const { sensor } = useRestrictSensors(sensorId);
  const { user } = useAuth<StaffResponse>();
  const [currStep, setCurrStep] = useState<number>(0);
  const [createdData, setCreatedData] = useState<SensorResponse | null>();
  // const [selectedZone, setSelectedZone] = useState<ZoneResponse>();

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // Form Values
  const [form] = Form.useForm();
  const hubId = Form.useWatch('hubId', form);

  // Map Values
  const [lat, setLat] = useState(center.lat);
  const [lng, setLng] = useState(center.lng);

  const [zones, setZones] = useState<ZoneResponse[]>();
  const [hubs, setHubs] = useState<HubResponse[]>();
  const [selectedZone, setSelectedZone] = useState<ZoneResponse>();
  const [selectedHub, setSelectedHub] = useState<HubResponse>();

  useEffect(() => {
    if (!sensor) return;
    const fetchHubs = async () => {
      try {
        const hubsRes = await getHubsFiltered('ACTIVE', sensor.park?.id);
        if (hubsRes.status === 200) {
          console.log(hubsRes.data);
          setHubs(hubsRes.data);
        }
      } catch (error) {
        message.error('Unable to fetch Hubs for this Park');
      }
    };
    fetchHubs();
  }, [sensor]);

  useEffect(() => {
    if (hubs && hubId && hubId !== null) {
      const matchedHub = hubs.find((z) => z.id === hubId);
      setSelectedHub(matchedHub);
      setSelectedZone(matchedHub?.zone);
    }
  }, [hubId]);

  const adjustLatLng = ({ lat, lng }: AdjustLatLngInterface) => {
    if (lat) {
      setLat(lat);
    }
    if (lng) {
      setLng(lng);
    }
  };

  useEffect(() => {
    if (sensor) {
      form.setFieldsValue({
        remarks: sensor.remarks
      });
    }
  }, [sensor, form]);

  const handleSubmit = async () => {
    if (!sensor) return;
    try {
      if (!selectedHub) {
        message.error('Please select a Hub');
        return;
      }

      const values = await form.validateFields();

      const finalData = {
        ...values,
        lat,
        long: lng,
        hubId: selectedHub.id,
      };

      console.log("Failure here")
      const response = await addSensorToHub(sensor.id, finalData);

      if (response.status === 200) {
        setCreatedData(response.data)
        setCurrStep(2)
      }
    } catch (error) {
      console.log(error)
      if (
        error === 'Sensor not found' ||
        error === 'Hub ID is required' ||
        (typeof error === 'string' &&
          (error.startsWith('Hub with ID') ||
            error.startsWith('Facility for') ||
            error.startsWith('Sensor is') ||
            error.startsWith('Hub is')))
      ) {
        messageApi.open({
          type: 'error',
          content: error,
        });
        return;
      }
      messageApi.open({
        type: 'error',
        content: 'Unable to place Hub in Zone. Please try again later.',
      });
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
    },
    {
      title: 'Add to Hub',
      pathKey: `/sensor/${sensor?.id}/add-to-hub`,
      isCurrent: true,
    },
  ];

  if (
    user?.role !== StaffType.SUPERADMIN &&
    user?.role !== StaffType.MANAGER &&
    user?.role !== StaffType.BOTANIST &&
    user?.role !== StaffType.ARBORIST
  ) {
    return <></>;
  }

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {!createdData ? (
          <Form className="w-full" form={form} layout="vertical" initialValues={{ remarks: sensor?.remarks }}>
            <Steps
              direction="vertical"
              size="small"
              current={!hubId ? 0 : 1}
              items={[
                {
                  // title: 'Assign Sensor to a Hub',
                  description: (
                    <Form.Item name="hubId" label="Hub" rules={[{ required: true }]}>
                      <Select placeholder="Select a Hub" disabled={!hubs || hubs.length === 0}>
                        <Select.Option key={'labels'} value={null} disabled className="bg-green-50 text-black">
                          <div className="flex py-2">
                            <div className="flex-[1] font-semibold">Name</div>
                            <div className="flex-[1] font-semibold">Identifier Number</div>
                            <div className="flex-[1] font-semibold">Zone</div>
                          </div>
                        </Select.Option>
                        {hubs?.map((hub) => (
                          <Select.Option key={hub.id} value={hub.id}>
                            <div className="flex">
                              <div className="flex-[1] font-semibold">{hub.name}</div>
                              <div className="flex-[1]">{hub.identifierNumber}</div>
                              <div className="flex-[1]">{hub.zone?.name}</div>
                            </div>
                          </Select.Option>
                        ))}
                      </Select>
                      {(!hubs || hubs.length === 0) && <div className='opacity-60'>No Active Hubs found.</div>}
                    </Form.Item>
                  ),
                },
                {
                  // title: "Indicate the Sensor's Location",
                  description: (
                    <>
                      <PlaceZoneMapStep
                        adjustLatLng={adjustLatLng}
                        lat={lat}
                        lng={lng}
                        hub={selectedHub}
                        selectedZone={selectedZone}
                        setSelectedZone={setSelectedZone}
                      />
                      <Form.Item name="remarks" label="Additional Remarks">
                        <TextArea placeholder="(Optional) Remarks" disabled={!hubId} />
                      </Form.Item>
                      <Flex className="w-full max-w-[600px] mx-auto" gap={10}>
                        <Button type="primary" className="w-full" onClick={handleSubmit} disabled={!hubId}>
                          Submit
                        </Button>
                      </Flex>
                    </>
                  ),
                },
              ]}
            />
          </Form>
        ) : (
          <Flex justify="center" className="py-4">
            <Result
              status="success"
              title={selectedHub ? `Added Sensor to Hub: ${selectedHub.name}` : 'Added Sensor to Hub'}
              subTitle={createdData && <>Sensor Name: {createdData.name}</>}
              extra={[
                <Button key="back" onClick={() => navigate(`/sensor/${createdData?.id}`)}>
                  Back to Sensor Details Page
                </Button>,
              ]}
            />
          </Flex>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default SensorAddToHub;
