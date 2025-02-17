import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { DecarbonizationAreaResponse, StaffResponse } from '@lepark/data-access';
import { Button, Card, Flex, Form, message, Result, Steps, Tooltip } from 'antd';
import { LatLng } from 'leaflet';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import CreateMapStep from './components/CreateMapStep';
import CreateDetailsStep from './components/CreateDetailsStep';

const center = {
  lat: 1.3503881629328163,
  lng: 103.85132690751749,
};

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const CreateDecarbonizationArea = () => {
  const { user, updateUser } = useAuth<StaffResponse>();
  const { parks, restrictedParkId, loading } = useFetchParks();
  const [currStep, setCurrStep] = useState<number>(0);
  const [createdData, setCreatedData] = useState<DecarbonizationAreaResponse | null>();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const notificationShown = useRef(false);

  // Form Values
  const [formValues, setFormValues] = useState<any>({});
  const [form] = Form.useForm();
  // Map Values
  const [polygon, setPolygon] = useState<LatLng[][]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [lat, setLat] = useState(center.lat);
  const [lng, setLng] = useState(center.lng);

  const breadcrumbItems = [
    {
      title: 'Decarbonization Area Management',
      pathKey: '/decarbonization-area',
      isMain: true,
    },
    {
      title: 'Create',
      pathKey: `/decarbonization-area/create`,
      isCurrent: true,
    },
  ];

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

  const handleSuccess = (data: DecarbonizationAreaResponse) => {
    setCreatedData(data);
    messageApi.open({
      type: 'success',
      content: 'Decarbonization Area created successfully.',
    });
    setCurrStep(2);
  };

  const content = [
    {
      key: 'details',
      children: (
        <CreateDetailsStep
          handleCurrStep={handleCurrStep}
          form={form}
          parks={parks}
        />
      ),
    },
    {
      key: 'location',
      children: (
        <CreateMapStep
          handleCurrStep={handleCurrStep}
          setCurrStep={setCurrStep}
          polygon={polygon}
          setPolygon={setPolygon}
          lines={lines}
          setLines={setLines}
          parks={parks}
          formValues={formValues}
          onSuccess={handleSuccess} // Pass the callback
        />
      ),
    },
    {
      key: 'complete',
      children: <>Created</>,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />

      <Card>
        <Steps
          current={currStep}
          items={[
            {
              title: 'Details',
              description: 'Input Decarbonization Area details',
            },
            {
              title: 'Location',
              description: 'Demarcate Decarbonization Area',
            },
            {
              title: 'Complete',
            },
          ]}
        />
        {currStep === 0 && content[0].children}
        {currStep === 1 && <>{content[1].children}</>}
        {currStep === 2 && (
          <Flex justify="center" className="py-4">
            <Result
              status="success"
              title="Created new Decarbonization Area"
              subTitle={createdData && <>Decarbonization Area title: {createdData.name}</>}
              extra={[
                <Button key="back" onClick={() => navigate('/decarbonization-area')}>
                  Back to Decarbonization Area Management
                </Button>,
                <Tooltip title="View Decarbonization Area Details">
                  <Button type="primary" key="view" onClick={() => navigate(`/decarbonization-area/${createdData?.id}`)}>
                    View new Decarbonization Area
                  </Button>
                </Tooltip>,
              ]}
            />
          </Flex>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default CreateDecarbonizationArea;
