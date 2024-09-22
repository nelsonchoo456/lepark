import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import {
  getEventById,
  updateEventDetails,
  EventResponse,
  StaffResponse,
  StaffType,
  EventStatusEnum,
  EventTypeEnum,
  EventSuitabilityEnum,
  getFacilitiesByParkId,
  FacilityResponse,
} from '@lepark/data-access';
import { Button, Card, Divider, Form, Input, Select, DatePicker, TimePicker, InputNumber, message, notification, Switch, Radio } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImages from '../../hooks/Images/useUploadImages';
import moment from 'moment';
import { useRestrictEvents } from '../../hooks/Events/useRestrictEvents';
import dayjs, { Dayjs } from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const EventEdit = () => {
  const { user } = useAuth<StaffResponse>();
  const { id } = useParams();
  const { event, loading, park, facility } = useRestrictEvents(id);
  const [messageApi, contextHolder] = message.useMessage();
  const { selectedFiles, previewImages, setPreviewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const navigate = useNavigate();
  const notificationShown = useRef(false);
  const [form] = Form.useForm();
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);
  const [isCancelled, setIsCancelled] = useState(event?.status === EventStatusEnum.CANCELLED);


  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      if (!event) return;

      const initialValues = {
        ...event,
        dateRange: [dayjs(event.startDate), dayjs(event.endDate)],
        timeRange: [dayjs(event.startTime), dayjs(event.endTime)],
      };
      if (event.images) {
        setCurrentImages(event.images);
      }
      const defaultIsCancelled = event.status === EventStatusEnum.CANCELLED;
      setIsCancelled(defaultIsCancelled);
      form.setFieldsValue({ isCancelled: defaultIsCancelled });
      form.setFieldsValue(initialValues);

      if (park) {
        try {
          const facilitiesResponse = await getFacilitiesByParkId(park.id);
          setFacilities(facilitiesResponse.data);
        } catch (error) {
          console.error('Error fetching facilities:', error);
          messageApi.error('Failed to fetch facilities');
        }
      }
    };
    fetchData();
  }, [id, event, form, messageApi]);

  const eventStatusOptions = [
    { value: EventStatusEnum.UPCOMING, label: 'Upcoming' },
    { value: EventStatusEnum.ONGOING, label: 'Ongoing' },
    { value: EventStatusEnum.COMPLETED, label: 'Completed' },
    { value: EventStatusEnum.CANCELLED, label: 'Cancelled' },
  ];

  const eventTypeOptions = [
    { value: EventTypeEnum.WORKSHOP, label: 'Workshop' },
    { value: EventTypeEnum.EXHIBITION, label: 'Exhibition' },
    { value: EventTypeEnum.GUIDED_TOUR, label: 'Guided Tour' },
    { value: EventTypeEnum.PERFORMANCE, label: 'Performance' },
    { value: EventTypeEnum.TALK, label: 'Talk' },
    { value: EventTypeEnum.COMPETITION, label: 'Competition' },
    { value: EventTypeEnum.FESTIVAL, label: 'Festival' },
    { value: EventTypeEnum.CONFERENCE, label: 'Conference' },
  ];

  const eventSuitabilityOptions = [
    { value: EventSuitabilityEnum.ANYONE, label: 'Anyone' },
    { value: EventSuitabilityEnum.FAMILIES_AND_FRIENDS, label: 'Families and Friends' },
    { value: EventSuitabilityEnum.CHILDREN, label: 'Children' },
    { value: EventSuitabilityEnum.NATURE_ENTHUSIASTS, label: 'Nature Enthusiasts' },
    { value: EventSuitabilityEnum.PETS, label: 'Pets' },
    { value: EventSuitabilityEnum.FITNESS_ENTHUSIASTS, label: 'Fitness Enthusiasts' },
  ];

  const handleSubmit = async () => {
    if (!event) return;
    try {
      const values = await form.validateFields();
      const { dateRange, timeRange, parkId, isCancelled, ...rest } = values;

      // Combine date and time for start and end
      const startDateTime = dayjs(dateRange[0]).hour(timeRange[0].hour()).minute(timeRange[0].minute()).second(0);
      const endDateTime = dayjs(dateRange[1]).hour(timeRange[1].hour()).minute(timeRange[1].minute()).second(0);

      const finalData = {
        ...rest,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        status: isCancelled ? EventStatusEnum.CANCELLED : EventStatusEnum.UPCOMING,
      };

      const changedData: Partial<EventResponse> = Object.keys(finalData).reduce((acc, key) => {
        const typedKey = key as keyof EventResponse;
        if (JSON.stringify(finalData[typedKey]) !== JSON.stringify(event[typedKey])) {
          acc[typedKey] = finalData[typedKey];
        }
        return acc;
      }, {} as Partial<EventResponse>);

      changedData.images = currentImages;
      const response = await updateEventDetails(event.id, changedData, selectedFiles);
      setPreviewImages([]);
      if (response.status === 200) {
        messageApi.success('Saved changes to Event. Redirecting to Event details page...');
        setTimeout(() => {
          navigate(`/event/${event.id}`);
        }, 1000);
      }
    } catch (error: any) {
      console.error(error);
      messageApi.error('An unexpected error occurred while updating the event.');
    }
  };

  const handleCurrentImageClick = (index: number) => {
    setCurrentImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const disabledDate = (current: moment.Moment) => {
    if (!event) return false;

    const originalStartDate = moment(event.startDate).startOf('day');
    const today = moment().startOf('day');

    // Allow selection from the original start date or today, whichever is earlier
    const earliestSelectableDate = originalStartDate.isBefore(today) ? originalStartDate : today;

    return current && current.isBefore(earliestSelectableDate);
  };

  const cancelOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
  ];

  const breadcrumbItems = [
    {
      title: 'Event Management',
      pathKey: '/event',
      isMain: true,
    },
    {
      title: event?.title ? event.title : 'Details',
      pathKey: `/event/${event?.id}`,
    },
    {
      title: 'Edit',
      pathKey: `/event/${event?.id}/edit`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Form form={form} onFinish={handleSubmit} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
          <Form.Item name="parkId" label="Park">
            <Select placeholder={park?.name} disabled />
          </Form.Item>

          <Form.Item name="facilityId" label="Facility" rules={[{ required: true }]}>
            <Select
              placeholder="Select a Facility for this Event"
              options={facilities.map((facility) => ({ key: facility.id, value: facility.id, label: facility.facilityName }))}
            />
          </Form.Item>

          <Divider orientation="left">Event Details</Divider>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true }, { min: 3, message: 'Title must be at least 3 characters long' }]}
          >
            <Input placeholder="Event Title" />
          </Form.Item>

          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea placeholder="Describe the Event" autoSize={{ minRows: 3, maxRows: 5 }} />
          </Form.Item>

          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select placeholder="Select an Event Type" options={eventTypeOptions} />
          </Form.Item>

          <Form.Item name="suitability" label="Suitability" rules={[{ required: true }]}>
            <Select placeholder="Select an Event Suitability" options={eventSuitabilityOptions} />
          </Form.Item>



          <Form.Item
            name="maxCapacity"
            label="Max Capacity"
            rules={[
              { required: true, message: 'Please input the maximum capacity' },
              { type: 'number', min: 1, message: 'Capacity must be at least 1' },
            ]}
          >
            <InputNumber min={1} placeholder="Capacity" />
          </Form.Item>

          <Form.Item label="Images">
            <ImageInput type="file" multiple onChange={handleFileChange} accept="image/png, image/jpeg" onClick={onInputClick} />
          </Form.Item>
          <Form.Item label="Current Images">
            <div className="flex flex-wrap gap-2">
              {currentImages?.map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`Preview ${index}`}
                  className="w-20 h-20 object-cover rounded border-[1px] border-green-100"
                  onClick={() => handleCurrentImageClick(index)}
                />
              ))}
            </div>
          </Form.Item>
          {previewImages?.length > 0 && (
            <Form.Item label="New Images">
              <div className="flex flex-wrap gap-2">
                {previewImages.map((imgSrc, index) => (
                  <img
                    key={index}
                    src={imgSrc}
                    alt={`Preview ${index}`}
                    className="w-20 h-20 object-cover rounded border-[1px] border-green-100"
                    onClick={() => removeImage(index)}
                  />
                ))}
              </div>
            </Form.Item>
          )}

          <Divider orientation="left">Event Timings</Divider>

          <Form.Item name="dateRange" label="Event Dates" rules={[{ required: true }]}>
            <RangePicker
              className="w-full"
              format="YYYY-MM-DD"
              disabledDate={(current) => disabledDate(moment(current.toDate()))}
              onChange={(dates, dateStrings) => {
                if (dates) {
                  form.setFieldsValue({
                    dateRange: dates,
                  });
                } else {
                  form.setFieldsValue({ dateRange: null });
                }
              }}
            />
          </Form.Item>

          <Form.Item name="timeRange" label="Event Time" rules={[{ required: true }]}>
            <TimePicker.RangePicker className="w-full" use12Hours format="h:mm a" minuteStep={5} />
          </Form.Item>

          <Divider orientation="left">Event Status</Divider>
          
          <Form.Item name="isCancelled" label="Cancel Event" rules={[{ required: true }]} >
        <Radio.Group
          options={cancelOptions}
          onChange={(e) => setIsCancelled(e.target.value)}
          optionType="button"
        />
      </Form.Item>


          <Form.Item wrapperCol={{ offset: 8 }}>
            <Button type="primary" className="w-full" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </ContentWrapperDark>
  );
};

export default EventEdit;
