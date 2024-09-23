import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { createSensor, StaffResponse } from '@lepark/data-access';
import { Button, Card, Flex, Form, Input, Result, Steps, message, notification } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import SensorCreateDetails from './components/SensorCreateDetails';
import SensorCreateMap from './components/SensorCreateMap';
import { SensorResponse } from '@lepark/data-access';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useFetchHubs } from '../../hooks/Hubs/useFetchHubs';
import { useFetchFacilities } from '../../hooks/Facilities/useFetchFacilities';

const center = {
  lat: 1.3503881629328163,
  lng: 103.85132690751749,
};



// Add this near the top of the file, after the imports
export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const SensorCreate2 = () => {
  const { user } = useAuth<StaffResponse>();
  const { hubs, loading: hubsLoading } = useFetchHubs();
  const { facilities, loading: facilitiesLoading } = useFetchFacilities();
  const [currStep, setCurrStep] = useState<number>(0);
  const [createdData, setCreatedData] = useState<SensorResponse | null>();
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const notificationShown = useRef(false);

  // Form Values
  const [formValues, setFormValues] = useState<any>({});
  const [form] = Form.useForm();

  // Map Values
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
    }
  };

const adjustLatLng = ({ lat: newLat, lng: newLng }: AdjustLatLngInterface) => {
  if (newLat !== undefined && newLat !== null) setLat(newLat);
  if (newLng !== undefined && newLng !== null) setLng(newLng);
};

  const breadcrumbItems = [
    {
      title: 'Sensor Management',
      pathKey: '/sensor',
      isMain: true,
    },
    {
      title: 'Create Sensor',
      pathKey: `/sensor/create`,
      isCurrent: true,
    },
  ];

  const handleSubmit = async () => {
    try {
      const sensorData = {
        ...formValues,
        latitude: lat,
        longitude: lng,
      };
      const response = await createSensor(sensorData, selectedFiles);
      setCreatedData(response.data);
      setCurrStep(2);
    } catch (error) {
      messageApi.error('Failed to create sensor. Please try again.');
    }
  };



  const content = [
    {
      key: 'details',
    children: (
      <SensorCreateDetails
        handleCurrStep={handleCurrStep}
        form={form}
        hubs={hubs}
        facilities={facilities}
        previewImages={previewImages}
        handleFileChange={handleFileChange}
        removeImage={removeImage}
        onInputClick={onInputClick}
        user={user}
        onFacilityChange={(value) => {
          if (value) {
            form.setFieldsValue({ facilityId: value});
          }
        }}
      />
      ),
    },
    {
      key: 'map',
      children: (
        <SensorCreateMap
          handleCurrStep={handleCurrStep}
          adjustLatLng={adjustLatLng}
          lat={lat}
          lng={lng}
          formValues={formValues}
        />
      ),
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
              description: 'Input Sensor details',
            },
            {
              title: 'Location',
              description: 'Indicate Sensor location',
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
              title="Created new Sensor"
              subTitle={createdData && <>Sensor name: {createdData.sensorName}</>}
              extra={[
                <Button key="back" onClick={() => navigate('/sensor')}>
                  Back to Sensor Management
                </Button>,
                <Button type="primary" key="view" onClick={() => navigate(`/sensor/${createdData?.id}`)}>
                  View new Sensor
                </Button>,
              ]}
            />
          </Flex>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default SensorCreate2;
