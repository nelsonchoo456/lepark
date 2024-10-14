import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { createZone, getAllParks, getZonesByParkId, ParkResponse, StaffResponse, StaffType, ZoneResponse } from '@lepark/data-access';
import { Button, Card, Flex, Form, message, notification, Result, Steps, Tooltip } from 'antd';
import CreateDetailsStep from './components/CreateDetailsStep';
import CreateMapStep from './components/CreateMapStep';
import { LatLng } from 'leaflet';
import { latLngArrayToPolygon, polygonHasOverlap, polygonIsWithin } from '../../components/map/functions/functions';
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
  const { user } = useAuth<StaffResponse>();
  const { parks } = useFetchParks();
  const [currStep, setCurrStep] = useState<number>(0);
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const [createdData, setCreatedData] = useState<ZoneResponse | null>();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const notificationShown = useRef(false);

  const [selectedPark, setSelectedPark] = useState<ParkResponse>();
  const [selectedParkZones, setSelectedParkZones] = useState<ZoneResponse[]>();

  // Form Values
  const [formValues, setFormValues] = useState<any>({});
  const [form] = Form.useForm();
  // Map Values
  const [polygon, setPolygon] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);  

  useEffect(() => {
    if (parks?.length > 0 && formValues && formValues.parkId) {
      if (selectedPark && selectedPark.id !== formValues.parkId) {
        // check if there is a previously selected park, if so, reset polygon
        setPolygon([]);
      }
      
      const currSelectedPark = parks.find((z) => z.id === formValues.parkId);
      setSelectedPark(currSelectedPark);

      const fetchZones = async () => {
        const zonesRes = await getZonesByParkId(formValues.parkId);
        if (zonesRes.status === 200) {
          const zonesData = zonesRes.data;
          setSelectedParkZones(zonesData);
        }
      }
      fetchZones();
    }
  }, [parks, formValues.parkId]);

  useEffect(() => {
    if (parks?.length > 0 && user?.parkId && user?.role !== StaffType.SUPERADMIN) {
      if (selectedPark && selectedPark.id !== user?.parkId) {
        // check if there is a previously selected park, if so, reset polygon
        setPolygon([]);
      }
      
      const currSelectedPark = parks.find((z) => z.id === user?.parkId);
      setSelectedPark(currSelectedPark);

      const fetchZones = async () => {
        if (!user.parkId) return;
        const zonesRes = await getZonesByParkId(user.parkId);
        if (zonesRes.status === 200) {
          const zonesData = zonesRes.data;
          setSelectedParkZones(zonesData);
        }
      }
      fetchZones();
    }
  }, [parks, user]);
  
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
    
      // Boundary validation
      const hasOverlap = polygonHasOverlap(
        polygon[0][0],
        selectedParkZones?.map((z) => z?.geom?.coordinates?.[0]),
      );
      const isWithinPark = polygonIsWithin(polygon[0][0], selectedPark?.geom?.coordinates?.[0]);
      if (hasOverlap) {
        messageApi.open({
          type: 'error',
          content: 'The Zone boundaries overlaps with other Zone(s).',
        });
      }
      if (!isWithinPark) {
        messageApi.open({
          type: 'error',
          content: 'The Zone boundaries is not within the Park.',
        });
      }
      if (hasOverlap || !isWithinPark) {
        return;
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
        <CreateMapStep polygon={polygon} setPolygon={setPolygon} lines={lines} setLines={setLines} selectedPark={selectedPark} selectedParkZones={selectedParkZones}/>
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
