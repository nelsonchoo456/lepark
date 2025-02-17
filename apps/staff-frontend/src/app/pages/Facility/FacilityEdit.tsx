import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import { FacilityResponse, updateFacilityDetails, getFacilityById, FacilityTypeEnum, FacilityStatusEnum } from '@lepark/data-access';
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
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useRestrictFacilities } from '../../hooks/Facilities/useRestrictFacilities';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const { TextArea } = Input;
const { RangePicker } = TimePicker;
const { Text } = Typography;

const daysOfTheWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const FacilityEdit = () => {
  const { facilityId } = useParams();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { selectedFiles, previewImages, setPreviewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const { facility, park, loading } = useRestrictFacilities(facilityId);
  const [isPublic, setIsPublic] = useState(true);
  const [isBookable, setIsBookable] = useState(true);

  useEffect(() => {
    if (!facilityId) return;
    const fetchData = async () => {
      if (!facility) return;
      const initialValues = {
        ...facility,
        ...daysOfTheWeek.reduce(
          (acc, day, index) => ({
            ...acc,
            [day]: [dayjs(facility.openingHours[index]), dayjs(facility.closingHours[index])],
          }),
          {},
        ),
      };
      if (facility.images) {
        setCurrentImages(facility.images);
      }
      form.setFieldsValue(initialValues);

      if (!facility.isPublic) {
        setIsPublic(false);
      }

      if (!facility.isBookable) {
        setIsBookable(false);
      }
    };
    fetchData();
  }, [facilityId, facility]);

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
      };

      const response = await updateFacilityDetails(facility.id, finalData, selectedFiles);
      setPreviewImages([]);
      if (response.status === 200) {
        messageApi.success('Saved changes to Facility. Redirecting to Facility details page...');
        setTimeout(() => navigate(`/facilities/${facility.id}`), 1000);
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('A facility with this name already exists in the park.')) {
        messageApi.error('A facility with this name already exists in the park.');
      } else {
        messageApi.open({
          type: 'error',
          content: 'An unexpected error occurred while updating the facility.',
        });
      }
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
        isBookable: facility?.isBookable,
        reservationPolicy: facility?.reservationPolicy,
        fee: facility?.fee,
      });
      setIsBookable(facility?.isBookable ?? true);
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
        reservationPolicy: facility?.reservationPolicy === 'NIL' ? '' : facility?.reservationPolicy,
        fee: facility?.fee === 0 ? '' : facility?.fee,
      });
    }
  };

  const breadcrumbItems = [
    { title: 'Facility Management', pathKey: '/facilities', isMain: true },
    { title: facility?.name || 'Details', pathKey: `/facilities/${facility?.id}` },
    { title: 'Edit', pathKey: `/facilities/${facility?.id}/edit`, isCurrent: true },
  ];

  const facilityTypeOptions = Object.values(FacilityTypeEnum).map(type => ({
    value: type,
    label: formatEnumLabelToRemoveUnderscores(type),
  }));

  const facilityStatusOptions = Object.values(FacilityStatusEnum).map(status => ({
    value: status,
    label: formatEnumLabelToRemoveUnderscores(status),
  }));

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Form form={form} onFinish={handleSubmit} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
          <Divider orientation="left">Facility Details</Divider>
          <Form.Item name="name" label="Facility Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Facility Description" rules={[{ required: true }]}>
            <TextArea />
          </Form.Item>
          <Form.Item name="facilityType" label="Facility Type" rules={[{ required: true }]}>
            <Select options={facilityTypeOptions} />
          </Form.Item>
          <Form.Item name="facilityStatus" label="Facility Status" rules={[{ required: true }]}>
            <Select options={facilityStatusOptions} />
          </Form.Item>
          <Form.Item
            name="isSheltered"
            label="Is Sheltered"
            rules={[{ required: true }]}
            tooltip="Please indicate if the facility is sheltered"
          >
            <Select
              options={[
                { label: 'Yes', value: true },
                { label: 'No', value: false },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="isPublic"
            label="Is Public"
            rules={[{ required: true }]}
            tooltip="Please indicate if the facility is open to public"
          >
            <Select
              options={[
                { label: 'Yes', value: true },
                { label: 'No', value: false },
              ]}
              onChange={handleIsPublicChange}
            />
          </Form.Item>
          <Form.Item
            name="isBookable"
            label="Is Bookable"
            rules={[{ required: true }]}
            tooltip="Please indicate if the facility is open to booking"
            hidden={!isPublic}
          >
            <Select
              options={[
                { label: 'Yes', value: true },
                { label: 'No', value: false },
              ]}
              onChange={handleIsBookableChange}
            />
          </Form.Item>
          <Form.Item name="reservationPolicy" label="Reservation Policy" rules={[{ required: true }]} hidden={!isPublic || !isBookable}>
            <TextArea placeholder="Enter reservation policy" />
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
          <Form.Item name="fee" label="Fee" rules={[{ required: true }]} hidden={!isPublic || !isBookable}>
            <InputNumber min={0} />
          </Form.Item>

          <Divider orientation="left">
            Facility Hours<Text type="danger">{' *'}</Text>
          </Divider>
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

          <Form.Item label="Image">
            <ImageInput type="file" multiple onChange={handleFileChange} accept="image/png, image/jpeg" onClick={onInputClick} />
          </Form.Item>
          <Form.Item label="Images">
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
