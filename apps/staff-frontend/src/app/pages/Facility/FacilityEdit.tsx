import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import { FacilityResponse, updateFacilityDetails, getFacilityById } from '@lepark/data-access';
import {
  Form,
  Input,
  Button,
  Card,
  message,
  TimePicker,
  Select,
  Divider,
  Flex,
  Popconfirm,
  InputNumber,
  DatePicker,
  FormInstance,
} from 'antd';
import dayjs from 'dayjs';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImages from '../../hooks/Images/useUploadImages';

const { TextArea } = Input;
const { RangePicker } = TimePicker;

const daysOfTheWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const FacilityEdit = () => {
  const { facilityId } = useParams();
  const [facility, setFacility] = useState<FacilityResponse>();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { selectedFiles, previewImages, setPreviewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const [currentImages, setCurrentImages] = useState<string[]>([]);

  useEffect(() => {
    if (!facilityId) return;
    const fetchData = async () => {
      try {
        const facilityRes = await getFacilityById(facilityId);
        if (facilityRes.status === 200) {
          const facilityData = facilityRes.data;
          setFacility(facilityData);
          const initialValues = {
            ...facilityData,
            ...daysOfTheWeek.reduce(
              (acc, day, index) => ({
                ...acc,
                [day]: [dayjs(facilityData.openingHours[index]), dayjs(facilityData.closingHours[index])],
              }),
              {},
            ),
            lastMaintenanceDate: dayjs(facilityData.lastMaintenanceDate),
            nextMaintenanceDate: dayjs(facilityData.nextMaintenanceDate),
          };
          if (facilityData.images) {
            setCurrentImages(facilityData.images);
          }
          form.setFieldsValue(initialValues);
        }
      } catch (error) {
        message.error('An error occurred while fetching the facility details.');
        navigate('/');
      }
    };
    fetchData();
  }, [facilityId, form, navigate]);

  const handleSubmit = async () => {
    if (!facility) return;
    try {
      const formValues = await form.validateFields();
      const { sunday, monday, tuesday, wednesday, thursday, friday, saturday, ...rest } = formValues;

      const openingHours = daysOfTheWeek.map((day) => formValues[day][0]?.toISOString() || null);
      const closingHours = daysOfTheWeek.map((day) => formValues[day][1]?.toISOString() || null);

      const finalData = {
        ...rest,
        openingHours,
        closingHours,
        images: currentImages,
        lastMaintenanceDate: rest.lastMaintenanceDate.toISOString(),
        nextMaintenanceDate: rest.nextMaintenanceDate.toISOString(),
      };

      const response = await updateFacilityDetails(facility.id, finalData, selectedFiles);
      setPreviewImages([]);
      if (response.status === 200) {
        messageApi.success('Saved changes to Facility. Redirecting to Facility details page...');
        setTimeout(() => navigate(`/facilities/${facility.id}`), 1000);
      }
    } catch (error) {
      messageApi.error('Unable to save changes to Facility. Please try again later.');
    }
  };

  const handleApplyToAllChange = (day: string) => {
    const dayTime = form.getFieldValue(day);
    if (dayTime) {
      const newValues = daysOfTheWeek.reduce((acc, d) => ({ ...acc, [d]: dayTime }), {});
      form.setFieldsValue(newValues);
    } else {
      messageApi.error(`Please put a valid Facility Hour range for ${day}`);
    }
  };

  const handleCurrentImageClick = (index: number) => {
    setCurrentImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const breadcrumbItems = [
    { title: 'Facility Management', pathKey: '/facilities', isMain: true },
    { title: facility?.facilityName || 'Details', pathKey: `/facilities/${facility?.id}` },
    { title: 'Edit', pathKey: `/facilities/${facility?.id}/edit`, isCurrent: true },
  ];

  const facilityTypeOptions = [
    {
      value: 'TOILET',
      label: 'Toilet',
    },
    {
      value: 'PLAYGROUND',
      label: 'Playground',
    },
    {
      value: 'INFORMATION',
      label: 'Information',
    },
    {
      value: 'CARPARK',
      label: 'Carpark',
    },
    {
      value: 'ACCESSIBILITY',
      label: 'Accessibility',
    },
    {
      value: 'STAGE',
      label: 'Stage',
    },
    {
      value: 'WATER_FOUNTAIN',
      label: 'Water Fountain',
    },
    {
      value: 'PICNIC_AREA',
      label: 'Picnic Area',
    },
    {
      value: 'BBQ_PIT',
      label: 'BBQ Pit',
    },
    {
      value: 'CAMPING_AREA',
      label: 'Camping Area',
    },
    {
      value: 'AED',
      label: 'AED',
    },
    {
      value: 'FIRST_AID',
      label: 'First Aid',
    },
    {
      value: 'AMPHITHEATER',
      label: 'Amphitheater',
    },
    {
      value: 'GAZEBO',
      label: 'Gazebo',
    },
    {
      value: 'STOREROOM',
      label: 'Storeroom',
    },
    {
      value: 'OTHERS',
      label: 'Others',
    },
  ];

  const facilityStatusOptions = [
    {
      value: 'OPEN',
      label: 'Open',
    },
    {
      value: 'CLOSED',
      label: 'Closed',
    },
    {
      value: 'MAINTENANCE',
      label: 'Maintenance',
    },
  ];

  const validateDates = (form: FormInstance) => ({
    validator(_: any, value: moment.Moment) {
      const lastMaintenanceDate = form.getFieldValue('lastMaintenanceDate') as moment.Moment;

      if (lastMaintenanceDate && value.isBefore(lastMaintenanceDate, 'day')) {
        return Promise.reject(new Error('Next Maintenance Date cannot be earlier than Last Maintenance Date'));
      }

      return Promise.resolve();
    },
  });

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Form form={form} onFinish={handleSubmit} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
          <Divider orientation="left">Facility Details</Divider>
          <Form.Item name="facilityName" label="Facility Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="facilityDescription" label="Facility Description" rules={[{ required: true }]}>
            <TextArea />
          </Form.Item>
          <Form.Item name="facilityType" label="Facility Type" rules={[{ required: true }]}>
            <Select options={facilityTypeOptions} />
          </Form.Item>
          <Form.Item name="facilityStatus" label="Facility Status" rules={[{ required: true }]}>
            <Select options={facilityStatusOptions} />
          </Form.Item>
          <Form.Item name="isBookable" label="Is Bookable" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Yes', value: true },
                { label: 'No', value: false },
              ]}
            />
          </Form.Item>
          <Form.Item name="isPublic" label="Is Public" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Yes', value: true },
                { label: 'No', value: false },
              ]}
            />
          </Form.Item>
          <Form.Item name="isSheltered" label="Is Sheltered" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Yes', value: true },
                { label: 'No', value: false },
              ]}
            />
          </Form.Item>
          <Form.Item name="reservationPolicy" label="Reservation Policy" rules={[{ required: true }]}>
            <TextArea />
          </Form.Item>
          <Form.Item name="rulesAndRegulations" label="Rules and Regulations" rules={[{ required: true }]}>
            <TextArea />
          </Form.Item>
          <Form.Item name="size" label="Size" rules={[{ required: true }]}>
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item name="capacity" label="Capacity" rules={[{ required: true }]}>
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item name="fee" label="Fee" rules={[{ required: true }]}>
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="lastMaintenanceDate" label="Last Maintenance Date" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="nextMaintenanceDate" label="Next Maintenance Date" rules={[{ required: true }, validateDates(form)]}>
            <DatePicker />
          </Form.Item>

          <Divider orientation="left">Facility Hours</Divider>
          {daysOfTheWeek.map((day) => (
            <Form.Item label={day.charAt(0).toUpperCase() + day.slice(1)} key={day}>
              <Flex>
                <Form.Item name={day} noStyle rules={[{ required: true, message: 'Please enter valid Facility Hours' }]}>
                  <RangePicker className="w-full" use12Hours format="hh:mm a" />
                </Form.Item>
                <Popconfirm title="This will override all other days." onConfirm={() => handleApplyToAllChange(day)}>
                  <Button style={{ marginLeft: 16 }}>Apply to all</Button>
                </Popconfirm>
              </Flex>
            </Form.Item>
          ))}

          <Form.Item label="Images">
            <ImageInput type="file" multiple onChange={handleFileChange} accept="image/png, image/jpeg" onClick={onInputClick} />
            <div className="flex flex-wrap gap-2 mt-2">
              {currentImages?.map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`Preview ${index}`}
                  className="w-20 h-20 object-cover rounded"
                  onClick={() => handleCurrentImageClick(index)}
                />
              ))}
              {previewImages?.map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`New ${index}`}
                  className="w-20 h-20 object-cover rounded"
                  onClick={() => removeImage(index)}
                />
              ))}
            </div>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8 }}>
            <Button type="primary" htmlType="submit" className="w-full">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </ContentWrapperDark>
  );
};

export default FacilityEdit;
