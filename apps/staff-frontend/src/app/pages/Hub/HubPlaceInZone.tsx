import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { addHubToZone, createOccurrence, getZonesByParkId, HubResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { Button, Card, Flex, Form, Input, Result, Select, Steps, message } from 'antd';
import CreateDetailsStep from './components/PlaceZoneDetailsStep';
import CreateMapStep from './components/PlaceZoneMapStep';
import { ZoneResponse } from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import { useRestrictHub } from '../../hooks/Hubs/useRestrictHubs';

const center = {
  lat: 1.3503881629328163,
  lng: 103.85132690751749,
};

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const HubPlaceInZone = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const { hub } = useRestrictHub(hubId);
  const { user } = useAuth<StaffResponse>();
  const [currStep, setCurrStep] = useState<number>(0);
  const [createdData, setCreatedData] = useState<HubResponse | null>();
  // const [selectedZone, setSelectedZone] = useState<ZoneResponse>();
  
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // Form Values
  const [form] = Form.useForm();
  const zoneId = Form.useWatch('zoneId', form);

  // Map Values
  const [lat, setLat] = useState(center.lat);
  const [lng, setLng] = useState(center.lng);

  const [zones, setZones] = useState<ZoneResponse[]>();
  const [selectedZone, setSelectedZone] = useState<ZoneResponse>()

  useEffect(() => {
    if (!hub) return;
    const fetchZones = async () => {
      try {
        const zonesRes = await getZonesByParkId(hub?.facility.parkId);
        if (zonesRes.status === 200) {
          setZones(zonesRes.data);
        }
      } catch (error) {
        message.error('Unable to fetch Zones for this Park');
      }
    };
    fetchZones();
  }, [hub]);

  useEffect(() => {
    if (zones && zones?.length > 0 && zoneId) {
      setSelectedZone(zones.find((z) => z.id === zoneId))
    }
  }, [zones, zoneId])

  const handleCurrStep = async (step: number) => {
    if (step === 0) {
      try {
        const values = await form.validateFields(); // Get form data
        setCurrStep(0); 
      } catch (error) {
        // console.error('Validation failed:', error);
      }
      
    } else if (step === 1) {
      if (!zoneId || !lat) {
        message.error("Please select a Zone and place the Hub");
      } else {
        setCurrStep(1); 
      }
    } else {
      return;
    }
  };

  const adjustLatLng = ({ lat, lng }: AdjustLatLngInterface) => {
    if (lat) {
      setLat(lat);
    }
    if (lng) {
      setLng(lng);
    }
  };

  const handleSubmit = async () => {
    if (!hub) return;
    try {
      if (!selectedZone) {
        message.error("Please select a Zone");
        return;
      }

      const values = await form.validateFields();

      const finalData = {
        ...values,
        lat,
        long: lng,
        zoneId: selectedZone.id
      };
      console.log(finalData)
      const response = await addHubToZone(hub.id, finalData);

      if (response.status === 200) {
        setCreatedData(response.data)
        setCurrStep(2)
      }
    } catch (error) {
      console.log(error);
      messageApi.open({
        type: 'error',
        content: 'Unable to place Hub in Zone. Please try again later.',
      });
    }
  };

  const content = [
    {
      key: 'location',
      children: (hub && 
        <CreateMapStep
          adjustLatLng={adjustLatLng}
          lat={lat}
          lng={lng}
          form={form}
          zones={zones}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
        />
      ),
    },
    {
      key: 'details',
      children: (
        <CreateDetailsStep
          handleCurrStep={handleCurrStep}
          handleSubmit={handleSubmit}
          form={form}
        />
      ),
    },
    {
      key: 'complete',
      children: <>Created</>,
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Hub Management',
      pathKey: '/hubs',
      isMain: true,
    },
    {
      title: hub?.identifierNumber ? hub?.identifierNumber : 'Details',
      pathKey: `/hubs/${hub?.id}`,
    },
    {
      title: "Place in Zone",
      pathKey: `/hubs/${hub?.id}/place-in-zone`,
      isCurrent: true,
    },
  ];

  if (user?.role !== StaffType.SUPERADMIN && user?.role !== StaffType.MANAGER && user?.role !== StaffType.BOTANIST && user?.role !== StaffType.ARBORIST) {
    return <></>
  }
  
  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {/* <Tabs items={tabsItems} tabPosition={'left'} /> */}
        <Steps
          // direction="vertical"
          current={currStep}
          items={[
            {
              title: 'Place Hub in a Zone',
              description: "Indicate a Hub's location",
            },
            {
              title: 'Details',
              description: 'Input Occurrence details',
            },
            {
              title: 'Complete',
            },
          ]}
        />

        {currStep === 0 && (
          <>
            <Form className="w-full md:w-[50%] mt-8" form={form}>
              <Form.Item name="zoneId" label="Zone" rules={[{ required: true }]}>
                <Select
                  placeholder="Select a Zone"
                  options={zones?.map((zone) => ({ key: zone.id, value: zone.id, label: zone.name }))}
                />
              </Form.Item>
            </Form>
            {content[0].children}
            <Flex className="w-full max-w-[600px] mx-auto pb-4" gap={10}>
              <div className="flex-1">
                Latitude: <Input value={lat} disabled={!zoneId}/>
              </div>
              <div className="flex-1">
                Latitude: <Input value={lng} disabled={!zoneId}/>
              </div>
            </Flex>
            <Flex className="w-full max-w-[600px] mx-auto" gap={10}>
            <Button type="primary" className="w-full max-w-[300px] mx-auto" onClick={() => handleCurrStep(1)}>
              Next
            </Button>
          </Flex>
          </>
        )}


        {currStep === 1 && (
          <>
          {content[1].children}
          {/* <Flex className="w-full max-w-[600px] mx-auto" gap={10}>
            <Button type="default" className="w-full" onClick={() => handleCurrStep(0)}>
              Previous
            </Button>
            <Button type="primary" className="w-full" onClick={handleSubmit}>
              Submit
            </Button>
          </Flex> */}
          </>
        )}

        {currStep === 2 && (
          <Flex justify="center" className="py-4">
            <Result
              status="success"
              title={selectedZone ? `Placed Hub in Zone: ${selectedZone.name}` : "Placed Hub in Zone"}
              subTitle={createdData && <>Hub Name: {createdData.name}</>}
              extra={[
                <Button key="back" onClick={() => navigate(`/hubs/${createdData?.id}`)}>
                  Back to Hub Details Page
                </Button>,
              ]}
            />
          </Flex>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default HubPlaceInZone;
