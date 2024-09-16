import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { createPark, ParkResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { Button, Card, Flex, Form, message, notification, Result, Steps } from 'antd';
import PageHeader from '../../components/main/PageHeader';
import CreateDetailsStep from './components/CreateDetailsStep';
import CreateMapStep from './components/CreateMapStep';
import moment from 'moment';
import { LatLng } from 'leaflet';
import { latLngArrayToPolygon } from '../../components/map/functions/functions';
import useUploadImages from '../../hooks/Images/useUploadImages';
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
  const { user, updateUser } = useAuth<StaffResponse>();
  const [currStep, setCurrStep] = useState<number>(0);
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const [createdData, setCreatedData] = useState<ParkResponse | null>();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const notificationShown = useRef(false);

  // Form Values
  const [formValues, setFormValues] = useState<any>({});
  const [form] = Form.useForm();
  // Map Values
  const [polygon, setPolygon] = useState<LatLng[][]>([]);
  const [lines, setLines] = useState<any[]>([]);  
  
  useEffect(() => {
    if (user?.role !== StaffType.SUPERADMIN) {
      if (!notificationShown.current) {
      notification.error({
        message: 'Access Denied',
        description: 'You are not allowed to access the Park Creation page!',
      });
      notificationShown.current = true;
    }
      navigate('/');
    }
  }, [user, navigate]);
  
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
      const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, ...rest } = formValues;
      
      const openingHours: any[] = [];
      const closingHours: any[] = [];
      daysOfTheWeek.forEach((day, index) => {
        openingHours.push(formValues[day][0] ? formValues[day][0].toISOString() : null)
        closingHours.push(formValues[day][1] ? formValues[day][1].toISOString() : null)
      })

      const finalData = { ...rest, openingHours, closingHours}

      if (polygon && polygon[0] && polygon[0][0]) {
        const polygonData = latLngArrayToPolygon(polygon[0][0]);
        finalData.geom = polygonData;
      }

      const response = await createPark(finalData, selectedFiles);
      if (response.status === 201) {
        setCreatedData(response.data)
        setCurrStep(2);
        messageApi.open({
          type: 'success',
          content: 'Park created successfully',
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'A park with this name already exists') {
          messageApi.open({
            type: 'error',
            content: 'A park with this name already exists. Please choose a different name.',
          });
        } else {
          messageApi.open({
            type: 'error',
            content: error.message || 'An error occurred while creating the park',
          });
        }
      } else {
        messageApi.open({
          type: 'error',
          content: 'An unexpected error occurred while creating the park',
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
        <CreateMapStep handleCurrStep={handleCurrStep} polygon={polygon} setPolygon={setPolygon} lines={lines} setLines={setLines} />
      ),
    },
    {
      key: 'complete',
      children: <>Created</>,
    },
  ];

  if (user?.role !== StaffType.SUPERADMIN) { 
    return <></>;
  }
  
  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader>Create a Park</PageHeader>
      <Card>
        <Steps
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
