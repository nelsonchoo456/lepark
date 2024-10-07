import { ImageInput } from '@lepark/common-ui';
import {
  ParkResponse,
  SpeciesResponse,
  ZoneResponse,
  StaffResponse,
  StaffType,
  OccurrenceStatusEnum,
  DecarbonizationTypeEnum,
} from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { Button, DatePicker, Divider, Flex, Form, FormInstance, Input, InputNumber, Select } from 'antd';
import dayjs from 'dayjs';
import moment from 'moment';
import { useEffect, useState } from 'react';
const { TextArea } = Input;

interface PlaceZoneDetailsStepProps {
  handleCurrStep: (step: number) => void;
  handleSubmit: () => void;
  form: FormInstance;
}

const PlaceZoneDetailsStep = ({ handleCurrStep, handleSubmit, form }: PlaceZoneDetailsStepProps) => {
  const [macAddress, setMacAddress] = useState('');

  const formatMacAddress = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    const formattedValue = cleanValue.match(/.{1,2}/g)?.join('-') || '';
    return formattedValue.slice(0, 17);
  };

  const handleMacAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatMacAddress(value);
    setMacAddress(formattedValue);
    form.setFieldsValue({ macAddress: formattedValue });
  };

  return (
    <Form
      form={form}
      // style={{ maxWidth: 50 }}
      labelCol={{ span: 8 }}
      className="max-w-[600px] mx-auto mt-8"
    >
      <Form.Item
        name="macAddress"
        label="Mac Address"
        rules={[
          { required: true },
          {
            pattern: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
            message: 'Invalid MAC address format',
          },
        ]}
      >
        <Input value={macAddress} onChange={handleMacAddressChange} placeholder={'XX-XX-XX-XX-XX-XX'} />
      </Form.Item>

      <Form.Item
        name="dataTransmissionInterval"
        label="Data Transmission Interval"
        rules={[
          { required: true },
          {
            type: 'number',
            min: 1,
            max: 86400,
            message: 'Interval must be between 1 and 86 400 minutes',
          },
        ]}
      >
        <InputNumber min={1} placeholder="Interval of Data Transmission" className="w-full" />
      </Form.Item>

      <Form.Item colon={false}>
        <Flex gap={11}>
          <Button type="default" className="w-full" onClick={() => handleCurrStep(0)}>
            Previous
          </Button>
          <Button type="primary" className="w-full" onClick={() => handleSubmit()}>
            Submit
          </Button>
        </Flex>
      </Form.Item>
    </Form>
  );
};

export default PlaceZoneDetailsStep;
