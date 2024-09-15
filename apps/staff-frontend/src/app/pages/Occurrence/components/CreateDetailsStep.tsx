import { ImageInput } from '@lepark/common-ui';
import { SpeciesResponse, ZoneResponse } from '@lepark/data-access';
import { Button, DatePicker, Divider, Form, FormInstance, Input, InputNumber, Select } from 'antd';
import dayjs from 'dayjs';
import moment from 'moment';
const { TextArea } = Input;

interface CreateDetailsStepProps {
  handleCurrStep: (step: number) => void;
  form: FormInstance;
  zones: ZoneResponse[];
  species: SpeciesResponse[];
  previewImages: string[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  onInputClick: (event: React.MouseEvent<HTMLInputElement>) => void;
}

const CreateDetailsStep = ({
  handleCurrStep,
  form,
  zones,
  species,
  previewImages,
  handleFileChange,
  removeImage,
  onInputClick,
}: CreateDetailsStepProps) => {
  const nonExstinctSpecies = species.filter((species) => species.conservationStatus !== "EXTINCT")
  const decarbonizationTypeOptions = [
    {
      value: 'TREE_TROPICAL',
      label: 'Tree Tropical',
    },
    {
      value: 'TREE_MANGROVE',
      label: 'Tree Mangronve',
    },
    {
      value: 'SHRUB',
      label: 'Shrub',
    },
  ];

  const occurrenceStatusOptions = [
    {
      value: 'HEALTHY',
      label: 'Healthy',
    },
    {
      value: 'MONITOR_AFTER_TREATMENT',
      label: 'Monitor After Treatment',
    },
    {
      value: 'NEEDS_ATTENTION',
      label: 'Needs Attention',
    },
    {
      value: 'URGENT_ACTION_NEEDED',
      label: 'Urgent Action Needed',
    },
    {
      value: 'REMOVED',
      label: 'Removed',
    },
  ];

  const validateDates = (form: FormInstance) => ({
    validator(_: any, value: moment.Moment) {
      const dateOfBirth = form.getFieldValue('dateOfBirth') as moment.Moment;
  
      if (!value) {
        // return Promise.reject(new Error('This field is required'));
      }
  
      if (value.isAfter(moment(), 'day')) {
        return Promise.reject(new Error('Date cannot be beyond today'));
      }
  
      if (dateOfBirth && value.isBefore(dateOfBirth, 'day')) {
        return Promise.reject(new Error('Date Observed cannot be earlier than Date of Birth'));
      }
  
      return Promise.resolve();
    }
  });

  const validateDateOfBirth = {
    validator(_: any, value: moment.Moment) {
      if (value.isAfter(moment(), 'day')) {
        return Promise.reject(new Error('Date of Birth cannot be beyond today'));
      }
  
      return Promise.resolve();
    }
  };
  

  return (
    <Form
      form={form}
      // style={{ maxWidth: 50 }}
      labelCol={{ span: 8 }}
      className="max-w-[600px] mx-auto mt-8"
    >
      <Divider orientation="left">Select the Zone, Species</Divider>

      <Form.Item name="zoneId" label="Zone" rules={[{ required: true }]}>
        <Select
          placeholder="Select a Zone that this Occurrence belongs to"
          options={zones?.map((zone) => ({ key: zone.id, value: zone.id, label: zone.name }))}
        />
      </Form.Item>
      <Form.Item name="speciesId" label="Species" rules={[{ required: true }]}>
        <Select placeholder="Select a Species" options={nonExstinctSpecies?.map((species) => ({ key: species.id, value: species.id, label: species.commonName }))}/>
      </Form.Item>

      <Divider orientation='left'>About the Occurrence</Divider>
      <Form.Item name="title" label="Title" rules={[{ required: true }, { min: 3, message: 'Valid title must be at least 3 characters long' }]}>
        <Input placeholder="Give this Plant Occurrence a title!" />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea placeholder="(Optional) Share details about this Plant Occurrence!" autoSize={{ minRows: 3, maxRows: 5 }} />
      </Form.Item>
      <Form.Item name="occurrenceStatus" label="Occurrence Status" rules={[{ required: true }]}>
        <Select placeholder="Select a Status for the Occurrence" options={occurrenceStatusOptions} />
      </Form.Item>

      <Form.Item name="dateObserved" label="Date Observed" rules={[{ required: true }, validateDates(form)]}>
        <DatePicker className="w-full" maxDate={dayjs()}/>
      </Form.Item>
      <Form.Item name="dateOfBirth" label="Date of Birth" rules={[validateDateOfBirth]}>
        <DatePicker className="w-full" maxDate={dayjs()}/>
      </Form.Item>
      <Form.Item name="numberOfPlants" label="Number of Plants" rules={[{ required: true }]}>
        <InputNumber min={0} className="w-full" placeholder="Number of Plants" />
      </Form.Item>
      <Form.Item name="biomass" label="Biomass" rules={[{ required: true }]}>
        <InputNumber min={1} placeholder="Biomass" />
      </Form.Item>
      <Form.Item name="decarbonizationType" label="Decarbonization Type" rules={[{ required: true }]}>
        <Select placeholder="Select a Decarbonization Type" options={decarbonizationTypeOptions} />
      </Form.Item>

      <Form.Item label={'Image'}>
        <ImageInput type="file" multiple onChange={handleFileChange} accept="image/png, image/jpeg" onClick={onInputClick} />
      </Form.Item>
      {previewImages?.length > 0 && (
        <Form.Item label={'Image Previews'}>
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

      <Form.Item wrapperCol={{ offset: 8 }}>
        <Button type="primary" className="w-full" onClick={() => handleCurrStep(1)}>
          Next
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateDetailsStep;
