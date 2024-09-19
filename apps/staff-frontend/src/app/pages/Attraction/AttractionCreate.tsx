import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { createAttraction, CreateAttractionData, StaffResponse, StaffType } from '@lepark/data-access';
import { Button, Card, Flex, Form, Input, Result, Steps, message, notification } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import CreateDetailsStep from './components/CreateDetailsStep';
import CreateMapStep from './components/CreateMapStep';
import dayjs from 'dayjs';
import { AttractionResponse } from '@lepark/data-access';
import { useFetchZones } from '../../hooks/Zones/useFetchZones';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';

const center = {
  lat: 1.3503881629328163,
  lng: 103.85132690751749,
};

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const daysOfTheWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const AttractionCreate = () => {
  const { user } = useAuth<StaffResponse>();
  const { parks, loading } = useFetchParks();
  const [currStep, setCurrStep] = useState<number>(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [createdData, setCreatedData] = useState<AttractionResponse | null>();
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const navigate = useNavigate();
  const notificationShown = useRef(false);

  // Form Values
  const [formValues, setFormValues] = useState<any>({});
  const [form] = Form.useForm();
  // Map Values
  const [lat, setLat] = useState(center.lat);
  const [lng, setLng] = useState(center.lng);

  useEffect(() => {
    if (user?.role !== StaffType.SUPERADMIN && user?.role !== StaffType.MANAGER) {
      if (!notificationShown.current) {
        notification.error({
          message: 'Access Denied',
          description: 'You are not allowed to access the Attraction Creation page!',
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
        const values = await form.validateFields();
        setFormValues(values);
        setCurrStep(1);
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
      const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, ...rest } = formValues;
      
      const openingHours: any[] = [];
      const closingHours: any[] = [];
      daysOfTheWeek.forEach((day) => {
        openingHours.push(formValues[day]?.[0] ? formValues[day][0].toISOString() : null)
        closingHours.push(formValues[day]?.[1] ? formValues[day][1].toISOString() : null)
      })

      const finalData = {
        ...rest,
        lat,
        lng,
        openingHours,
        closingHours,
      };
  
      const response = await createAttraction(finalData, selectedFiles);
      if (response?.status === 201) {
        setCurrStep(2);
        setCreatedData(response.data as AttractionResponse);
        messageApi.open({
          type: 'success',
          content: 'Attraction created successfully',
        });
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('An attraction with this title already exists in the park')) {
        messageApi.error('An attraction with this title already exists in the park.');
      } else {
        messageApi.error(errorMessage || 'An error occurred while creating the attraction');
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
          adjustLatLng={adjustLatLng}
          lat={lat}
          lng={lng}
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

  const breadcrumbItems = [
    {
      title: 'Attraction Management',
      pathKey: '/attraction',
      isMain: true,
    },
    {
      title: 'Create',
      pathKey: `/attractions/create`,
      isCurrent: true,
    },
  ];

  if (user?.role !== StaffType.SUPERADMIN && user?.role !== StaffType.MANAGER) {
    return <></>;
  }
  
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
              description: 'Input Attraction details',
            },
            {
              title: 'Location',
              description: 'Indicate Attraction location',
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
                Longitude: <Input value={lng} />
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
              title="Created new Attraction"
            //   subTitle={createdData && <>Attraction name: {createdData.name}</>}
              extra={[
                <Button key="back" onClick={() => navigate('/attraction')}>
                  Back to Attraction Management
                </Button>,
                <Button type="primary" key="view" onClick={() => navigate(`/attraction/${createdData?.id}`)}>
                  View new Attraction
                </Button>,
              ]}
            />
          </Flex>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default AttractionCreate;