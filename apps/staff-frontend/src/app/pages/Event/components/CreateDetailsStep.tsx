import { ImageInput } from '@lepark/common-ui';
import { EventSuitabilityEnum, EventTypeEnum, FacilityResponse, getEventsByFacilityId, getFacilitiesByParkId, ParkResponse } from '@lepark/data-access';
import { Button, Divider, Form, FormInstance, Input, Select, DatePicker, Typography, TimePicker, InputNumber, Col, Row } from 'antd';
import { Dayjs } from 'dayjs';
import moment from 'moment';
import { useState } from 'react';
import FacilityInfoCard from './FacilityInfoCard';
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
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<FacilityResponse | null>(null);
  const [maxCapacity, setMaxCapacity] = useState<number | null>(null);
  const [operatingHours, setOperatingHours] = useState<{ start: moment.Moment; end: moment.Moment } | null>(null);
  const [bookedDates, setBookedDates] = useState<moment.Moment[]>([]);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(false);

  const onFacilityChange = (facilityId: string) => {
    const facility = facilities.find((f) => f.id === facilityId);
    setSelectedFacility(facility || null);
    setMaxCapacity(facility?.capacity || null);

    if (facility) {
      // Assuming the first element of openingHours and closingHours arrays is used
      const openingTime = moment(facility.openingHours[0]);
      const closingTime = moment(facility.closingHours[0]);
      
      setOperatingHours({
        start: openingTime,
        end: closingTime
      });

      fetchFacilityEvents(facilityId);
    } else {
      setOperatingHours(null);
      setBookedDates([]);
    }
    
    form.setFieldsValue({ maxCapacity: undefined, timeRange: undefined });
  };

  const fetchFacilityEvents = async (facilityId: string) => {
    try {
      const response = await getEventsByFacilityId(facilityId);
      const events = response.data;
      const bookedDates = events.flatMap(event => {
        const start = moment(event.startDate);
        const end = moment(event.endDate);
        const dates = [];
        for (let m = moment(start); m.diff(end, 'days') <= 0; m.add(1, 'days')) {
          dates.push(m.clone());
        }
        return dates;
      });
      setBookedDates(bookedDates);
    } catch (error) {
      console.error('Failed to fetch facility events:', error);
    }
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

  const onParkChange = async (parkId: number) => {
    if (parkId) {
      setIsLoadingFacilities(true);
      try {
        const fetchedFacilitiesResponse = await getFacilitiesByParkId(parkId);
        setFacilities(fetchedFacilitiesResponse.data);
        form.setFieldsValue({ facilityId: undefined }); // Reset facility selection
      } catch (error) {
        console.error('Failed to fetch facilities:', error);
        setFacilities([]);
      } finally {
        setIsLoadingFacilities(false);
      }
    } else {
      setFacilities([]);
    }
  };

  const disabledDate = (current: moment.Moment) => {
    // Can't select days before today and today
    if (current && current < moment().endOf('day')) {
      return true;
    }
  
    // Check if the date is in the bookedDates array
    return bookedDates.some(bookedDate => bookedDate.isSame(current, 'day'));
  };

  const disabledTime = (current: moment.Moment, type: 'start' | 'end') => {
    if (!operatingHours) return {};

    const currentHour = current.hour();
    const currentMinute = current.minute();

    if (type === 'start') {
      return {
        disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter(h => h < operatingHours.start.hour()),
        disabledMinutes: (selectedHour: number) => {
          if (selectedHour === operatingHours.start.hour()) {
            return Array.from({ length: 60 }, (_, i) => i).filter(m => m < operatingHours.start.minute());
          }
          return [];
        },
      };
    }

    if (type === 'end') {
      return {
        disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter(h => h > operatingHours.end.hour()),
        disabledMinutes: (selectedHour: number) => {
          if (selectedHour === operatingHours.end.hour()) {
            return Array.from({ length: 60 }, (_, i) => i).filter(m => m > operatingHours.end.minute());
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
                label: facility.facilityName 
              }))}
              disabled={!form.getFieldValue('parkId') || facilities.length === 0}
              onChange={onFacilityChange}
              notFoundContent={facilities.length === 0 ? "No facilities available" : undefined}
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
            <InputNumber 
              min={1} 
              max={maxCapacity || undefined}
              placeholder="Capacity" 
            />
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
            <RangePicker className="w-full" format="YYYY-MM-DD" disabledDate={(current) => disabledDate(moment(current.toDate()))} />
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
        </Form>
      </Col>
      <Col xs={24} sm={24} md={24} lg={8} xl={8}>
        <div style={{ 
          position: 'sticky', 
          top: 20,
          maxWidth: '600px',
          width: '100%',
          padding: '20px',
          paddingRight: '24px',
        }}>
          <FacilityInfoCard facility={selectedFacility}/>
        </div>
      </Col>
    </Row>
  );
};

export default CreateDetailsStep;
