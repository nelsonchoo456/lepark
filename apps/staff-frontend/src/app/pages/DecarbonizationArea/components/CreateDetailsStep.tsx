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

      <Divider orientation="left">Decarbonization Area Details</Divider>
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true }, { min: 3, message: 'Valid name must be at least 3 characters long' }]}
      >
        <Input placeholder="Decarbonization Area Name" />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea placeholder="Description" rows={4} />
      </Form.Item>
   {/*}   <Form.Item label={'Image'}>
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
      )}*/}

      <Form.Item wrapperCol={{ offset: 8 }}>
        <Button type="primary" className="w-full" onClick={() => handleCurrStep(1)}>
          Next
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateDetailsStep;
