import { ImageInput, useAuth } from '@lepark/common-ui';
import { ZoneResponse, AttractionStatusEnum, ParkResponse, checkAttractionNameExists, StaffResponse, StaffType } from '@lepark/data-access';
import { Button, Divider, Flex, Form, FormInstance, Input, message, Popconfirm, Select, TimePicker, Typography } from 'antd';
import { useState, useEffect } from 'react';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
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
  const [isChecking, setIsChecking] = useState(false);
  const { user } = useAuth<StaffResponse>();

  // Add this effect to set the parkId for non-superadmin users
  useEffect(() => {
    if (user?.role !== StaffType.SUPERADMIN && user?.parkId) {
      form.setFieldsValue({ parkId: user.parkId });
    }
  }, [user, form]);

  const attractionStatusOptions = Object.values(AttractionStatusEnum).map((status) => ({
    value: status,
    label: formatEnumLabelToRemoveUnderscores(status),
  }));

  const handleNext = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      setIsChecking(true);
      const response = await checkAttractionNameExists(values.parkId, values.title);
      setIsChecking(false);
      if (response.data.exists === true) {
        console.error('Duplicate found:', response.data);
        messageApi.error(`An attraction with this title already exists in ${parks.find((park) => park.id === values.parkId)?.name}.`);
      } else {
        handleCurrStep(1);
      }
    } catch (error) {
      console.error('Validation or check failed:', error);
      setIsChecking(false);
    }
  };

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
      <Form.Item 
        name="parkId" 
        label="Park" 
        rules={[{ required: user?.role === StaffType.SUPERADMIN }]}
      >
        {user?.role === StaffType.SUPERADMIN ? (
          <Select
            placeholder="Select a Park for this Attraction"
            options={parks?.map((park) => ({ key: park.id, value: park.id, label: park.name }))}
          />
        ) : (
          <span>{parks?.find((park) => park.id === user?.parkId)?.name || 'Loading...'}</span>
        )}
      </Form.Item>

      <Form.Item name="title" label="Title" rules={[{ required: true }, { min: 3, message: 'Title must be at least 3 characters long' }]}>
        <Input
          placeholder="Attraction Title"
          onBlur={(e) => {
            const trimmedValue = e.target.value.trim();
            form.setFieldsValue({ title: trimmedValue });
          }}
        />
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

      <Form.Item label={" "} colon={false}>
        {contextHolder}
        <Button type="primary" className="w-full" onClick={handleNext} loading={isChecking}>
          Next
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateDetailsStep;
