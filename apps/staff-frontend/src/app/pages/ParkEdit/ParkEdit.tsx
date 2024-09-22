import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import { ParkResponse, StaffResponse, updatePark } from '@lepark/data-access';
import { Button, Card, Divider, Flex, Form, Input, Popconfirm, Typography, TimePicker, Select, message } from 'antd';
import dayjs from 'dayjs';
import useUploadImages from '../../hooks/Images/useUploadImages';
import PageHeader2 from '../../components/main/PageHeader2';
import { useRestrictPark } from '../../hooks/Parks/useRestrictPark';

const center = {
  lat: 1.3503881629328163,
  lng: 103.85132690751749,
};
const { RangePicker } = TimePicker;
const { Text } = Typography;
const { TextArea } = Input;

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const daysOfTheWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const attributes = ['name', 'description', 'address', 'contactNumber', 'openingHours', 'closingHours'];

const ParkEdit = () => {
  const { user } = useAuth<StaffResponse>();
  const { id } = useParams();
  const navigate = useNavigate();
  const { park, loading } = useRestrictPark(id);
  const [createdData, setCreatedData] = useState<ParkResponse>();
  const [messageApi, contextHolder] = message.useMessage();
  const { selectedFiles, previewImages, setPreviewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (park) {
      const initialValues = {
        ...park,
        sunday: [dayjs(park.openingHours[0]), dayjs(park.closingHours[0])],
        monday: [dayjs(park.openingHours[1]), dayjs(park.closingHours[1])],
        tuesday: [dayjs(park.openingHours[2]), dayjs(park.closingHours[2])],
        wednesday: [dayjs(park.openingHours[3]), dayjs(park.closingHours[3])],
        thursday: [dayjs(park.openingHours[4]), dayjs(park.closingHours[4])],
        friday: [dayjs(park.openingHours[5]), dayjs(park.closingHours[5])],
        saturday: [dayjs(park.openingHours[6]), dayjs(park.closingHours[6])],
      };
      if (park.images) {
        setCurrentImages(park.images);
      }
      form.setFieldsValue(initialValues);
    }
  }, [park, form]);

  const parkStatusOptions = [
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

  const handleSubmit = async () => {
    if (!park) return;
    try {
      const formValues = await form.validateFields();
      const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, ...rest } = formValues;

      const openingHours: any[] = [];
      const closingHours: any[] = [];
      daysOfTheWeek.forEach((day, index) => {
        openingHours.push(formValues[day][0] ? formValues[day][0].toISOString() : null);
        closingHours.push(formValues[day][1] ? formValues[day][1].toISOString() : null);
      });

      const finalData = { ...rest, openingHours, closingHours };

      const changedData: Partial<ParkResponse> = Object.keys(finalData).reduce((acc, key) => {
        const typedKey = key as keyof ParkResponse; // Cast key to the correct type
        if (JSON.stringify(finalData[typedKey]) !== JSON.stringify(park?.[typedKey])) {
          acc[typedKey] = finalData[typedKey];
        }
        return acc;
      }, {} as Partial<ParkResponse>);

      changedData.images = currentImages;
      const response = await updatePark(park.id, changedData, selectedFiles);
      setPreviewImages([]);
      if (response.status === 200) {
        setCreatedData(response.data);
        messageApi.open({
          type: 'success',
          content: 'Saved changes to Park.  Redirecting to Park details page...',
        });
        setTimeout(() => {
          navigate(`/park/${park.id}`);
        }, 1000);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'A park with this name already exists') {
          messageApi.open({
            type: 'error',
            content: 'A park with this name already exists. Please choose a different name.',
          });
        } else {
          messageApi.open({
            type: 'error',
            content: error.message || 'Unable to save changes to Park. Please try again later.',
          });
        }
      } else {
        messageApi.open({
          type: 'error',
          content: 'An unexpected error occurred while updating the park.',
        });
      }
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
          content: `Please put a valid Park Hour range for ${day}`,
        });
      }
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: `Please manually input the Park Hour ranges.`,
      });
    }
  };

  const handleCurrentImageClick = (index: number) => {
    setCurrentImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const breadcrumbItems = [
    {
      title: 'Park Management',
      pathKey: '/park',
      isMain: true,
    },
    {
      title: park?.name ? park?.name : "Details",
      pathKey: `/park/${park?.id}`,
    },
    {
      title: "Edit",
      pathKey: `/park/${park?.id}/edit`,
      isCurrent: true,
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!park) {
    return <div>Park not found</div>;
  }

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems}/>
      <Card>
        <Form form={form} onFinish={handleSubmit} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
          {contextHolder}
          <Divider orientation="left">Park Details</Divider>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Park Name" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea placeholder="Park Description" />
          </Form.Item>
          <Form.Item name="parkStatus" label="Park Status" rules={[{ required: true }]}>
            <Select placeholder="Select a Status" options={parkStatusOptions} />
          </Form.Item>

          <Form.Item label={'Image'}>
            <ImageInput type="file" multiple onChange={handleFileChange} accept="image/png, image/jpeg" onClick={onInputClick} />
          </Form.Item>
          <Form.Item label={'Images'}>
            <div className="flex flex-wrap gap-2">
              {currentImages?.length > 0 &&
                currentImages.map((imgSrc, index) => (
                  <img
                    key={index}
                    src={imgSrc}
                    alt={`Preview ${index}`}
                    className="w-20 h-20 object-cover rounded border-[1px] border-green-100"
                    onClick={() => handleCurrentImageClick(index)}
                  />
                ))}

              {previewImages?.length > 0 &&
                previewImages.map((imgSrc, index) => (
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

          <Divider orientation="left">Contact Details</Divider>
          <Form.Item name="address" label="Address" rules={[{ required: true }]}>
            <Input placeholder="Park Address" />
          </Form.Item>
          <Form.Item
            name="contactNumber"
            label="Contact Number"
            rules={[
              { required: true },
              {
                pattern: /^[689]\d{7}$/,
                message: 'Contact number must consist of exactly 8 digits and be a valid Singapore contact number',
              },
            ]}
          >
            <Input placeholder="Contact Number" />
          </Form.Item>

          <Divider orientation="left">
            Park Hours <Text type="danger">{' *'}</Text>
          </Divider>

          <Form.Item label={'Sunday'} key="sunday">
            <Flex>
              <Form.Item name="sunday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="hh:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('sunday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Monday'} key="monday">
            <Flex>
              <Form.Item name="monday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="hh:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('monday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Tuesday'} key="tuesday">
            <Flex>
              <Form.Item name="tuesday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="hh:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('tuesday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Wednesday'} key="wednesday">
            <Flex>
              <Form.Item name="wednesday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="hh:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('wednesday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Thursday'} key="thursday">
            <Flex>
              <Form.Item name="thursday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="hh:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('thursday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Friday'} key="friday">
            <Flex>
              <Form.Item name="friday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="hh:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('friday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Saturday'} key="saturday">
            <Flex>
              <Form.Item name="saturday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="hh:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('saturday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8 }}>
            <Button type="primary" className="w-full" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </ContentWrapperDark>
  );
};

export default ParkEdit;
