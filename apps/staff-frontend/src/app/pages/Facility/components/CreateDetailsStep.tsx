import { ParkResponse, StaffResponse, StaffType, checkExistingFacility } from '@lepark/data-access';
import { Button, Form, Input, InputNumber, Select, TimePicker, Flex, Popconfirm, FormInstance, Divider, Typography } from 'antd';
import { ImageInput } from '@lepark/common-ui';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { FacilityTypeEnum, FacilityStatusEnum } from '@lepark/data-access';

const { RangePicker } = TimePicker;
const { Text } = Typography;

interface CreateDetailsStepProps {
  handleCurrStep: (step: number) => void;
  form: FormInstance;
  previewImages: string[];
  handleFileChange: (info: any) => void;
  removeImage: (index: number) => void;
  onInputClick: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  parks: ParkResponse[];
  user: StaffResponse | null;
}

const CreateDetailsStep: React.FC<CreateDetailsStepProps> = ({
  handleCurrStep,
  form,
  previewImages,
  handleFileChange,
  removeImage,
  onInputClick,
  parks,
  user,
}) => {
  const [park, setPark] = useState<ParkResponse>();
  const [isPublic, setIsPublic] = useState(true);
  const [isBookable, setIsBookable] = useState(true);

  useEffect(() => {
    if (user?.role !== StaffType.SUPERADMIN && user?.parkId) {
      form.setFieldsValue({ parkId: user?.parkId });
      const park = parks.find((park) => park.id === user.parkId);
      setPark(park);
    }

    const isPublicValue = form.getFieldValue('isPublic');
    if (isPublicValue !== undefined && !isPublicValue) {
      setIsPublic(isPublicValue);
      setIsBookable(isPublicValue);
    }

    const isBookableValue = form.getFieldValue('isBookable');
    if (isBookableValue !== undefined && !isBookableValue) {
      setIsBookable(isPublicValue);
    }
  }, [user, parks]);

  const facilityTypeOptions = Object.values(FacilityTypeEnum).map((type) => ({
    value: type,
    label: formatEnumLabelToRemoveUnderscores(type),
  }));

  const facilityStatusOptions = Object.values(FacilityStatusEnum).map((status) => ({
    value: status,
    label: formatEnumLabelToRemoveUnderscores(status),
  }));

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
        message.error(`Please put a valid Facility Hour range for ${day}`);
      }
    } catch (error) {
      message.error(`Please manually input the Facility Hour ranges.`);
    }
  };

  const handleIsPublicChange = (value: boolean) => {
    setIsPublic(value);

    if (!value) {
      // If isPublic is set to false, set isBookable to false as well
      form.setFieldsValue({
        isBookable: false,
        reservationPolicy: 'NIL',
        fee: 0,
      });
      setIsBookable(false);
    } else {
      form.setFieldsValue({
        isBookable: null,
        reservationPolicy: '',
        fee: null,
      });
      setIsBookable(true);
    }
  };

  const handleIsBookableChange = (value: boolean) => {
    setIsBookable(value);

    if (!value) {
      // If isPublic is set to false, set isBookable to false as well
      form.setFieldsValue({
        reservationPolicy: 'NIL',
        fee: 0,
      });
    } else {
      form.setFieldsValue({
        reservationPolicy: '',
        fee: null,
      });
    }
  };

  const handleClick = async () => {
    try {
      await form.validateFields();

      const facilityName = form.getFieldValue('name'); // Assuming 'name' is the field name for facility name
      const parkId = form.getFieldValue('parkId'); // Assuming 'parkId' is the field name for park ID

      // Check if the facility already exists
      const response = await checkExistingFacility(facilityName, parkId);
      if (response.data.exists) {
        message.error('A facility with this name already exists in the park.');
        return; // Prevent moving to the next step
      }
      await handleCurrStep(1);
    } catch (error) {
      console.error('Error checking existing facility:', error);
    }
  };

  return (
    <Form form={form} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
      <Divider orientation="left">Select the Park</Divider>
      {user?.role !== StaffType.SUPERADMIN && park ? (
        <Form.Item name="parkId" label="Park">
          {park?.name}
        </Form.Item>
      ) : (
        <Form.Item name="parkId" label="Park" rules={[{ required: true, message: 'Please select a park!' }]}>
          <Select placeholder="Select a Park" options={parks?.map((park) => ({ key: park.id, value: park.id, label: park.name }))} />
        </Form.Item>
      )}

      <Divider orientation="left">Facility Details</Divider>

      <Form.Item name="name" label="Facility Name" rules={[{ required: true, message: 'Please input the facility name!' }]}>
        <Input placeholder="Enter Facility Name" />
      </Form.Item>
      <Form.Item name="facilityType" label="Facility Type" rules={[{ required: true, message: 'Please select the facility type!' }]}>
        <Select options={facilityTypeOptions} placeholder="Select a Facility Type" />
      </Form.Item>
      <Form.Item
        name="description"
        label="Facility Description"
        rules={[{ required: true, message: 'Please input the facility description!' }]}
      >
        <Input.TextArea rows={3} placeholder="Enter description" />
      </Form.Item>

      <Form.Item name="facilityStatus" label="Facility Status" rules={[{ required: true, message: 'Please select the facility status!' }]}>
        <Select options={facilityStatusOptions} placeholder="Enter facility status" />
      </Form.Item>

      <Form.Item
        name="isSheltered"
        label="Is Sheltered"
        rules={[{ required: true, message: 'Please select if the facility is sheltered!' }]}
        tooltip="Please indicate if the facility is sheltered"
      >
        <Select
          options={[
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ]}
          placeholder="Select if the facility is sheltered"
        />
      </Form.Item>

      <Form.Item
        name="isPublic"
        label="Is Public"
        rules={[{ required: true, message: 'Please select if the facility is public!' }]}
        tooltip="Please indicate if the facility is open to public"
      >
        <Select
          options={[
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ]}
          placeholder="Select if the facility is open to public"
          onChange={handleIsPublicChange}
        />
      </Form.Item>

      <Form.Item
        name="isBookable"
        label="Is Bookable"
        rules={[{ required: true, message: 'Please select if the facility is bookable!' }]}
        tooltip="Please indicate if the facility is open to booking"
        hidden={!isPublic}
      >
        <Select
          options={[
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ]}
          placeholder="Select if the facility is bookable"
          onChange={handleIsBookableChange}
        />
      </Form.Item>

      <Form.Item
        name="reservationPolicy"
        label="Reservation Policy"
        rules={[{ required: true, message: 'Please input the reservation policy!' }]}
        hidden={!isPublic || !isBookable}
      >
        <Input.TextArea rows={3} placeholder="Enter reservation policy" />
      </Form.Item>

      <Form.Item
        name="rulesAndRegulations"
        label="Rules and Regulations"
        rules={[{ required: true, message: 'Please input the rules and regulations!' }]}
      >
        <Input.TextArea rows={3} placeholder="Enter rules and regulations" />
      </Form.Item>

      <Form.Item name="size" label="Size (m²)" rules={[{ required: true, message: 'Please input the size!' }]}>
        <InputNumber min={1} />
      </Form.Item>

      <Form.Item name="capacity" label="Capacity (pax)" rules={[{ required: true, message: 'Please input the capacity!' }]}>
        <InputNumber min={0} precision={0} step={1} />
      </Form.Item>

      <Form.Item
        name="fee"
        label="Fee ($)"
        rules={[{ required: true, message: 'Please input the fee!' }]}
        hidden={!isPublic || !isBookable}
      >
        <InputNumber min={0} precision={2} step={0.01} />
      </Form.Item>

      <Divider orientation="left">
        Facility Hours<Text type="danger">{' *'}</Text>
      </Divider>

      <Form.Item label={'Monday'}>
        <Flex>
          <Form.Item name="monday" noStyle rules={[{ required: true, message: 'Please enter valid Facility Hours' }]}>
            <RangePicker className="w-full" use12Hours format="h:mm a" />
          </Form.Item>
          <Popconfirm title="Input for all the other days will be overridden." onConfirm={() => handleApplyToAllChange('monday')}>
            <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
          </Popconfirm>
        </Flex>
      </Form.Item>

      <Form.Item label={'Tuesday'}>
        <Flex>
          <Form.Item name="tuesday" noStyle rules={[{ required: true, message: 'Please enter valid Facility Hours' }]}>
            <RangePicker className="w-full" use12Hours format="h:mm a" />
          </Form.Item>
          <Popconfirm title="Input for all the other days will be overridden." onConfirm={() => handleApplyToAllChange('tuesday')}>
            <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
          </Popconfirm>
        </Flex>
      </Form.Item>

      <Form.Item label={'Wednesday'}>
        <Flex>
          <Form.Item name="wednesday" noStyle rules={[{ required: true, message: 'Please enter valid Facility Hours' }]}>
            <RangePicker className="w-full" use12Hours format="h:mm a" />
          </Form.Item>
          <Popconfirm title="Input for all the other days will be overridden." onConfirm={() => handleApplyToAllChange('wednesday')}>
            <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
          </Popconfirm>
        </Flex>
      </Form.Item>

      <Form.Item label={'Thursday'}>
        <Flex>
          <Form.Item name="thursday" noStyle rules={[{ required: true, message: 'Please enter valid Facility Hours' }]}>
            <RangePicker className="w-full" use12Hours format="h:mm a" />
          </Form.Item>
          <Popconfirm title="Input for all the other days will be overridden." onConfirm={() => handleApplyToAllChange('thursday')}>
            <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
          </Popconfirm>
        </Flex>
      </Form.Item>

      <Form.Item label={'Friday'}>
        <Flex>
          <Form.Item name="friday" noStyle rules={[{ required: true, message: 'Please enter valid Facility Hours' }]}>
            <RangePicker className="w-full" use12Hours format="h:mm a" />
          </Form.Item>
          <Popconfirm title="Input for all the other days will be overridden." onConfirm={() => handleApplyToAllChange('friday')}>
            <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
          </Popconfirm>
        </Flex>
      </Form.Item>

      <Form.Item label={'Saturday'}>
        <Flex>
          <Form.Item name="saturday" noStyle rules={[{ required: true, message: 'Please enter valid Facility Hours' }]}>
            <RangePicker className="w-full" use12Hours format="h:mm a" />
          </Form.Item>
          <Popconfirm title="Input for all the other days will be overridden." onConfirm={() => handleApplyToAllChange('saturday')}>
            <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
          </Popconfirm>
        </Flex>
      </Form.Item>

      <Form.Item label={'Sunday'}>
        <Flex>
          <Form.Item name="sunday" noStyle rules={[{ required: true, message: 'Please enter valid Facility Hours' }]}>
            <RangePicker className="w-full" use12Hours format="h:mm a" />
          </Form.Item>
          <Popconfirm title="Input for all the other days will be overridden." onConfirm={() => handleApplyToAllChange('sunday')}>
            <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
          </Popconfirm>
        </Flex>
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
      <Form.Item label={' '} colon={false}>
        <Button type="primary" className="w-full" onClick={handleClick}>
          Next
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateDetailsStep;
