import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark } from '@lepark/common-ui';
import { createOccurrence } from '@lepark/data-access';
import { Button, Card, Flex, Form, Input, Result, Steps } from 'antd';
import PageHeader from '../../components/main/PageHeader';
import CreateDetailsStep from './components/CreateDetailsStep';
import CreateMapStep from './components/CreateMapStep';
import moment from 'moment';
import { OccurrenceResponse } from '@lepark/data-access';

const center = {
  lat: 1.3503881629328163,
  lng: 103.85132690751749,
};

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const ParkCreate = () => {
  const [currStep, setCurrStep] = useState<number>(1);
  const [createdData, setCreatedData] = useState<OccurrenceResponse | null>();
  const navigate = useNavigate();

  // Form Values
  const [formValues, setFormValues] = useState<any>({});
  const [form] = Form.useForm();
  // Map Values
  const [lat, setLat] = useState(center.lat);
  const [lng, setLng] = useState(center.lng);

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
      //
    } catch (error) {
      console.log('error', error);
      //
    }
  };

  const content = [
    {
      key: 'details',
      children: <CreateDetailsStep handleCurrStep={handleCurrStep} form={form} />,
    },
    {
      key: 'location',
      children: <CreateMapStep handleCurrStep={handleCurrStep} adjustLatLng={adjustLatLng} lat={lat} lng={lng} />,
    },
    {
      key: 'complete',
      children: <>Created</>,
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader>Create a Park</PageHeader>
      <Card>
        {/* <Tabs items={tabsItems} tabPosition={'left'} /> */}
        <Steps
          // direction="vertical"
          current={currStep}
          items={[
            {
              title: 'Details',
              description: 'Input Park details',
            },
            {
              title: 'Location',
              description: 'Demarcate Park',
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
              subTitle={
                createdData && <>Occurrence title: {createdData.title}</>
              }
              extra={[
                <Button key="back" onClick={() => navigate('/occurrence')}>Back to Occurrence Management</Button>,
                <Button type="primary" key="view" onClick={() => navigate(`/occurrence/${createdData?.id}`)}>
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

export default ParkCreate;
