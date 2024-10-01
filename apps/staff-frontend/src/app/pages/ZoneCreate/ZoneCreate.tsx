import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { createZone, getAllParks, ParkResponse, StaffResponse, StaffType, ZoneResponse } from '@lepark/data-access';
import { Button, Card, Flex, Form, message, notification, Result, Steps, Tooltip } from 'antd';
import CreateDetailsStep from './components/CreateDetailsStep';
import CreateMapStep from './components/CreateMapStep';
import { LatLng } from 'leaflet';
import { latLngArrayToPolygon } from '../../components/map/functions/functions';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import useUploadImages from '../../hooks/Images/useUploadImages';
import PageHeader2 from '../../components/main/PageHeader2';
const center = {
  lat: 1.3503881629328163,
  lng: 103.85132690751749,
};

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const daysOfTheWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const ZoneCreate = () => {
  const { user, updateUser } = useAuth<StaffResponse>();
  const { parks, restrictedParkId, loading } = useFetchParks();
  const [currStep, setCurrStep] = useState<number>(0);
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const [createdData, setCreatedData] = useState<ZoneResponse | null>();
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
        throw new Error ("Please draw Zone boundaries on the map.");
      }

      const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, ...rest } = formValues;
      
      const openingHours: any[] = [];
      const closingHours: any[] = [];
      daysOfTheWeek.forEach((day, index) => {
        // console.log(formValues[day])
        openingHours.push(formValues[day][0] ? formValues[day][0].toISOString() : null)
        closingHours.push(formValues[day][1] ? formValues[day][1].toISOString() : null)
      })

      const finalData = { 
        ...rest, 
        openingHours, 
        closingHours,
        parkId: user?.parkId || rest.parkId // Use user's parkId if available, otherwise use the one from the form
      }

      if (polygon && polygon[0] && polygon[0][0]) {
        const polygonData = latLngArrayToPolygon(polygon[0][0]);
        finalData.geom = polygonData;
      }
    
      const response = await createZone(finalData, selectedFiles);
      if (response.status === 201) {
        setCreatedData(response.data)
        setCurrStep(2);
        messageApi.open({
          type: 'success',
          content: 'Zone created successfully',
        });
      }
      
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        messageApi.open({
          type: 'error',
          content: error.message || 'An error occurred while creating the Zone',
        });
      } else {
        messageApi.open({
          type: 'error',
          content: 'Unable to create a Zone. Please try again later.',
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
        <CreateMapStep handleCurrStep={handleCurrStep} polygon={polygon} setPolygon={setPolygon} lines={lines} setLines={setLines} parks={parks} formValues={formValues}/>
      ),
    },
    {
      key: 'complete',
      children: <>Created</>,
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Zones Management',
      pathKey: '/zone',
      isMain: true,
    },
    {
      title: "Create",
      pathKey: `/zone/create`,
      isCurrent: true,
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
              description: 'Input Zone details',
            },
            {
              title: 'Location',
              description: 'Demarcate Zone',
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
              title="Created new Zone"
              subTitle={
                createdData && <>Zone title: {createdData.name}</>
              }
              extra={[
                <Button key="back" onClick={() => navigate('/zone')}>Back to Zone Management</Button>,
                <Tooltip title="View Zone Details">
                  <Button type="primary" key="view" onClick={() => navigate(`/zone/${createdData?.id}`)}>
                    View new Zone
                  </Button>
                </Tooltip>
                ,
              ]}
            />
          </Flex>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default ZoneCreate;
