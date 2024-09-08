import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark } from '@lepark/common-ui';
import { createOccurrence, ParkResponse } from '@lepark/data-access';
import { Button, Card, Flex, Form, Input, Result, Steps } from 'antd';
import PageHeader from '../../components/main/PageHeader';
import CreateDetailsStep from './components/CreateDetailsStep';
import CreateMapStep from './components/CreateMapStep';
import moment from 'moment';
import { OccurrenceResponse } from '@lepark/data-access';
import { LatLng } from 'leaflet';
import { latLngArrayToPolygon } from '../../components/map/functions/functions';
import { createPark } from '@lepark/data-access';

const center = {
  lat: 1.3503881629328163,
  lng: 103.85132690751749,
};

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const daysOfTheWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const ParkCreate = () => {
  const [currStep, setCurrStep] = useState<number>(0);
  const [createdData, setCreatedData] = useState<ParkResponse | null>();
  const navigate = useNavigate();

  // Form Values
  const [formValues, setFormValues] = useState<any>({});
  const [form] = Form.useForm();
  // Map Values
  const [polygon, setPolygon] = useState<LatLng[][]>([]);
  const [lines, setLines] = useState<any[]>([]);  
  const [lat, setLat] = useState(center.lat);
  const [lng, setLng] = useState(center.lng);
  
  const handleCurrStep = async (step: number) => {
    console.log(formValues)
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

  const handleSubmit = async () => {
    try {
      // console.log(formValues);
      const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, ...rest } = formValues;

      const openingHours: any[] = [];
      const closingHours: any[] = [];
      daysOfTheWeek.forEach((day, index) => {
        openingHours.push(formValues[day][0] ? moment(formValues[day][0]).toISOString() : null)
        closingHours.push(formValues[day][1] ? moment(formValues[day][1]).toISOString() : null)
      })

      const finalData = { ...rest, openingHours, closingHours}

      if (polygon[0][0]) {
        const polygonData = latLngArrayToPolygon(polygon[0][0]);
        finalData.geom = polygonData;
      }
      

      const response = await createPark(finalData);
      if (response.status === 201) {
        setCreatedData(response.data)
        setCurrStep(2);
      }
      
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
      children: <CreateMapStep handleCurrStep={handleCurrStep} polygon={polygon} setPolygon={setPolygon} lines={lines} setLines={setLines}/>,
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
              title="Created new Park"
              subTitle={
                createdData && <>Park title: {createdData.name}</>
              }
              extra={[
                <Button key="back" onClick={() => navigate('/park/create')}>Back to Park Management</Button>,
                <Button type="primary" key="view" onClick={() => navigate(`/park/${createdData?.id}`)}>
                  View new Park
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
