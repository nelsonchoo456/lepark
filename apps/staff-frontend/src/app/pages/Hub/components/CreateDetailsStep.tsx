import { ImageInput } from '@lepark/common-ui';
import { Button, DatePicker, Divider, Form, FormInstance, Input, InputNumber, Select, message } from 'antd';
import dayjs from 'dayjs';
import moment from 'moment';
import CustomIPInput from './CustomIPInput';
import CustomMACInput from './CustomMACInput';
const { TextArea } = Input;

interface CreateDetailsStepProps {
  handleCurrStep: () => void;
  form: FormInstance;
  previewImages: string[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  onInputClick: (event: React.MouseEvent<HTMLInputElement>) => void;
}

const CreateDetailsStep = ({
  handleCurrStep,
  form,
  previewImages = [], // Ensure previewImages is always defined
  handleFileChange,
  removeImage,
  onInputClick,
}: CreateDetailsStepProps) => {
  const hubStatusOptions = [
    {
      value: 'ACTIVE',
      label: 'Active',
    },
    {
      value: 'INACTIVE',
      label: 'Inactive',
    },
    {
      value: 'UNDER_MAINTENANCE',
      label: 'Under Maintenance',
    },
    {
      value: 'DECOMMISSIONED',
      label: 'Decommissioned',
    },
  ];

  const validateDates = (form: FormInstance) => ({
    validator(_: any, value: moment.Moment) {
      if (!value) {
        return Promise.reject(new Error('Please enter Acquisition Date'));
      }

      if (value.isAfter(moment(), 'day')) {
        return Promise.reject(new Error('Date cannot be beyond today'));
      }

      return Promise.resolve();
    },
  });

  const validateFutureDate = (form: FormInstance) => ({
    validator(_: any, value: moment.Moment) {
      if (!value) {
        return Promise.reject(new Error('Please enter Next Maintenance Date'));
      }

      if (value.isBefore(moment(), 'day')) {
        return Promise.reject(new Error('Next Maintenance Date must be in the future'));
      }

      return Promise.resolve();
    },
  });

  const validateMACAddress = (_: any, value: string) => {
    const macRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
    if (!value) {
      return Promise.reject(new Error('Please enter a valid MAC Address in the format XX:XX:XX:XX:XX:XX'));
    }
    if (!macRegex.test(value)) {
      return Promise.reject(new Error('Please enter a valid MAC Address in the format XX:XX:XX:XX:XX:XX'));
    }
    return Promise.resolve();
  };

  const validateImageUpload = (_: any, value: any) => {
    if (!previewImages || previewImages.length === 0) {
      return Promise.reject(new Error('Please upload at least one image'));
    }
    return Promise.resolve();
  };

  return (
    <Form form={form} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
      <Divider orientation="left">Hub Details</Divider>

      <Form.Item name="serialNumber" label="Serial Number" rules={[{ required: true, message: 'Please enter Serial Number' }]}>
        <Input placeholder="Enter Serial Number" />
      </Form.Item>
      <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter Hub Name' }]}>
        <Input placeholder="Enter Name" />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea placeholder="Enter Description" autoSize={{ minRows: 3, maxRows: 5 }} />
      </Form.Item>
      <Form.Item name="remarks" label="Remarks">
        <TextArea placeholder="Enter any remarks" autoSize={{ minRows: 3, maxRows: 5 }} />
      </Form.Item>
      <Form.Item name="hubStatus" label="Hub Status" rules={[{ required: true, message: 'Please select Hub Status' }]}>
        <Select placeholder="Select Hub Status" options={hubStatusOptions} />
      </Form.Item>
      <Form.Item
        name="acquisitionDate"
        label="Acquisition Date"
        rules={[{ required: true, message: 'Please enter Acquisition Date' }, validateDates(form)]}
      >
        <DatePicker className="w-full" maxDate={dayjs()} />
      </Form.Item>
      <Form.Item
        name="recommendedCalibrationFrequencyDays"
        label="Calibration Frequency (Days)"
        rules={[{ required: true, message: 'Please enter Calibration Frequency in Days' }]}
      >
        <InputNumber min={1} className="w-full" placeholder="Enter Calibration Frequency in Days" />
      </Form.Item>
      <Form.Item
        name="recommendedMaintenanceDuration"
        label="Maintenance Duration (Days)"
        rules={[{ required: true, message: 'Please enter Maintenance Duration in Days' }]}
      >
        <InputNumber min={1} className="w-full" placeholder="Enter Maintenance Duration in Days" />
      </Form.Item>
      <Form.Item
        name="nextMaintenanceDate"
        label="Next Maintenance Date"
        rules={[{ required: true, message: 'Please enter Next Maintenance Date' }, validateFutureDate(form)]}
      >
        <DatePicker className="w-full" minDate={dayjs()} />
      </Form.Item>
      <Form.Item
        name="dataTransmissionInterval"
        label="Data Transmission Interval"
        rules={[{ required: true, message: 'Please enter Data Transmission Interval' }]}
      >
        <InputNumber min={0} className="w-full" placeholder="Enter Data Transmission Interval" />
      </Form.Item>
      <Form.Item name="ipAddress" label="IP Address" rules={[{ required: true, message: 'Please enter IP Address' }]}>
        <CustomIPInput />
      </Form.Item>
      <Form.Item
        name="macAddress"
        label="MAC Address"
        rules={[{ required: true, message: 'Please enter MAC Address' }, { validator: validateMACAddress }]}
      >
        <CustomMACInput />
      </Form.Item>
      <Form.Item name="radioGroup" label="Radio Group" rules={[{ required: true, message: 'Please enter Radio Group' }]}>
        <InputNumber min={1} className="w-full" placeholder="Enter Radio Group" />
      </Form.Item>
      <Form.Item name="hubSecret" label="Hub Secret" rules={[{ required: true, message: 'Please enter Hub Secret' }]}>
        <Input placeholder="Enter Hub Secret" />
      </Form.Item>

      <Form.Item label={'Images'}>
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
        <Button type="primary" className="w-full" onClick={handleCurrStep}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateDetailsStep;
