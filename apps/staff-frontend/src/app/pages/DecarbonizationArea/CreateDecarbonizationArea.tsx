import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { createDecarbonizationArea, DecarbonizationAreaResponse, StaffResponse } from '@lepark/data-access';
import { Button, Card, Flex, Form, message, Result, Steps, Tooltip } from 'antd';
import { LatLng } from 'leaflet';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import { latLngArrayToPolygon } from '../../components/map/functions/functions';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import CreateDetailsStep from './components/CreateDetailsStep';
import CreateMapStep from './components/CreateMapStep';
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
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
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
    // console.log(formValues)
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
      if (!polygon || !(polygon.length > 0) || !polygon[0][0]) {
        throw new Error('Please draw Decarbonization Area boundaries on the map.');
      }

      const finalData = {
        ...formValues,
        parkId: user?.parkId || formValues.parkId, // Use user's parkId if available, otherwise use the one from the form
      };

      if (polygon && polygon[0] && polygon[0][0]) {
        const polygonData = latLngArrayToPolygon(polygon[0][0]);
        finalData.geom = polygonData;
      }

      const response = await createDecarbonizationArea(finalData);
      if (response.status === 201) {
        setCreatedData(response.data);
        setCurrStep(2);
        messageApi.open({
          type: 'success',
          content: 'Decarbonization Area created successfully',
        });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        messageApi.open({
          type: 'error',
          content: error.message || 'An error occurred while creating the Decarbonization Area',
        });
      } else {
        messageApi.open({
          type: 'error',
          content: 'Unable to create a Decarbonization Area. Please try again later.',
        });
      }
    }
  };

  const content = [
    {
      key: 'details',
      children: (
        <CreateDetailsStep
          handleCurrStep={handleCurrStep}
          form={form}
          parks={parks}
          previewImages={previewImages}
          handleFileChange={handleFileChange}
          removeImage={removeImage}
          onInputClick={onInputClick}
        />
      ),
    },
    {
      key: 'location',
      children: (
        <CreateMapStep
          handleCurrStep={handleCurrStep}
          polygon={polygon}
          setPolygon={setPolygon}
          lines={lines}
          setLines={setLines}
          parks={parks}
          formValues={formValues}
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
        {currStep === 1 && (
          <>
            {content[1].children}{' '}
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
