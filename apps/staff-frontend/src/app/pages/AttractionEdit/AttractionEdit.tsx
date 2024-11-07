import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import {
  getAttractionById,
  updateAttractionDetails,
  AttractionResponse,
  StaffResponse,
  StaffType,
  AttractionStatusEnum,
} from '@lepark/data-access';
import { Button, Card, Divider, Flex, Form, Input, InputNumber, Popconfirm, Select, TimePicker, Typography, message, notification } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImages from '../../hooks/Images/useUploadImages';
import dayjs from 'dayjs';
import { useRestrictAttractions } from '../../hooks/Attractions/useRestrictAttractions';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const { RangePicker } = TimePicker;
const { Text } = Typography;
const { TextArea } = Input;

const daysOfTheWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const AttractionEdit = () => {
  const { user } = useAuth<StaffResponse>();
  const { id } = useParams();
  const { attraction, park, loading } = useRestrictAttractions(id);
  const [messageApi, contextHolder] = message.useMessage();
  const { selectedFiles, previewImages, setPreviewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const navigate = useNavigate();
  const notificationShown = useRef(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      if (!attraction) return;

      const initialValues = {
        ...attraction,
        sunday: [dayjs(attraction.openingHours[0]), dayjs(attraction.closingHours[0])],
        monday: [dayjs(attraction.openingHours[1]), dayjs(attraction.closingHours[1])],
        tuesday: [dayjs(attraction.openingHours[2]), dayjs(attraction.closingHours[2])],
        wednesday: [dayjs(attraction.openingHours[3]), dayjs(attraction.closingHours[3])],
        thursday: [dayjs(attraction.openingHours[4]), dayjs(attraction.closingHours[4])],
        friday: [dayjs(attraction.openingHours[5]), dayjs(attraction.closingHours[5])],
        saturday: [dayjs(attraction.openingHours[6]), dayjs(attraction.closingHours[6])],
      };
      if (attraction.images) {
        setCurrentImages(attraction.images);
      }
      form.setFieldsValue(initialValues);
    };
    fetchData();
  }, [id, attraction]);

  const attractionStatusOptions = Object.values(AttractionStatusEnum).map(status => ({
    value: status,
    label: formatEnumLabelToRemoveUnderscores(status),
  }));

  const handleSubmit = async () => {
    if (!attraction) return;
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

      const changedData: Partial<AttractionResponse> = Object.keys(finalData).reduce((acc, key) => {
        const typedKey = key as keyof AttractionResponse;
        if (JSON.stringify(finalData[typedKey]) !== JSON.stringify(attraction?.[typedKey])) {
          acc[typedKey] = finalData[typedKey];
        }
        return acc;
      }, {} as Partial<AttractionResponse>);

      changedData.images = currentImages;
      const response = await updateAttractionDetails(attraction.id, changedData, selectedFiles);
      setPreviewImages([]);
      if (response.status === 200) {
        messageApi.open({
          type: 'success',
          content: 'Saved changes to Attraction. Redirecting to Attraction details page...',
        });
        setTimeout(() => {
          navigate(`/attraction/${attraction.id}`);
        }, 1000);
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('An attraction with this title already exists in the park')) {
        messageApi.error('An attraction with this title already exists in the park.');
      } else {
        messageApi.open({
          type: 'error',
          content: 'An unexpected error occurred while updating the attraction.',
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
      title: 'Attractions Management',
      pathKey: '/attraction',
      isMain: true,
    },
    {
      title: attraction?.title ? attraction?.title : 'Details',
      pathKey: `/attraction/${attraction?.id}`,
    },
    {
      title: 'Edit',
      pathKey: `/attraction/${attraction?.id}/edit`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Form form={form} onFinish={handleSubmit} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
          {contextHolder}
          <Divider orientation="left">Attraction Details</Divider>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input
              placeholder="Attraction Title"
              onBlur={(e) => {
                const trimmedValue = e.target.value.trim();
                form.setFieldsValue({ title: trimmedValue });
              }}
            />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea placeholder="Attraction Description" />
          </Form.Item>
          <Form.Item name="status" label="Attraction Status" rules={[{ required: true }]}>
            <Select placeholder="Select a Status" options={attractionStatusOptions} />
          </Form.Item>
          <Form.Item name="maxCapacity" label="Daily Max Capacity (pax)" rules={[{ required: true, message: 'Please input the daily max capacity!' }]}>
            <InputNumber min={1} precision={0} step={1} />
          </Form.Item>
          <Form.Item name="ticketingPolicy" label="Ticketing Policy" rules={[{ required: true }]}>
            <TextArea placeholder="Ticketing Policy" autoSize={{ minRows: 3, maxRows: 5 }} />
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
            <Button type="primary" className="w-full" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </ContentWrapperDark>
  );
};

export default AttractionEdit;
