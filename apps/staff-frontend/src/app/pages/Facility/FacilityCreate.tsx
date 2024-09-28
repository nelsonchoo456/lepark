import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { createFacility, StaffResponse, StaffType, FacilityResponse } from '@lepark/data-access';
import { Button, Card, Flex, Form, Input, Result, Steps, message, notification } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import CreateDetailsStep from './components/CreateDetailsStep';
import CreateMapStep from './components/CreateMapStep';
import dayjs from 'dayjs';
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

const FacilityCreate = () => {
  const { user } = useAuth<StaffResponse>();
  const { parks } = useFetchParks();
  const [currStep, setCurrStep] = useState<number>(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [createdData, setCreatedData] = useState<FacilityResponse | null>(null);
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const navigate = useNavigate();
  const notificationShown = useRef(false);

  const [formValues, setFormValues] = useState<any>({});
  const [form] = Form.useForm();
  const [lat, setLat] = useState(center.lat);
  const [lng, setLng] = useState(center.lng);

  const handleCurrStep = async (step: number) => {
    if (step === 0) {
      setCurrStep(0);
    } else if (step === 1) {
      try {
        const values = await form.validateFields();
        setFormValues(values);
        setCurrStep(1);
      } catch (error) {
        console.error('Validation failed:', error);
      }
    } else {
      return;
    }
  };

  const adjustLatLng = ({ lat, lng }: AdjustLatLngInterface) => {
    if (lat) setLat(lat);
    if (lng) setLng(lng);
  };

  const daysOfTheWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const handleSubmit = async () => {
    try {
      const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, ...rest } = formValues;

      const openingHours: any[] = [];
      const closingHours: any[] = [];
      daysOfTheWeek.forEach((day, index) => {
        openingHours.push(formValues[day][0] ? formValues[day][0].toISOString() : null);
        closingHours.push(formValues[day][1] ? formValues[day][1].toISOString() : null);
      });
      const long = lng;

      const finalData = {
        ...rest,
        openingHours,
        closingHours,
        lat,
        long,
      };

      console.log(finalData);
      const response = await createFacility(finalData, selectedFiles);
      if (response?.status && response.status === 201) {
        setCurrStep(2);
        setCreatedData(response.data);
      }
    } catch (error: any) {
      console.log(error);
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('A facility with this name already exists in the park.')) {
        messageApi.error('A facility with this name already exists in the park.');
      } else {
        messageApi.error(errorMessage || 'An error occurred while creating the facility.');
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
          parks={parks}
          user={user}
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
      title: 'Facility Management',
      pathKey: '/facilities',
      isMain: true,
    },
    {
      title: 'Create',
      pathKey: `/facilities/create`,
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
              description: 'Input Facility details',
            },
            {
              title: 'Location',
              description: 'Indicate Facility location',
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
              title="Created new Facility"
              subTitle={createdData && <>Facility name: {createdData.facilityName}</>}
              extra={[
                <Button key="back" onClick={() => navigate('/facilities')}>
                  Back to Facility Management
                </Button>,
                <Button type="primary" key="view" onClick={() => navigate(`/facilities/${createdData?.id}`)}>
                  View new Facility
                </Button>,
              ]}
            />
          </Flex>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default FacilityCreate;
