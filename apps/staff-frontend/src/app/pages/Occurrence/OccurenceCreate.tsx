import { ContentWrapperDark } from '@lepark/common-ui';
import { Button, Card, DatePicker, Form, Input, InputNumber, Select, Steps, Tabs } from 'antd';
import PageHeader from '../../components/main/PageHeader';
import CreateDetailsStep from './components/CreateDetailsStep';
import { useState } from 'react';
import CreateMapStep from './components/CreateMapStep';
const { TextArea } = Input;

const center = {
	lat: 1.3503881629328163,
	lng: 103.85132690751749,
};

export interface AdjustLatLngInterface {
  lat?: number | null,
  lng?: number | null
}

const OccurrenceCreate = () => {
  const [currStep, setCurrStep] = useState<number>(0);
  // Form Values
  const [formValues, setFormValues] = useState<any>({});
  const [form] = Form.useForm();
  // Map Values
  const [lat, setLat] = useState(center.lat)
  const [lng, setLng] = useState(center.lng)

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
  }

  const adjustLatLng = ({ lat, lng }: AdjustLatLngInterface) => {
    if (lat) {
      setLat(lat)
    }
    if (lng) {
      setLng(lng)
    }
  }

  const handleSubmit = async () => {
    try {
      const finalData = { ...formValues }
    } catch (error) {
      //
    }
   }
  
  const content = [
    {
      key: 'details',
      children: <CreateDetailsStep handleCurrStep={handleCurrStep} form={form}/>,
    },
    {
      key: 'location',
      children: <CreateMapStep handleCurrStep={handleCurrStep} adjustLatLng={adjustLatLng} lat={lat} lng={lng}/>,
    },
    
  ];

  return (
    <ContentWrapperDark>
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
        {
          currStep === 0 && content[0].children
        }
        {
          currStep === 1 && content[1].children
        }
      </Card>
      
    </ContentWrapperDark>
  );
};

export default OccurrenceCreate;
