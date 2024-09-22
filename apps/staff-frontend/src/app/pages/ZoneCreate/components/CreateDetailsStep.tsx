import { ImageInput, useAuth } from '@lepark/common-ui';
import { ParkResponse, StaffResponse, StaffType } from '@lepark/data-access';
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Select,
  TimePicker,
  Typography,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
const { TextArea } = Input;
const { RangePicker } = TimePicker;
const { Text } = Typography;

interface CreateDetailsStepProps {
  handleCurrStep: (step: number) => void;
  form: FormInstance;
  parks: ParkResponse[];
  previewImages: string[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  onInputClick: (event: React.MouseEvent<HTMLInputElement>) => void;
}

const CreateDetailsStep = ({
  handleCurrStep,
  form,
  parks,
  previewImages,
  handleFileChange,
  removeImage,
  onInputClick,
}: CreateDetailsStepProps) => {
  const [messageApi, contextHolder] = message.useMessage();
  const { user } = useAuth<StaffResponse>();
  const [park, setPark] = useState<ParkResponse>();

  useEffect(() => {
    if (user?.role !== StaffType.SUPERADMIN && user?.parkId) {
      form.setFieldsValue({ parkId: user?.parkId });
      const park = parks.find((park) => park.id === user.parkId);
      setPark(park);
    }
  }, [user, parks, form]);

  const zoneStatusOptions = [
    {
      value: 'OPEN',
      label: 'Open',
    },
    {
      value: 'UNDER_CONSTRUCTION',
      label: 'Under Construction',
    },
    {
      value: 'LIMITED_ACCESS',
      label: 'Limited Access',
    },
    {
      value: 'CLOSED',
      label: 'Closed',
    },
  ];

  const handleApplyToAllChange = (day: string) => {
    try {
      const dayTime = form.getFieldValue(day);
      if (dayTime) {
        form.setFieldsValue({
          monday: dayTime,
          tuesday: dayTime,
          wednesday: dayTime,
          thursday: dayTime,
          friday: dayTime,
          saturday: dayTime,
          sunday: dayTime,
        });
      } else {
        messageApi.open({
          type: 'error',
          content: `Please put a valid Zone Hour range for ${day}`,
        });
      }
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: `Please manually input the Zone Hour ranges.`,
      });
    }
  };

  return (
    <Form form={form} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
      {contextHolder}

      {user?.role !== StaffType.SUPERADMIN && park ? (
        <Form.Item label="Park">{park?.name}</Form.Item>
      ) : (
        <Form.Item name="parkId" label="Park" rules={[{ required: true }]}>
          <Select placeholder="Select a Park" options={parks?.map((park) => ({ key: park.id, value: park.id, label: park.name }))} />
        </Form.Item>
      )}

      <Divider orientation="left">Zone Details</Divider>
      <Form.Item name="name" label="Name" rules={[{ required: true },  { min: 3, message: 'Valid name must be at least 3 characters long'}]}>
        <Input placeholder="Zone Name" />
      </Form.Item>
      <Form.Item name="description" label="Description" rules={[{ required: true }]}>
        <TextArea placeholder="Zone Description" />
      </Form.Item>
      <Form.Item name="zoneStatus" label="Zone Status" rules={[{ required: true }]}>
        <Select placeholder="Select a Status" options={zoneStatusOptions} />
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

      <Divider orientation="left">
        Zone Hours <Text type="danger">{' *'}</Text>
      </Divider>

      <Form.Item label={'Monday'}>
        <Flex>
          <Form.Item name="monday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
            <RangePicker className="w-full" use12Hours format="h:mm a" />
          </Form.Item>
          <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('monday')}>
            <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
          </Popconfirm>
        </Flex>
      </Form.Item>

      <Form.Item label={'Tuesday'}>
        <Flex>
          <Form.Item name="tuesday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
            <RangePicker className="w-full" use12Hours format="h:mm a" />
          </Form.Item>
          <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('tuesday')}>
            <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
          </Popconfirm>
        </Flex>
      </Form.Item>

      <Form.Item label={'Wednesday'}>
        <Flex>
          <Form.Item name="wednesday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
            <RangePicker className="w-full" use12Hours format="h:mm a" />
          </Form.Item>
          <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('wednesday')}>
            <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
          </Popconfirm>
        </Flex>
      </Form.Item>

      <Form.Item label={'Thursday'}>
        <Flex>
          <Form.Item name="thursday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
            <RangePicker className="w-full" use12Hours format="h:mm a" />
          </Form.Item>
          <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('thursday')}>
            <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
          </Popconfirm>
        </Flex>
      </Form.Item>

      <Form.Item label={'Friday'}>
        <Flex>
          <Form.Item name="friday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
            <RangePicker className="w-full" use12Hours format="h:mm a" />
          </Form.Item>
          <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('friday')}>
            <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
          </Popconfirm>
        </Flex>
      </Form.Item>

      <Form.Item label={'Saturday'}>
        <Flex>
          <Form.Item name="saturday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
            <RangePicker className="w-full" use12Hours format="h:mm a" />
          </Form.Item>
          <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('saturday')}>
            <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
          </Popconfirm>
        </Flex>
      </Form.Item>

      <Form.Item label={'Sunday'}>
        <Flex>
          <Form.Item name="sunday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
            <RangePicker className="w-full" use12Hours format="h:mm a" />
          </Form.Item>
          <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('sunday')}>
            <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
          </Popconfirm>
        </Flex>
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8 }}>
        <Button type="primary" className="w-full" onClick={() => handleCurrStep(1)}>
          Next
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateDetailsStep;
