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
} from '@lepark/data-access';
import { ContentWrapperDark } from '@lepark/common-ui';
import PageHeader2 from '../../components/main/PageHeader2';
import { Form, Input, Button, message, notification, Select, DatePicker, Card, InputNumber, Space, Spin, FormInstance } from 'antd';
import dayjs from 'dayjs';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import { useFetchFacilities } from '../../hooks/Facilities/useFetchFacilities';
import { SensorTypeEnum, SensorStatusEnum, SensorUnitEnum } from '@prisma/client';

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
  const [sensor, setSensor] = useState<SensorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [createdSensorName, setCreatedSensorName] = useState('');
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
  const [hubs, setHubs] = useState<HubResponse[]>([]);

  useEffect(() => {
    const fetchHubs = async () => {
      try {
        const response = await getAllHubs(); // You'll need to create this API function
        setHubs(response.data);
      } catch (error) {
        console.error('Error fetching hubs:', error);
      }
    };
    fetchHubs();
  }, []);

  useEffect(() => {
    const fetchSensor = async () => {
      setLoading(true);
      try {
        const response = await getSensorById(sensorId as string);
        setSensor(response.data);
        form.setFieldsValue({
          ...response.data,
          acquisitionDate: dayjs(response.data.acquisitionDate),
          lastCalibratedDate: dayjs(response.data.lastCalibratedDate),
          nextMaintenanceDate: dayjs(response.data.nextMaintenanceDate),
          lastMaintenanceDate: dayjs(response.data.lastMaintenanceDate),
          hubId: response.data.hub?.name, // Set hub name instead of ID
          facilityId: response.data.facility?.facilityName, // Set facility name instead of ID
        });
        setSelectedHubId(response.data.hub?.id || null);
        setSelectedFacilityId(response.data.facility?.id || null);
        setSelectedHubName(response.data.hub?.name || null);
        setSelectedFacilityName(response.data.facility?.facilityName || null);
        if (response.data.image) {
          setPreviewImages([response.data.image]);
        }
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSensor();
  }, [sensorId, form]);

  useEffect(() => {
    if (!['SUPERADMIN', 'MANAGER', 'LANDSCAPE_ARCHITECT', 'PARK_RANGER'].includes(user?.role as string)) {
      if (!notificationShown.current) {
        notification.error({
          message: 'Access Denied',
          description: 'You are not allowed to access the Sensor Edit page!',
        });
        notificationShown.current = true;
      }
      navigate('/');
    }
  }, [user, navigate]);

  const handleClearFacility = () => {
    form.setFieldsValue({ facilityId: null });
    setSelectedFacilityId(null);
  };

  const disabledLastCalibratedDate = (current: dayjs.Dayjs) => {
    return current && current > dayjs().endOf('day');
  };

  const onFacilityChange = (value: string | undefined) => {
    setSelectedFacilityId(value || null);
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const submissionData = {
        ...values,
        hubId: selectedHubId || null,
        facilityId: selectedFacilityId || null,
      };

      const response = await updateSensorDetails(sensorId as string, submissionData, selectedFiles);
      if (response.status === 200) {
        setShowSuccessAlert(true);
        setCreatedSensorName(response.data.sensorName);
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

  const validateFutureDate = (form: FormInstance) => ({
    validator(_: any, value: dayjs.Dayjs) {
      if (!value) {
        return Promise.reject(new Error('Please select a date'));
      }
      if (value.isBefore(dayjs(), 'day')) {
        return Promise.reject(new Error('Date cannot be in the past'));
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
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
            <Form.Item name="acquisitionDate" label="Acquisition Date" rules={[{ required: true }]}>
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item name="lastCalibratedDate" label="Last Calibrated Date">
              <DatePicker className="w-full" disabledDate={disabledLastCalibratedDate} />
            </Form.Item>
            <Form.Item name="calibrationFrequencyDays" label="Calibration Frequency" rules={[{ required: true }]}>
              <InputNumber placeholder="Enter frequency in days" min={1} className="w-full" />
            </Form.Item>
            <Form.Item name="recurringMaintenanceDuration" label="Recurring Maintenance" rules={[{ required: true }]}>
              <InputNumber placeholder="Enter duration in days" min={1} className="w-full" />
            </Form.Item>

            <Form.Item name="dataFrequencyMinutes" label="Data Frequency (Minutes)" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item name="sensorUnit" label="Sensor Unit" rules={[{ required: true }]}>
              <Select placeholder="Select sensor unit">
                {Object.values(SensorUnitEnum).map((unit) => (
                  <Select.Option key={unit} value={unit}>
                    {formatEnumLabel(unit)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="supplier" label="Supplier" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="supplierContactNumber"
              label="Supplier Contact Number"
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
