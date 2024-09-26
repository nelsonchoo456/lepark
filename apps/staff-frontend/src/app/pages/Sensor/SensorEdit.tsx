import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ImageInput, useAuth } from '@lepark/common-ui';
import {
  getSensorById,
  updateSensorDetails,
  StaffResponse,
  SensorResponse,
  SensorUpdateData,
  getAllHubs,
  HubResponse,
  getFacilityById,
} from '@lepark/data-access';
import { ContentWrapperDark } from '@lepark/common-ui';
import PageHeader2 from '../../components/main/PageHeader2';
import { Form, Input, Button, message, notification, Select, DatePicker, Card, InputNumber, Space, Spin, FormInstance } from 'antd';
import dayjs from 'dayjs';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import { useFetchFacilities } from '../../hooks/Facilities/useFetchFacilities';
import { SensorTypeEnum, SensorStatusEnum, SensorUnitEnum } from '@prisma/client';
import { useRestrictSensors } from '../../hooks/Sensors/useRestrictSensors';

const { TextArea } = Input;

const formatEnumLabel = (enumValue: string): string => {
  return enumValue
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const SensorEdit = () => {
  const { sensorId } = useParams<{ sensorId: string }>();
  const [form] = Form.useForm();
  const { sensor, loading } = useRestrictSensors(sensorId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const notificationShown = useRef(false);
  const { handleFileChange, selectedFiles, previewImages, setPreviewImages, removeImage, onInputClick } = useUploadImages();
  const { parks } = useFetchParks();
  const { facilities } = useFetchFacilities();
  const [selectedHubName, setSelectedHubName] = useState<string | null>(null);
  const [selectedFacilityName, setSelectedFacilityName] = useState<string | null>(null);
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);
  const [hubs, setHubs] = useState<HubResponse[]>([]);
  const [createdData, setCreatedData] = useState<SensorResponse>();

  useEffect(() => {
    const fetchHubs = async () => {
      try {
        const response = await getAllHubs();
        setHubs(response.data);
      } catch (error) {
        console.error('Error fetching hubs:', error);
      }
    };
    fetchHubs();
  }, []);

  useEffect(() => {
    if (sensor) {
      const acquisitionDate = dayjs(sensor.acquisitionDate);
      const lastCalibratedDate = sensor.lastCalibratedDate ? dayjs(sensor.lastCalibratedDate) : null;
      const finalData = { ...sensor, acquisitionDate, lastCalibratedDate };

      if (sensor.image) {
        setPreviewImages([sensor.image]);
      }

      form.setFieldsValue(finalData);

      // Fetch facility details to get parkId
      if (sensor.facilityId) {
        fetchFacilityDetails(sensor.facilityId);
      }
    }
  }, [sensor]);

  const fetchFacilityDetails = async (facilityId: string) => {
    try {
      const facilityResponse = await getFacilityById(facilityId);
      if (facilityResponse.status === 200) {
        const facility = facilityResponse.data;
        setSelectedParkId(facility.parkId);
        form.setFieldsValue({ parkId: facility.parkId });
      }
    } catch (error) {
      console.error('Error fetching facility details:', error);
    }
  };

  const onFacilityChange = (value: string | undefined) => {
    setSelectedFacilityId(value || null);
  };

  const handleSubmit = async (values: any) => {
    if (!sensor) return;
    setIsSubmitting(true);
    try {
      const formValues = await form.validateFields();

      console.log('Form values:', formValues);

      const changedData: Partial<SensorResponse> = Object.keys(formValues).reduce((acc, key) => {
        const typedKey = key as keyof SensorResponse; // Cast key to the correct type
        if (JSON.stringify(formValues[typedKey]) !== JSON.stringify(sensor?.[typedKey])) {
          acc[typedKey] = formValues[typedKey];
        }
        return acc;
      }, {} as Partial<SensorResponse>);

      if (changedData.acquisitionDate) {
        changedData.acquisitionDate = dayjs(changedData.acquisitionDate).toISOString();
      }
      if (changedData.lastCalibratedDate) {
        changedData.lastCalibratedDate = dayjs(changedData.lastCalibratedDate).toISOString();
      }

      console.log('Submitting data:', changedData);

      const response = await updateSensorDetails(sensor.id, changedData, selectedFiles);
      if (response.status === 200) {
        console.log('Response:', response.data);
        setCreatedData(response.data);
        messageApi.open({
          type: 'success',
          content: 'Saved changes to Sensor. Redirecting to Sensor details page...',
        });
        setTimeout(() => {
          navigate(`/sensor/${sensor.id}`);
        }, 1000);
      }
    } catch (error) {
      message.error(String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateDates = (form: FormInstance) => ({
    validator(_: any, value: dayjs.Dayjs) {
      if (!value) {
        return Promise.reject(new Error('Please select a date'));
      }
      if (value.isAfter(dayjs(), 'day')) {
        return Promise.reject(new Error('Date cannot be in the future'));
      }
      return Promise.resolve();
    },
  });

  const onReset = () => {
    form.resetFields();
  };

  const validatePhoneNumber = (_: any, value: string) => {
    const phoneRegex = /^[689]\d{7}$/;
    if (!value || phoneRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject('Please enter a valid 8-digit phone number starting with 6, 8, or 9');
  };

  const breadcrumbItems = [
    {
      title: 'Sensor Management',
      pathKey: '/sensor',
      isMain: true,
    },
    {
      title: sensor?.serialNumber ? sensor?.serialNumber : 'Details',
      pathKey: `/sensor/${sensor?.id}`,
    },
    {
      title: 'Edit',
      pathKey: `/sensor/edit/${sensor?.id}`,
      isCurrent: true,
    },
  ];

  if (loading) {
    return (
      <ContentWrapperDark style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </ContentWrapperDark>
    );
  }

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {!showSuccessAlert && (
          <Form
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onFinish={handleSubmit}
            disabled={isSubmitting}
            className="max-w-[600px] mx-auto"
          >
            <Form.Item name="sensorName" label="Sensor Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="serialNumber" label="Serial Number" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="sensorType" label="Sensor Type" rules={[{ required: true }]}>
              <Select placeholder="Select sensor type">
                {Object.values(SensorTypeEnum).map((type) => (
                  <Select.Option key={type} value={type}>
                    {formatEnumLabel(type)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="sensorDescription" label="Sensor Description">
              <TextArea />
            </Form.Item>
            <Form.Item name="sensorStatus" label="Sensor Status" rules={[{ required: true }]}>
              <Select placeholder="Select sensor status">
                {Object.values(SensorStatusEnum).map((status) => (
                  <Select.Option key={status} value={status}>
                    {formatEnumLabel(status)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
              <Form.Item
              name="acquisitionDate"
              label="Acquisition Date"
              rules={[{ required: true, message: 'Please enter Acquisition Date' }, validateDates(form)]}
            >
              <DatePicker className="w-full" disabledDate={(current) => current && current > dayjs().endOf('day')} />
            </Form.Item>
            <Form.Item name="lastCalibratedDate" label="Last Calibrated Date">
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item
              name="calibrationFrequencyDays"
              label="Calibration Frequency"
              rules={[{ required: true, type: 'number', min: 1, max: 500, message: 'Please enter a number between 1 and 500' }]}
            >
              <InputNumber placeholder="Enter frequency in days" min={1} max={500} className="w-full" />
            </Form.Item>
            <Form.Item
              name="recurringMaintenanceDuration"
              label="Recurring Maintenance"
              rules={[{ required: true, type: 'number', min: 1, max: 500, message: 'Please enter a number between 1 and 500' }]}
            >
              <InputNumber placeholder="Enter duration in days" min={1} max={500} className="w-full" />
            </Form.Item>
            <Form.Item
              name="dataFrequencyMinutes"
              label="Data Frequency"
              rules={[{ required: true, type: 'number', min: 1, max: 999, message: 'Please enter a number between 1 and 999' }]}
            >
              <InputNumber placeholder="Enter data frequency in minutes" min={1} max={999} className="w-full" />
            </Form.Item>
            {/* ... (other form items) */}
            <Form.Item
              name="supplierContactNumber"
              label="Supplier Contact"
              rules={[{ required: true, message: 'Please input the supplier contact number' }, { validator: validatePhoneNumber }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="remarks" label="Remarks">
              <TextArea />
            </Form.Item>

            <Form.Item name="facilityId" label="Facility" rules={[{ required: true, message: 'Please select a facility' }]}>
              <Select placeholder="Select a facility" onChange={onFacilityChange}>
                {facilities.map((facility) => (
                  <Select.Option key={facility.id} value={facility.id}>
                    {facility.facilityName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Upload Image" tooltip="One image is required">
              <ImageInput type="file" onChange={handleFileChange} accept="image/png, image/jpeg" onClick={onInputClick} />
            </Form.Item>
            {previewImages.length > 0 && (
              <Form.Item label="Image Preview">
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

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Space>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                  Save
                </Button>
                <Button htmlType="button" onClick={onReset}>
                  Reset
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default SensorEdit;
