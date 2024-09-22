import { ImageInput } from '@lepark/common-ui';
import { EventSuitabilityEnum, EventTypeEnum, FacilityResponse, getFacilitiesByParkId, ParkResponse } from '@lepark/data-access';
import { Button, Divider, Form, FormInstance, Input, Select, DatePicker, Typography, TimePicker, InputNumber } from 'antd';
import { Dayjs } from 'dayjs';
import moment from 'moment';
import { useState } from 'react';
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
      try {
        const fetchedFacilitiesResponse = await getFacilitiesByParkId(parkId);
        setFacilities(fetchedFacilitiesResponse.data);
        form.setFieldsValue({ facilityId: undefined }); // Reset facility selection
      } catch (error) {
        console.error('Failed to fetch facilities:', error);
        setFacilities([]);
      }
    } else {
      setFacilities([]);
    }
  };

  const disabledDate = (current: moment.Moment) => {
    // Can't select days before today and today
    return current && current < moment().endOf('day');
  };

  return (
    <Form form={form} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
      <Form.Item name="parkId" label="Park" rules={[{ required: true }]}>
        <Select
          placeholder="Select a Park for this Event"
          options={parks?.map((park) => ({ key: park.id, value: park.id, label: park.name }))}
          onChange={onParkChange}
        />
      </Form.Item>

      <Form.Item name="facilityId" label="Facility" rules={[{ required: true }]}>
        <Select
          placeholder="Select a Facility for this Event"
          options={facilities.map((facility) => ({ key: facility.id, value: facility.id, label: facility.facilityName }))}
          disabled={!form.getFieldValue('parkId')}
        />
      </Form.Item>

      <Divider orientation="left">Event Details</Divider>

      <Form.Item name="title" label="Title" rules={[{ required: true }, { min: 3, message: 'Title must be at least 3 characters long' }]}>
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
        <TimePicker.RangePicker className="w-full" use12Hours format="h:mm a" minuteStep={5} />
      </Form.Item>
    </Form>
  );
};

export default CreateDetailsStep;
