import { ImageInput } from '@lepark/common-ui';
import {
  EventSuitabilityEnum,
  EventTypeEnum,
  FacilityResponse,
  getEventsByFacilityId,
  getFacilitiesByParkId,
  ParkResponse,
} from '@lepark/data-access';
import { Button, Divider, Form, FormInstance, Input, Select, DatePicker, Typography, TimePicker, InputNumber, Col, Row } from 'antd';
import { Dayjs } from 'dayjs';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import FacilityInfoCard from './FacilityInfoCard';
import { useFetchOpenFacilitiesByPark } from '../../../hooks/Facilities/useFetchFacilitiesByPark';
import { useFetchEventsByFacilityId } from '../../../hooks/Events/useFetchEventsByFacilityId';
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface CreateDetailsStepProps {
  form: FormInstance;
  parks: ParkResponse[];
  previewImages: string[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  onInputClick: (event: React.MouseEvent<HTMLInputElement>) => void;
}

const CreateDetailsStep = ({ form, parks, previewImages, handleFileChange, removeImage, onInputClick }: CreateDetailsStepProps) => {
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);
  const { facilities, isLoading: isLoadingFacilities, error: facilitiesError } = useFetchOpenFacilitiesByPark(selectedParkId);
  const [selectedFacility, setSelectedFacility] = useState<FacilityResponse | null>(null);
  const [maxCapacity, setMaxCapacity] = useState<number | null>(null);
  const [operatingHours, setOperatingHours] = useState<{ start: moment.Moment; end: moment.Moment }[]>([]);
  const { bookedDates, isLoading: isLoadingEvents, error: eventsError } = useFetchEventsByFacilityId(selectedFacility?.id || null);
  const [selectedDateRange, setSelectedDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);

  const onFacilityChange = (facilityId: string) => {
    const facility = facilities.find((f) => f.id === facilityId);
    setSelectedFacility(facility || null);
    setMaxCapacity(facility?.capacity || null);

    if (facility) {
      const allOperatingHours = facility.openingHours.map((openTime, index) => ({
        start: moment(openTime),
        end: moment(facility.closingHours[index]),
      }));

      setOperatingHours(allOperatingHours);
    } else {
      setOperatingHours([]);
    }

    form.setFieldsValue({ maxCapacity: undefined, timeRange: undefined, dateRange: undefined });
  };

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

  const onParkChange = (parkId: number) => {
    setSelectedParkId(parkId);
    form.setFieldsValue({ facilityId: undefined }); // Reset facility selection
  };

  const disabledDate = (current: moment.Moment) => {
    // Can't select days before today and today
    if (current && current < moment().endOf('day')) {
      return true;
    }

    // Check if the date is in the bookedDates array
    return bookedDates.some((bookedDate) => bookedDate.isSame(current, 'day'));
  };

  const selectedDayOperatingHours = useMemo(() => {
    if (!operatingHours.length || !selectedDateRange) return null;
    const [startDate, endDate] = selectedDateRange;

    // Ensure we're working with the correct date objects
    const start = moment(startDate.toDate());
    const end = moment(endDate.toDate());

    // Calculate the number of days in the range
    const daysInRange = end.diff(start, 'days') + 1;

    // Initialize latestStart with the start of the first day and earliestEnd with the end of the last day
    let latestStart = moment(start).startOf('day');
    let earliestEnd = moment(end).endOf('day');

    // Loop through each day in the date range
    for (let i = 0; i < daysInRange; i++) {
      const currentDate = moment(start).add(i, 'days');

      let dayOfWeek = currentDate.day() - 1;
      if (dayOfWeek === -1) dayOfWeek = 6; // Sunday becomes 6

      const dayHours = operatingHours[dayOfWeek];

      if (dayHours) {
        // Create moment objects for start and end times on the current date
        const startTime = moment(currentDate).set({
          hour: dayHours.start.hour(),
          minute: dayHours.start.minute(),
          second: 0,
          millisecond: 0,
        });
        const endTime = moment(currentDate).set({
          hour: dayHours.end.hour(),
          minute: dayHours.end.minute(),
          second: 0,
          millisecond: 0,
        });

        // Update latest start time
        if (startTime.format('HH:mm') > latestStart.format('HH:mm') || i === 0) {
          latestStart = startTime;
        }
        // Update earliest end time
        if (endTime.format('HH:mm') < earliestEnd.format('HH:mm') || i === 0) {
          earliestEnd = endTime;
        }
      }
    }

    return {
      start: latestStart,
      end: earliestEnd,
    };
  }, [operatingHours, selectedDateRange]);

  useEffect(() => {
    const dateRange = form.getFieldValue('dateRange');
    if (dateRange) {
      setSelectedDateRange([moment(dateRange[0]), moment(dateRange[1])]);
    }
  }, [form]);

  const onDateRangeChange = (dates: [moment.Moment, moment.Moment] | null) => {
    setSelectedDateRange(dates);
    // Clear the timeRange field when dates change
    form.setFieldsValue({ timeRange: undefined });
  };

  const disabledTime = (current: moment.Moment, type: 'start' | 'end') => {
    if (!selectedDayOperatingHours) return {};

    if (type === 'start') {
      return {
        disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter((h) => h < selectedDayOperatingHours.start.hour()),
        disabledMinutes: (selectedHour: number) => {
          if (selectedHour === selectedDayOperatingHours.start.hour()) {
            return Array.from({ length: 60 }, (_, i) => i).filter((m) => m < selectedDayOperatingHours.start.minute());
          }
          return [];
        },
      };
    }

    if (type === 'end') {
      return {
        disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter((h) => h > selectedDayOperatingHours.end.hour()),
        disabledMinutes: (selectedHour: number) => {
          if (selectedHour === selectedDayOperatingHours.end.hour()) {
            return Array.from({ length: 60 }, (_, i) => i).filter((m) => m > selectedDayOperatingHours.end.minute());
          }
          return [];
        },
      };
    }

    return {};
  };

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} sm={24} md={24} lg={16} xl={16}>
        <Form form={form} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
          <Form.Item name="parkId" label="Park" rules={[{ required: true }]}>
            <Select
              placeholder="Select a Park for this Event"
              options={parks?.map((park) => ({ key: park.id, value: park.id, label: park.name }))}
              onChange={onParkChange}
            />
          </Form.Item>

          <Form.Item name="facilityId" label="Facility" rules={[{ required: true }]}>
            {isLoadingFacilities ? (
              <div>Loading...</div>
            ) : (
              <Select
                key={facilities.length} // Force re-render when facilities change
                placeholder="Select a Facility for this Event"
                options={facilities.map((facility) => ({
                  key: facility.id,
                  value: facility.id,
                  label: facility.facilityName,
                }))}
                disabled={!form.getFieldValue('parkId') || facilities.length === 0}
                onChange={onFacilityChange}
                notFoundContent={facilities.length === 0 ? 'No facilities available' : undefined}
              />
            )}
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
          {previewImages?.length > 0 && (
            <Form.Item label="Image Previews">
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
                if (dates && dates[0] && dates[1]) {
                  onDateRangeChange([moment(dates[0].toDate()), moment(dates[1].toDate())]);
                } else {
                  onDateRangeChange(null);
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="Event Time"
            rules={[{ required: true }]}
            tooltip={{
              title: 'Time range is limited to facility operating hours across selected dates.',
            }}
          >
            <TimePicker.RangePicker
              className="w-full"
              use12Hours
              format="h:mm a"
              minuteStep={5}
              disabledTime={(time, type) => disabledTime(moment(time.valueOf()), type as 'start' | 'end')}
            />
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
  );
};

export default CreateDetailsStep;
