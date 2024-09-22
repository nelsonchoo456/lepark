import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ImageInput, useAuth } from '@lepark/common-ui';
import { getSensorById, updateSensorDetails, StaffResponse, SensorResponse, SensorUpdateData } from '@lepark/data-access';
import { ContentWrapperDark } from '@lepark/common-ui';
import PageHeader2 from '../../components/main/PageHeader2';
import { Form, Input, Button, message, notification, Select, DatePicker, Card, InputNumber, Space, Spin, Result } from 'antd';
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
  const { user } = useAuth<StaffResponse>();
  const { sensorId } = useParams<{ sensorId: string }>();
  const [form] = Form.useForm();
  const [sensor, setSensor] = useState<SensorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const notificationShown = useRef(false);
  const { selectedFiles, previewImages, setPreviewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const { parks } = useFetchParks();
  const { facilities } = useFetchFacilities();
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [createdSensorName, setCreatedSensorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCalibratedDate, setLastCalibratedDate] = useState<dayjs.Dayjs | null>(null);
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    const fetchSensor = async () => {
      try {
        const response = await getSensorById(sensorId!);
        setSensor(response.data);
        form.setFieldsValue(response.data);
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

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const updatedData: SensorUpdateData = {
        ...values,
        acquisitionDate: dayjs(values.acquisitionDate).toISOString(),
        lastCalibratedDate: dayjs(values.lastCalibratedDate).toISOString(),
        lastMaintenanceDate: dayjs(values.lastMaintenanceDate).toISOString(),
        nextMaintenanceDate: dayjs(values.nextMaintenanceDate).toISOString(),
      };

      const response = await updateSensorDetails(sensorId!, updatedData, selectedFiles);
      messageApi.success('Sensor updated successfully');
      setCreatedSensorName(values.sensorName);
      setPreviewImages([]);
      if (response.status === 200) {
        setSensor(response.data);
        messageApi.open({
            type: 'success',
            content: 'Saved changes to Hub. Redirecting to Hub details page...',
          });
          // Add a 3-second delay before navigating
          setTimeout(() => {
            navigate(`/sensor/${sensor?.id}`);
          }, 1000);
      }
    } catch (error) {
      console.error('Error updating sensor:', error);
      messageApi.error('Failed to update sensor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabledLastCalibratedDate = (current: dayjs.Dayjs) => {
    return current && current > dayjs().endOf('day');
  };

  const disabledNextMaintenanceDate = (current: dayjs.Dayjs) => {
    if (!lastCalibratedDate) return false;
    return current && current.isBefore(lastCalibratedDate);
  };

  const onLastCalibratedDateChange = (date: dayjs.Dayjs | null) => {
    setLastCalibratedDate(date);
  };

  const onNextMaintenanceDateChange = (date: dayjs.Dayjs | null) => {
    setNextMaintenanceDate(date);
  };

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
      title: sensor?.sensorName ? sensor?.sensorName : 'Details',
      pathKey: `/sensor/${sensor?.id}`,
    },
    {
      title: 'Edit',
      pathKey: `/sensor/${sensor?.id}/edit`,
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

            <Form.Item name="sensorType" label="Sensor Type" rules={[{ required: true }]}>
              <Select placeholder="Select sensor type">
                {Object.values(SensorTypeEnum).map((type) => (
                  <Select.Option key={type} value={type}>
                    {formatEnumLabel(type)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="sensorDescription" label="Description">
              <Input.TextArea />
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

            <Form.Item name="lastCalibratedDate" label="Last Calibrated Date" rules={[{ required: true }]}>
              <DatePicker className="w-full" disabledDate={disabledLastCalibratedDate} onChange={onLastCalibratedDateChange} />
            </Form.Item>

            <Form.Item
              name="calibrationFrequencyDays"
              label="Calibration Frequency (days)"
              rules={[{ required: true, type: 'number', min: 1 }]}
            >
              <InputNumber className="w-full" min={1} />
            </Form.Item>

            <Form.Item
              name="recurringMaintenanceDuration"
              label="Maintenance Duration (days)"
              rules={[{ required: true, type: 'number', min: 1 }]}
            >
              <InputNumber className="w-full" min={1} />
            </Form.Item>

            <Form.Item name="lastMaintenanceDate" label="Last Maintenance Date" rules={[{ required: true }]}>
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item name="nextMaintenanceDate" label="Next Maintenance Date" rules={[{ required: true }]}>
              <DatePicker className="w-full" disabledDate={disabledNextMaintenanceDate} onChange={onNextMaintenanceDateChange} />
            </Form.Item>

            <Form.Item name="dataFrequencyMinutes" label="Data Frequency (minutes)" rules={[{ required: true, type: 'number', min: 1 }]}>
              <InputNumber className="w-full" min={1} />
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
              label="Supplier Contact"
              rules={[{ required: true, message: 'Please input the supplier contact number!' }, { validator: validatePhoneNumber }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="latitude" label="Latitude" rules={[{ type: 'number', min: -90, max: 90 }]}>
              <InputNumber className="w-full" />
            </Form.Item>

            <Form.Item name="longitude" label="Longitude" rules={[{ type: 'number', min: -180, max: 180 }]}>
              <InputNumber className="w-full" />
            </Form.Item>

            <Form.Item name="remarks" label="Remarks">
              <Input.TextArea />
            </Form.Item>

            <Form.Item name="hubId" label="Hub" rules={[{ required: false }]}>
              <div className="flex w-full">
                <Select placeholder="Select a hub" allowClear style={{ width: 'calc(100% - 80px)', marginRight: '8px' }}>
                  {parks.map((hub) => (
                    <Select.Option key={hub.id} value={hub.id}>
                      {hub.name}
                    </Select.Option>
                  ))}
                </Select>
                <Button
                  onClick={() => {
                    form.setFieldsValue({ hubId: undefined });
                    form.resetFields(['hubId']);
                  }}
                  style={{ width: '80px' }}
                >
                  Clear Hub
                </Button>
              </div>
            </Form.Item>

            <Form.Item name="facilityId" label="Facility">
              <Select placeholder="Select a facility" allowClear>
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

            {selectedFiles[0] && previewImages[0] && (
              <Form.Item label="Image Preview">
                <div className="flex flex-wrap gap-2">
                  <img
                    src={previewImages[0]}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded border-[1px] border-green-100"
                    onClick={() => removeImage(0)}
                  />
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
