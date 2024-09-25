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
  getEventsByFacilityId,
} from '@lepark/data-access';
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
  message,
  notification,
  Switch,
  Radio,
  Col,
  Row,
} from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImages from '../../hooks/Images/useUploadImages';
import moment from 'moment';
import { useRestrictEvents } from '../../hooks/Events/useRestrictEvents';
import dayjs, { Dayjs } from 'dayjs';
import FacilityInfoCard from '../Event/components/FacilityInfoCard';
import { useFetchOpenFacilitiesByPark } from '../../hooks/Facilities/useFetchFacilitiesByPark';
import { useFetchEventsByFacilityId } from '../../hooks/Events/useFetchEventsByFacilityId';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const EventEdit = () => {
  const { user } = useAuth<StaffResponse>();
  const { id } = useParams();
  const { event, loading, park, facility } = useRestrictEvents(id);
  const [selectedFacility, setSelectedFacility] = useState<FacilityResponse | null>(null);
  const { facilities, isLoading: isFacilitiesLoading, error: facilitiesError } = useFetchOpenFacilitiesByPark(park?.id || null);
  const { bookedDates, isLoading: isEventsLoading, error: eventsError } = useFetchEventsByFacilityId(selectedFacility?.id || null, event?.id);
  const [messageApi, contextHolder] = message.useMessage();
  const { selectedFiles, previewImages, setPreviewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const navigate = useNavigate();
  const notificationShown = useRef(false);
  const [form] = Form.useForm();
  const [isCancelled, setIsCancelled] = useState(event?.status === EventStatusEnum.CANCELLED);
  const [maxCapacity, setMaxCapacity] = useState<number | null>(null);
  const [operatingHours, setOperatingHours] = useState<{ start: moment.Moment; end: moment.Moment } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      if (!event || !park) return;

      setIsLoading(true);

      try {
        const currentFacility = facilities.find((f) => f.id === event.facilityId);

        if (currentFacility) {
          setSelectedFacility(currentFacility);
          setMaxCapacity(currentFacility.capacity);
          setOperatingHours({
            start: moment(currentFacility.openingHours[0]),
            end: moment(currentFacility.closingHours[0]),
          });
        }

        const initialValues = {
          ...event,
          parkName: park.name,
          facilityId: event.facilityId,
          dateRange: [dayjs(event.startDate), dayjs(event.endDate)],
          timeRange: [dayjs(event.startTime), dayjs(event.endTime)],
          isCancelled: event.status === EventStatusEnum.CANCELLED,
        };

        setInitialValues(initialValues);
        setCurrentImages(event.images || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        messageApi.error('Failed to fetch data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, event, park, facilities]);

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

  const onFacilityChange = async (facilityId: string) => {
    const facility = facilities.find((f) => f.id === facilityId);
    if (facility) {
      setSelectedFacility(facility);
      setMaxCapacity(facility.capacity);
      setOperatingHours({
        start: moment(facility.openingHours[0]),
        end: moment(facility.closingHours[0]),
      });
    } else {
      setSelectedFacility(null);
      setMaxCapacity(null);
      setOperatingHours(null);
    }

    form.setFieldsValue({ maxCapacity: undefined, timeRange: undefined });
  };

  const handleSubmit = async () => {
    if (!event) return;
    try {
      const values = await form.validateFields();
      const { dateRange, timeRange, parkName, isCancelled, ...rest } = values;

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
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('There is already an event scheduled')) {
        messageApi.error('There is already an event scheduled at this facility during the specified time.');
      } else {
        messageApi.error(errorMessage || 'Failed to update event details.');
      }
    }
  };

  const handleCurrentImageClick = (index: number) => {
    setCurrentImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const disabledDate = (current: moment.Moment) => {
    if (!event) return false;

    const today = moment().startOf('day');

    // Allow selection from today onwards
    if (current && current.isBefore(today)) {
      return true;
    }

    // Check if the date is in the bookedDates array
    return bookedDates.some((bookedDate) => bookedDate.isSame(current, 'day'));
  };

  const disabledTime = (current: moment.Moment, type: 'start' | 'end') => {
    if (!operatingHours) return {};

    const currentHour = current.hour();
    const currentMinute = current.minute();

    if (type === 'start') {
      return {
        disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter((h) => h < operatingHours.start.hour()),
        disabledMinutes: (selectedHour: number) => {
          if (selectedHour === operatingHours.start.hour()) {
            return Array.from({ length: 60 }, (_, i) => i).filter((m) => m < operatingHours.start.minute());
          }
          return [];
        },
      };
    }

    if (type === 'end') {
      return {
        disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter((h) => h > operatingHours.end.hour()),
        disabledMinutes: (selectedHour: number) => {
          if (selectedHour === operatingHours.end.hour()) {
            return Array.from({ length: 60 }, (_, i) => i).filter((m) => m > operatingHours.end.minute());
          }
          return [];
        },
      };
    }

    return {};
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
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={24} md={24} lg={16} xl={16}>
              <Form
                form={form}
                onFinish={handleSubmit}
                labelCol={{ span: 8 }}
                className="max-w-[600px] mx-auto mt-8"
                initialValues={initialValues}
              >
                <Form.Item name="parkName" label="Park">
                  <Select placeholder={park?.name} disabled />
                </Form.Item>

                <Form.Item name="facilityId" label="Facility" rules={[{ required: true }]}>
                  <Select
                    placeholder="Select a Facility for this Event"
                    options={facilities.map((facility) => ({ key: facility.id, value: facility.id, label: facility.facilityName }))}
                    onChange={onFacilityChange}
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
                    {
                      validator: (_, value) => {
                        if (value > maxCapacity!) {
                          return Promise.reject(`Capacity cannot exceed ${maxCapacity}`);
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber min={1} max={maxCapacity || undefined} placeholder="Capacity" />
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
                  <TimePicker.RangePicker
                    className="w-full"
                    use12Hours
                    format="h:mm a"
                    minuteStep={5}
                    disabledTime={(time, type) => disabledTime(moment(time.valueOf()), type as 'start' | 'end')}
                  />
                </Form.Item>
                <Divider orientation="left">Event Status</Divider>

                <Form.Item name="isCancelled" label="Cancel Event" rules={[{ required: true }]}>
                  <Radio.Group options={cancelOptions} onChange={(e) => setIsCancelled(e.target.value)} optionType="button" />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8 }}>
                  <Button type="primary" className="w-full" htmlType="submit">
                    Save Changes
                  </Button>
                </Form.Item>
              </Form>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <div
                style={{
                  position: 'sticky',
                  top: 20,
                  maxWidth: '600px',
                  width: '100%',
                  padding: '20px',
                  paddingRight: '24px',
                }}
              >
                <FacilityInfoCard facility={selectedFacility} />
              </div>
            </Col>
          </Row>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default EventEdit;
