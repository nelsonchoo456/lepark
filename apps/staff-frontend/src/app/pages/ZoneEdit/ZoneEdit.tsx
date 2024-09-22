import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import { updateZone, ZoneResponse, StaffResponse } from '@lepark/data-access';
import { Button, Card, Divider, Flex, Form, Input, Popconfirm, Typography, TimePicker, Select, message } from 'antd';
import dayjs from 'dayjs';
import useUploadImages from '../../hooks/Images/useUploadImages';
import PageHeader2 from '../../components/main/PageHeader2';
import { useRestrictZone } from '../../hooks/Zones/useRestrictZone';

const { RangePicker } = TimePicker;
const { Text } = Typography;
const { TextArea } = Input;

const daysOfTheWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const ZoneEdit = () => {
  const { user } = useAuth<StaffResponse>();
  const { id } = useParams();
  const navigate = useNavigate();
  const { zone, loading } = useRestrictZone(id);
  const [messageApi, contextHolder] = message.useMessage();
  const { selectedFiles, previewImages, setPreviewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (zone) {
      const initialValues = {
        ...zone,
        sunday: [dayjs(zone.openingHours[0]), dayjs(zone.closingHours[0])],
        monday: [dayjs(zone.openingHours[1]), dayjs(zone.closingHours[1])],
        tuesday: [dayjs(zone.openingHours[2]), dayjs(zone.closingHours[2])],
        wednesday: [dayjs(zone.openingHours[3]), dayjs(zone.closingHours[3])],
        thursday: [dayjs(zone.openingHours[4]), dayjs(zone.closingHours[4])],
        friday: [dayjs(zone.openingHours[5]), dayjs(zone.closingHours[5])],
        saturday: [dayjs(zone.openingHours[6]), dayjs(zone.closingHours[6])],
      };
      if (zone.images) {
        setCurrentImages(zone.images);
      }
      form.setFieldsValue(initialValues);
    }
  }, [zone, form]);

  const handleSubmit = async () => {
    if (!zone) return;
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

      const changedData: Partial<ZoneResponse> = Object.keys(finalData).reduce((acc, key) => {
        const typedKey = key as keyof ZoneResponse;
        if (JSON.stringify(finalData[typedKey]) !== JSON.stringify(zone?.[typedKey])) {
          acc[typedKey] = finalData[typedKey];
        }
        return acc;
      }, {} as Partial<ZoneResponse>);

      changedData.images = currentImages;
      const response = await updateZone(zone.id, changedData, selectedFiles);
      setPreviewImages([]);
      if (response.status === 200) {
        messageApi.open({
          type: 'success',
          content: 'Saved changes to Zone. Redirecting to Zone details page...',
        });
        setTimeout(() => {
          navigate(`/zone/${zone.id}`);
        }, 1000);
      }
    } catch (error) {
      if (error instanceof Error) {
        messageApi.open({
          type: 'error',
          content: error.message || 'Unable to save changes to Zone. Please try again later.',
        });
      } else {
        messageApi.open({
          type: 'error',
          content: 'An unexpected error occurred while updating the zone.',
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

  const handleCurrentImageClick = (index: number) => {
    setCurrentImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const zoneStatusOptions = [
    { value: 'OPEN', label: 'Open' },
    { value: 'UNDER_CONSTRUCTION', label: 'Under Construction' },
    { value: 'LIMITED_ACCESS', label: 'Limited Access' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  const breadcrumbItems = [
    {
      title: 'Zone Management',
      pathKey: '/zone',
      isMain: true,
    },
    {
      title: zone?.name ? zone?.name : "Details",
      pathKey: `/zone/${zone?.id}`,
    },
    {
      title: "Edit",
      pathKey: `/zone/${zone?.id}/edit`,
      isCurrent: true,
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!zone) {
    return <div>Zone not found</div>;
  }

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems}/>
      <Card>
        <Form form={form} onFinish={handleSubmit} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
          {contextHolder}
          <Divider orientation="left">Zone Details</Divider>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
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
            Zone Hours <Text type="danger">{' *'}</Text>
          </Divider>

          {daysOfTheWeek.map((day) => (
            <Form.Item label={day.charAt(0).toUpperCase() + day.slice(1)} key={day}>
              <Flex>
                <Form.Item name={day} noStyle rules={[{ required: true, message: 'Please enter valid Zone Hours' }]}>
                  <RangePicker className="w-full" use12Hours format="hh:mm a" />
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

export default ZoneEdit;