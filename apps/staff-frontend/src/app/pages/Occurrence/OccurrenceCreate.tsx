import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { createOccurrence, StaffResponse, StaffType } from '@lepark/data-access';
import { Button, Card, Flex, Form, Input, Result, Steps, message, notification } from 'antd';
import PageHeader from '../../components/main/PageHeader';
import CreateDetailsStep from './components/CreateDetailsStep';
import CreateMapStep from './components/CreateMapStep';
import moment from 'moment';
import { OccurrenceResponse, ZoneResponse } from '@lepark/data-access';
import dayjs from 'dayjs';
import { useFetchZones } from '../../hooks/Zones/useFetchZones';
import { useFetchSpecies } from '../../hooks/Species/useFetchSpecies';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useFetchParks } from '../../hooks/Parks/useFetchParks'; // Add this import

const center = {
  lat: 1.3503881629328163,
  lng: 103.85132690751749,
};

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const OccurrenceCreate = () => {
  const { user } = useAuth<StaffResponse>();
  const { zones, loading } = useFetchZones();
  const { species, speciesLoading } = useFetchSpecies();
  const { parks, parksLoading } = useFetchParks(); // Add this hook
  const [currStep, setCurrStep] = useState<number>(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [createdData, setCreatedData] = useState<OccurrenceResponse | null>();
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const navigate = useNavigate();
  const notificationShown = useRef(false);
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null); // Add this state

  // Form Values
  const [formValues, setFormValues] = useState<any>({});
  const [form] = Form.useForm();
  // Map Values
  const [lat, setLat] = useState(center.lat);
  const [lng, setLng] = useState(center.lng);

  useEffect(() => {
    if (user?.role !== StaffType.SUPERADMIN && user?.role !== StaffType.MANAGER && user?.role !== StaffType.BOTANIST && user?.role !== StaffType.ARBORIST) {
      if (!notificationShown.current) {
      notification.error({
        message: 'Access Denied',
        description: 'You are not allowed to access the Occurrence Creation page!',
      });
      notificationShown.current = true;
    }
      navigate('/');
    }
  }, [user, navigate]);

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
        dateObserved: formValues.dateObserved ? dayjs(formValues.dateObserved).toISOString() : null,
        dateOfBirth: formValues.dateOfBirth ? dayjs(formValues.dateOfBirth).toISOString() : null,
      };

      // Remove parkId from finalData if it exists
      delete finalData.parkId;

      const response = await createOccurrence(finalData, selectedFiles);
      if (response?.status && response.status === 201) {
        setCurrStep(2);
        setCreatedData(response.data);
      }
    } catch (error) {
      console.log(error);
      messageApi.open({
        type: 'error',
        content: 'Unable to create Occurrence. Please try again later.',
      });
    }
  };

  const content = [
    {
      key: 'details',
      children: (
        <CreateDetailsStep
          handleCurrStep={handleCurrStep}
          form={form}
          zones={zones}
          species={species}
          previewImages={previewImages}
          handleFileChange={handleFileChange}
          removeImage={removeImage}
          onInputClick={onInputClick}
          parks={parks} // Add this prop
          selectedParkId={selectedParkId} // Add this prop
          setSelectedParkId={setSelectedParkId} // Add this prop
          user={user} // Add this prop
        />
      ),
    },
    {
      key: 'location',
      children: (
        <CreateMapStep
          handleCurrStep={handleCurrStep}
          adjustLatLng={adjustLatLng}
          lat={lat}
          lng={lng}
          zones={zones}
          formValues={formValues}
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
      title: 'Occurrence Management',
      pathKey: '/occurrences',
      isMain: true,
    },
    {
      title: 'Create',
      pathKey: `/occurrences/create`,
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
