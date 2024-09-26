import { ImageInput } from '@lepark/common-ui';
import { HubResponse, FacilityResponse, StaffResponse } from '@lepark/data-access';
import { Button, DatePicker, Divider, Form, FormInstance, Input, InputNumber, Select, Space } from 'antd';
import { SensorTypeEnum, SensorStatusEnum, SensorUnitEnum } from '@prisma/client';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface SensorCreateDetailsProps {
  handleCurrStep: (step: number) => void;
  form: FormInstance;
  hubs: HubResponse[];
  facilities: FacilityResponse[];
  previewImages: string[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  onInputClick: (event: React.MouseEvent<HTMLInputElement>) => void;
  user: StaffResponse | null;
  onFacilityChange: (value: string | undefined) => void;
}

const SensorCreateDetails = ({
  handleCurrStep,
  form,
  hubs,
  facilities,
  previewImages,
  handleFileChange,
  removeImage,
  onInputClick,
  onFacilityChange,
}: SensorCreateDetailsProps) => {
  const formatEnumLabel = (enumValue: string): string => {
    return enumValue
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const validatePhoneNumber = (_: any, value: string) => {
    const phoneRegex = /^[689]\d{7}$/;
    if (!value || phoneRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject('Please enter a valid 8-digit phone number starting with 6, 8, or 9');
  };

  const disabledLastCalibratedDate = (current: dayjs.Dayjs) => {
    return current && current > dayjs().endOf('day');
  };

  const disabledNextMaintenanceDate = (current: dayjs.Dayjs) => {
    const lastCalibratedDate = form.getFieldValue('lastCalibratedDate');
    if (!lastCalibratedDate) return false;
    return current && current.isBefore(lastCalibratedDate);
  };

  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

    const disabledDate = (current: dayjs.Dayjs) => {
    return current && current > dayjs().endOf('day');
  };


  return (
    <Form
    form={form}
    layout="horizontal"
    onFinish={() => handleCurrStep(1)}
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    style={{ maxWidth: '600px', margin: '0 auto' }}
  >
      <Divider orientation="left">Sensor Details</Divider>
      <Form.Item name="sensorName" label="Sensor Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="serialNumber" label="Serial Number" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="sensorType" label="Sensor Type" rules={[{ required: true }]}>
        <Select placeholder="Select sensor type">
          {Object.values(SensorTypeEnum).map((type) => (
            <Select.Option key={type} value={type}>
              {formatEnumLabel(type)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="sensorDescription" label="Sensor Description">
        <TextArea />
      </Form.Item>
      <Form.Item name="sensorStatus" label="Sensor Status" rules={[{ required: true }]}>
        <Select placeholder="Select sensor status">
          {Object.values(SensorStatusEnum).map((status) => (
            <Select.Option key={status} value={status}>
              {formatEnumLabel(status)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
       <Form.Item
        name="acquisitionDate"
        label="Acquisition Date"
        rules={[{ required: true, message: 'Please select the acquisition date' }]}
      >
        <DatePicker className="w-full" disabledDate={disabledDate} />
      </Form.Item>
      <Form.Item name="lastCalibratedDate" label="Last Calibrated Date">
        <DatePicker className="w-full" disabledDate={disabledDate} />
      </Form.Item>
      <Form.Item
        name="calibrationFrequencyDays"
        label="Calibration Frequency"
        rules={[{ required: true, type: 'number', min: 1, max: 500, message: 'Please enter a number between 1 and 500' }]}
      >
        <InputNumber placeholder="Enter frequency in days" min={1} max={500} className="w-full" />
      </Form.Item>
      <Form.Item
        name="recurringMaintenanceDuration"
        label="Recurring Maintenance"
        rules={[{ required: true, type: 'number', min: 1, max: 500, message: 'Please enter a number between 1 and 500' }]}
      >
        <InputNumber placeholder="Enter duration in days" min={1} max={500} className="w-full" />
      </Form.Item>
      <Form.Item
        name="dataFrequencyMinutes"
        label="Data Frequency"
        rules={[{ required: true, type: 'number', min: 1, max: 999, message: 'Please enter a number between 1 and 999' }]}
      >
        <InputNumber placeholder="Enter data frequency in minutes" min={1} max={999} className="w-full" />
      </Form.Item>
      {/* ... (other form items remain unchanged) */}
      <Form.Item
        name="supplierContactNumber"
        label="Supplier Contact"
        rules={[
          { required: true, message: 'Please input the supplier contact number' },
          { validator: validatePhoneNumber }
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="remarks" label="Remarks">
        <TextArea />
      </Form.Item>

<Form.Item name="facilityId" label="Facility" rules={[{ required: true, message: 'Please select a facility' }]}>
  <Select
    placeholder="Select a facility"
    onChange={onFacilityChange}
  >
    {facilities.map((facility) => (
      <Select.Option key={facility.id} value={facility.id}>
        {facility.facilityName}
      </Select.Option>
    ))}
  </Select>
</Form.Item>
      <Form.Item label="Upload Image" tooltip="One image is required">
        <ImageInput
          type="file"
          onChange={handleFileChange}
          accept="image/png, image/jpeg"
          onClick={onInputClick}
        />
      </Form.Item>
      {previewImages.length > 0 && (
        <Form.Item label="Image Preview">
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


<Form.Item {...tailLayout}>
  <Button type="primary" htmlType="submit" className="w-full">
    Next
  </Button>
</Form.Item>
    </Form>
  );
};

export default SensorCreateDetails;
