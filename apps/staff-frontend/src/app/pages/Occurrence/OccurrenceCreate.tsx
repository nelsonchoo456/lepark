import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark } from '@lepark/common-ui';
import { createOccurrence, getAllZones } from '@lepark/data-access';
import { Button, Card, Flex, Form, Input, Result, Steps, message } from 'antd';
import PageHeader from '../../components/main/PageHeader';
import CreateDetailsStep from './components/CreateDetailsStep';
import CreateMapStep from './components/CreateMapStep';
import moment from 'moment';
import { OccurrenceResponse, ZoneResponse } from '@lepark/data-access';
import dayjs from 'dayjs';

const center = {
  lat: 1.3503881629328163,
  lng: 103.85132690751749,
};

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const OccurrenceCreate = () => {
  const [currStep, setCurrStep] = useState<number>(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [createdData, setCreatedData] = useState<OccurrenceResponse | null>();
  const [zones, setZones] = useState<ZoneResponse[]>([]);
  const navigate = useNavigate();

  // Form Values
  const [formValues, setFormValues] = useState<any>({});
  const [form] = Form.useForm();
  // Map Values
  const [lat, setLat] = useState(center.lat);
  const [lng, setLng] = useState(center.lng);

  useEffect(() => {
    const fetchZoneData = async () => {
      const zonesRes = await getAllZones();
      if (zonesRes.status === 200) {
        const zonesData = zonesRes.data;
        setZones(zonesData)
      } 
    }
    fetchZoneData();
  }, [])

  const handleCurrStep = async (step: number) => {
    if (step === 0) {
      setCurrStep(0);
    } else if (step === 1) {
      try {
        const values = await form.validateFields(); // Get form data
        setFormValues(values); // Save form data
        setCurrStep(1); // Move to step 2
      } catch (error) {
        // console.error('Validation failed:', error);
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
    try {
      const finalData = {
        ...formValues,
        lat,
        lng,
        speciesId: '7179034c-d444-499f-9986-14ce39122a2b',
        dateObserved: formValues.dateObserved ? dayjs(formValues.dateObserved).toISOString() : null,
        dateOfBirth: formValues.dateOfBirth ? dayjs(formValues.dateOfBirth).toISOString() : null,
      };

      const response = await createOccurrence(finalData);
      if (response?.status && response.status === 201) {
        setCurrStep(2);
        setCreatedData(response.data);
      }
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'Unable to create Occurrence as Species cannot be found. Please try again later.',
      });
      //
    }
  };

  const content = [
    {
      key: 'details',
      children: <CreateDetailsStep handleCurrStep={handleCurrStep} form={form} zones={zones}/>,
    },
    {
      key: 'location',
      children: <CreateMapStep handleCurrStep={handleCurrStep} adjustLatLng={adjustLatLng} lat={lat} lng={lng} zones={zones} formValues={formValues}/>,
    },
    {
      key: 'complete',
      children: <>Created</>,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader>Create an Occurrence</PageHeader>
      <Card>
        {/* <Tabs items={tabsItems} tabPosition={'left'} /> */}
        <Steps
          // direction="vertical"
          current={currStep}
          items={[
            {
              title: 'Details',
              description: 'Input Occurrence details',
            },
            {
              title: 'Location',
              description: 'Indicate Occurrence location',
            },
            {
              title: 'Complete',
            },
          ]}
        />
        {currStep === 0 && content[0].children}
        {currStep === 1 && (
          <>
            {content[1].children}
            <Flex className="w-full max-w-[600px] mx-auto pb-4" gap={10}>
              <div className="flex-1">
                Latitude: <Input value={lat} />
              </div>
              <div className="flex-1">
                Latitude: <Input value={lng} />
              </div>
            </Flex>
            <Flex className="w-full max-w-[600px] mx-auto" gap={10}>
              <Button type="default" className="w-full" onClick={() => handleCurrStep(0)}>
                Previous
              </Button>
              <Button type="primary" className="w-full" onClick={handleSubmit}>
                Submit
              </Button>
            </Flex>
          </>
        )}
        {currStep === 2 && (
          <Flex justify="center" className="py-4">
            <Result
              status="success"
              title="Created new Occurrence"
              subTitle={createdData && <>Occurrence title: {createdData.title}</>}
              extra={[
                <Button key="back" onClick={() => navigate('/occurrences')}>
                  Back to Occurrence Management
                </Button>,
                <Button type="primary" key="view" onClick={() => navigate(`/occurrences/${createdData?.id}`)}>
                  View new Occurrence
                </Button>,
              ]}
            />
          </Flex>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default OccurrenceCreate;
