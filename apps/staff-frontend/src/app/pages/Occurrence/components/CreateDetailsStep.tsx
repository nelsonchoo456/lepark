import { ImageInput } from '@lepark/common-ui';
import { ParkResponse, SpeciesResponse, ZoneResponse, StaffResponse, StaffType, OccurrenceStatusEnum, DecarbonizationTypeEnum } from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { Button, DatePicker, Divider, Form, FormInstance, Input, InputNumber, Select } from 'antd';
import dayjs from 'dayjs';
import moment from 'moment';
import { useEffect, useState } from 'react';
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
  parks: ParkResponse[]; // Add this prop
  selectedParkId: number | null; // Add this prop
  setSelectedParkId: (id: number | null) => void; // Add this prop
  user: StaffResponse | null; // Add this prop
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
  parks,
  selectedParkId,
  setSelectedParkId,
  user,
}: CreateDetailsStepProps) => {
  const nonExtinctSpecies = species.filter((species) => species.conservationStatus !== 'EXTINCT');
  const decarbonizationTypeOptions = Object.values(DecarbonizationTypeEnum).map(type => ({
    value: type,
    label: formatEnumLabelToRemoveUnderscores(type),
  }));

  const occurrenceStatusOptions = Object.values(OccurrenceStatusEnum).map(status => ({
    value: status,
    label: formatEnumLabelToRemoveUnderscores(status),
  }));

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
    },
  });

  const validateDateOfBirth = {
    validator(_: any, value: moment.Moment) {
      if (value.isAfter(moment(), 'day')) {
        return Promise.reject(new Error('Date of Birth cannot be beyond today'));
      }

      return Promise.resolve();
    },
  };

  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (initialLoad) {
      // On initial load, set the selectedParkId based on the form's parkId or the first zone's parkId
      const parkId = form.getFieldValue('parkId') || (zones[0] && zones[0].parkId);
      if (parkId) {
        setSelectedParkId(parkId);
      }
      setInitialLoad(false);
    }
  }, [form, zones, setSelectedParkId, initialLoad]);

  // Filter zones based on selectedParkId for Superadmin, or use all zones for other roles
  const filteredZones = user?.role === StaffType.SUPERADMIN && selectedParkId
    ? zones.filter((zone) => zone.parkId === selectedParkId)
    : zones;

  return (
    <Form
      form={form}
      // style={{ maxWidth: 50 }}
      labelCol={{ span: 8 }}
      className="max-w-[600px] mx-auto mt-8"
    >
      <Divider orientation="left">Select the Park, Zone, Species</Divider>

      {user?.role === StaffType.SUPERADMIN && (
        <Form.Item name="parkId" label="Park" rules={[{ required: true }]}>
          <Select
            placeholder="Select a Park"
            options={parks?.map((park) => ({ key: park.id, value: park.id, label: park.name }))}
            onChange={(value) => {
              setSelectedParkId(value);
              form.setFieldsValue({ zoneId: undefined });
            }}
          />
        </Form.Item>
      )}

      <Form.Item name="zoneId" label="Zone" rules={[{ required: true }]}>
        <Select
          placeholder="Select a Zone that this Occurrence belongs to"
          options={filteredZones?.map((zone) => ({ key: zone.id, value: zone.id, label: zone.name }))}
          disabled={user?.role === StaffType.SUPERADMIN && !selectedParkId}
        />
      </Form.Item>
      <Form.Item name="speciesId" label="Species" rules={[{ required: true }]}>
        <Select
          placeholder="Select a Species"
          options={nonExtinctSpecies?.map((species) => ({ key: species.id, value: species.id, label: species.speciesName }))}
        />
      </Form.Item>

      <Divider orientation="left">About the Occurrence</Divider>
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true }, { min: 3, message: 'Valid title must be at least 3 characters long' }]}
      >
        <Input placeholder="Give this Plant Occurrence a title!" />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea placeholder="(Optional) Share details about this Plant Occurrence!" autoSize={{ minRows: 3, maxRows: 5 }} />
      </Form.Item>
      <Form.Item name="occurrenceStatus" label="Occurrence Status" rules={[{ required: true }]}>
        <Select placeholder="Select a Status for the Occurrence" options={occurrenceStatusOptions} />
      </Form.Item>

      <Form.Item name="dateObserved" label="Date Observed" rules={[{ required: true }, validateDates(form)]}>
        <DatePicker className="w-full" maxDate={dayjs()} />
      </Form.Item>
      <Form.Item name="dateOfBirth" label="Date of Birth" rules={[validateDateOfBirth]}>
        <DatePicker className="w-full" maxDate={dayjs()} />
      </Form.Item>
      <Form.Item name="numberOfPlants" label="Number of Plants" rules={[{ required: true }]}>
        <InputNumber min={0} className="w-full" placeholder="Number of Plants" />
      </Form.Item>
      <Form.Item name="biomass" label="Biomass (in kg)" rules={[{ required: true }]}>
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

      <Form.Item label={" "} colon={false}>
        <Button type="primary" className="w-full" onClick={() => handleCurrStep(1)}>
          Next
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateDetailsStep;
