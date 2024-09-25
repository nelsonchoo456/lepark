import { ImageInput } from '@lepark/common-ui';
import { ZoneResponse, AttractionStatusEnum, ParkResponse } from '@lepark/data-access';
import { Button, Divider, Flex, Form, FormInstance, Input, message, Popconfirm, Select, TimePicker, Typography } from 'antd';
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

  const attractionStatusOptions = [
    { value: AttractionStatusEnum.OPEN, label: 'Open' },
    { value: AttractionStatusEnum.CLOSED, label: 'Closed' },
    { value: AttractionStatusEnum.UNDER_MAINTENANCE, label: 'Under Maintenance' },
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
          content: `Please put a valid Attraction Hour range for ${day}`,
        });
      }
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: `Please manually input the Attraction Hour ranges.`,
      });
    }
  };

  return (
    <Form form={form} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
      <Divider orientation="left">Attraction Details</Divider>
      <Form.Item name="parkId" label="Park" rules={[{ required: true }]}>
        <Select
          placeholder="Select a Park for this Attraction"
          options={parks?.map((park) => ({ key: park.id, value: park.id, label: park.name }))}
        />
      </Form.Item>

      <Form.Item name="title" label="Title" rules={[{ required: true }, { min: 3, message: 'Title must be at least 3 characters long' }]}>
        <Input placeholder="Attraction Title"
         onBlur={(e) => {
          const trimmedValue = e.target.value.trim();
          form.setFieldsValue({ title: trimmedValue });
        }} />
      </Form.Item>

      <Form.Item name="description" label="Description" rules={[{ required: true }]}>
        <TextArea placeholder="Describe the Attraction" autoSize={{ minRows: 3, maxRows: 5 }} />
      </Form.Item>

      <Form.Item name="status" label="Status" rules={[{ required: true }]}>
        <Select placeholder="Select Attraction Status" options={attractionStatusOptions} />
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

      <Divider orientation="left">
        Attraction Hours <Text type="danger">{' *'}</Text>
      </Divider>

      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
        <Form.Item key={day} label={day.charAt(0).toUpperCase() + day.slice(1)}>
          <Flex>
            <Form.Item name={day} noStyle rules={[{ required: true, message: 'Please enter valid Attraction Hours' }]}>
              <RangePicker className="w-full" use12Hours format="h:mm a" />
            </Form.Item>
            <Popconfirm title="Input for all the other days will be overridden." onConfirm={() => handleApplyToAllChange(day)}>
              <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
            </Popconfirm>
          </Flex>
        </Form.Item>
      ))}

      <Form.Item wrapperCol={{ offset: 8 }}>
        <Button type="primary" className="w-full" onClick={() => handleCurrStep(1)}>
          Next
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateDetailsStep;
