import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { createEvent, CreateEventData, EventStatusEnum, StaffResponse, StaffType } from '@lepark/data-access';
import { Button, Card, Col, Flex, Form, Input, Result, Row, Steps, message, notification } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import CreateDetailsStep from './components/CreateDetailsStep';
import { EventResponse } from '@lepark/data-access';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import moment from 'moment';

const center = {
  lat: 1.3503881629328163,
  lng: 103.85132690751749,
};

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const EventCreate = () => {
  const { user } = useAuth<StaffResponse>();
  const { parks, loading } = useFetchParks();
  const [currStep, setCurrStep] = useState<number>(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [createdData, setCreatedData] = useState<EventResponse | null>();
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const navigate = useNavigate();
  const notificationShown = useRef(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user?.role !== StaffType.SUPERADMIN && user?.role !== StaffType.MANAGER) {
      if (!notificationShown.current) {
        notification.error({
          message: 'Access Denied',
          description: 'You are not allowed to access the Event Creation page!',
        });
        notificationShown.current = true;
      }
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { dateRange, timeRange, parkId, ...rest } = values;

      // Combine date and time for start and end
      const startDateTime = dateRange[0].clone().hour(timeRange[0].hour()).minute(timeRange[0].minute()).second(0);
      const endDateTime = dateRange[1].clone().hour(timeRange[1].hour()).minute(timeRange[1].minute()).second(0);

      const finalData = {
        ...rest,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        status: EventStatusEnum.UPCOMING,
      };

      const response = await createEvent(finalData, selectedFiles);
      if (response?.status === 201) {
        setCurrStep(1);
        setCreatedData(response.data);
        messageApi.open({
          type: 'success',
          content: 'Event created successfully',
        });
      }
    } catch (error: any) {
      console.error(error);
      if (error.errorFields) {
        // Form validation error
        form.scrollToField(error.errorFields[0].name);
      } else {
        const errorMessage = error.message || error.toString();
        messageApi.error(errorMessage || 'An error occurred while creating the event.');
      }
    }
  };

  const content = [
    {
      key: 'details',
      children: (
        <CreateDetailsStep
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
      key: 'complete',
      children: <>Created</>,
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Event Management',
      pathKey: '/event',
      isMain: true,
    },
    {
      title: 'Create',
      pathKey: `/event/create`,
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
              description: 'Input Event details',
            },
            {
              title: 'Complete',
            },
          ]}
        />
        {currStep === 0 && (
          <>
             {content[0].children}
          <Row gutter={[24, 24]}>
          <Col xs={24} sm={24} md={24} lg={16} xl={16}>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }} className="max-w-[600px] mx-auto">
              <Button type="primary" className="w-full" onClick={handleSubmit}>
                Submit
              </Button>
            </Form.Item>
            </Col>
            </Row>
          </>
        )}
        {currStep === 1 && (
          <Flex justify="center" className="py-4">
            <Result
              status="success"
              title="Created new Event"
              extra={[
                <Button key="back" onClick={() => navigate('/event')}>
                  Back to Event Management
                </Button>,
                <Button type="primary" key="view" onClick={() => navigate(`/event/${createdData?.id}`)}>
                  View new Event
                </Button>,
              ]}
            />
          </Flex>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default EventCreate;
