import { ImageInput } from '@lepark/common-ui';
import {
  ParkResponse,
  SpeciesResponse,
  ZoneResponse,
  StaffResponse,
  StaffType,
  OccurrenceStatusEnum,
  DecarbonizationTypeEnum,
  HubResponse,
} from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { Button, DatePicker, Divider, Flex, Form, FormInstance, Input, InputNumber, Select, Tooltip } from 'antd';
import dayjs from 'dayjs';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useRestrictHub } from '../../../hooks/Hubs/useRestrictHubs';
const { TextArea } = Input;

interface PlaceZoneDetailsStepProps {
  handleCurrStep: (step: number) => void;
  handleSubmit: () => void;
  form: FormInstance;
  hubId: string;
}

const PlaceZoneDetailsStep = ({ handleCurrStep, handleSubmit, form, hubId }: PlaceZoneDetailsStepProps) => {
  const { hub } = useRestrictHub(hubId);
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

  useEffect(() => {
    if (hub) {
      form.setFieldsValue({
        remarks: hub.remarks
      });
    }
  }, [hub, form]);

  return (
    <Form
      form={form}
      labelCol={{ span: 8 }}
      className="max-w-[600px] mx-auto mt-8"
    >
      <Form.Item
        name="macAddress"
        label="MAC Address"
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
            max: 1000,
            message: 'Interval must be between 1 and 1000 polls',
          },
        ]}
        tooltip="How frequently the hub will send data to the backend in terms of polls"
      >
        <InputNumber min={1} placeholder="Interval of Data Transmission (in Polls)" className="w-full" />
      </Form.Item>

      <Form.Item name="remarks" label="Additional Remarks">
        <TextArea placeholder="(Optional) Remarks" />
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
