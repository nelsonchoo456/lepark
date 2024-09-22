import { useEffect, useRef, useState } from 'react';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
import { SensorTypeEnum, SensorStatusEnum, SensorUnitEnum } from '@prisma/client';
import { Button, Card, DatePicker, Form, Input, InputNumber, message, Modal, notification, Result, Select, Space, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImages from '../../hooks/Images/useUploadImages';
import dayjs from 'dayjs';
import { createSensor, getAllHubs, getAllFacilities, SensorData, StaffResponse, FacilityResponse, HubResponse } from '@lepark/data-access';
import { useFetchHubs } from '../../hooks/Hubs/useFetchHubs';
import { useFetchFacilities } from '../../hooks/Facilities/useFetchFacilities';

const formatEnumLabel = (enumValue: string): string => {
  return enumValue
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};



const SensorCreate = () => {
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const navigate = useNavigate();
  const [createdSensor, setCreatedSensor] = useState<any | null>();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);
  const [loading, setLoading] = useState(true);

  const { hubs, loading: hubsLoading } = useFetchHubs();
  const { facilities, loading: facilitiesLoading } = useFetchFacilities();


  useEffect(() => {
    if (user && user.id !== '') {
      if (!['MANAGER', 'SUPERADMIN', 'PARK_RANGER', 'LANDSCAPE_ARCHITECT'].includes(user.role)) {
        if (!notificationShown.current) {
          notification.error({
            message: 'Access Denied',
            description: 'You are not allowed to access the Create Sensor page!',
          });
          notificationShown.current = true;
        }
        navigate('/');
      } else {
        setLoading(false);
      }
    }
  }, [user, navigate]);


  useEffect(() => {
    if (user && user.id !== '') {
      if (!['MANAGER', 'SUPERADMIN', 'PARK_RANGER', 'LANDSCAPE_ARCHITECT'].includes(user.role)) {
        if (!notificationShown.current) {
          notification.error({
            message: 'Access Denied',
            description: 'You are not allowed to access the Create Sensor page!',
          });
          notificationShown.current = true;
        }
        navigate('/');
      } else {
        setLoading(false);
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setWebMode(window.innerWidth >= SCREEN_LG);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);



  const [form] = Form.useForm();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [createdSensorName, setCreatedSensorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCalibratedDate, setLastCalibratedDate] = useState<dayjs.Dayjs | null>(null);
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState<dayjs.Dayjs | null>(null);

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

  const onFinish = async (values: any) => {
    setIsSubmitting(true);
    try {
      const sensorData: SensorData = {
        sensorName: values.sensorName,
        sensorType: values.sensorType,
        sensorDescription: values.sensorDescription,
        sensorStatus: values.sensorStatus,
        acquisitionDate: dayjs(values.acquisitionDate).toISOString(),
        lastCalibratedDate: dayjs(values.lastCalibratedDate).toISOString(),
        calibrationFrequencyDays: values.calibrationFrequencyDays,
        recurringMaintenanceDuration: values.recurringMaintenanceDuration,
        lastMaintenanceDate: dayjs(values.lastMaintenanceDate).toISOString(),
        nextMaintenanceDate: dayjs(values.nextMaintenanceDate).toISOString(),
        dataFrequencyMinutes: values.dataFrequencyMinutes,
        sensorUnit: values.sensorUnit,
        supplier: values.supplier,
        supplierContactNumber: values.supplierContactNumber,
        latitude: values.latitude,
        longitude: values.longitude,
        remarks: values.remarks,
        hubId: values.hubId || undefined,
        facilityId: values.facilityId || undefined,
        image: '', // Initially blank, will be populated by backend
      };

    const response = await createSensor(sensorData, selectedFiles);
      console.log('Sensor created:', response.data);
      setCreatedSensorName(values.sensorName);
      setCreatedSensor(response.data);
      setShowSuccessAlert(true);
      form.resetFields();
    } catch (error) {
      message.error(String(error));
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
      title: 'Create Sensor',
      pathKey: `/sensor/create`,
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

  const clearHub = () => {
    form.setFieldsValue({ hubId: undefined, facilityId: undefined });
    form.resetFields(['hubId', 'facilityId']);
  };

  const clearFacility = () => {
    form.setFieldsValue({ facilityId: undefined, hubId: undefined });
    form.resetFields(['facilityId', 'hubId']);
  };

  const onHubChange = (value: string) => {
    if (value) {
      form.setFieldsValue({ facilityId: undefined });
      form.resetFields(['facilityId']);
    }
  };

  const onFacilityChange = (value: string) => {
    if (value) {
      form.setFieldsValue({ hubId: undefined });
      form.resetFields(['hubId']);
    }
  };

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {!showSuccessAlert && (
          <Form {...layout} form={form} name="control-hooks" onFinish={onFinish} disabled={isSubmitting} className="max-w-[600px] mx-auto">
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
              <DatePicker
                className="w-full"
                disabledDate={disabledLastCalibratedDate}
                onChange={onLastCalibratedDateChange}
              />
            </Form.Item>

            <Form.Item name="calibrationFrequencyDays" label="Calibration Frequency (days)" rules={[{ required: true, type: 'number', min: 1 }]}>
              <InputNumber className="w-full" min={1} />
            </Form.Item>

            <Form.Item name="recurringMaintenanceDuration" label="Maintenance Duration (days)" rules={[{ required: true, type: 'number', min: 1 }]}>
              <InputNumber className="w-full" min={1} />
            </Form.Item>

            <Form.Item name="lastMaintenanceDate" label="Last Maintenance Date" rules={[{ required: true }]}>
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item name="nextMaintenanceDate" label="Next Maintenance Date" rules={[{ required: true }]}>
              <DatePicker
                className="w-full"
                disabledDate={disabledNextMaintenanceDate}
                onChange={onNextMaintenanceDateChange}
              />
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
              rules={[
                { required: true, message: 'Please input the supplier contact number!' },
                { validator: validatePhoneNumber }
              ]}
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
          <Select
            placeholder="Select a hub"
            allowClear
            style={{ width: 'calc(100% - 100px)', marginRight: '8px' }}
            onChange={onHubChange}
          >
            {hubs.map((hub) => (
              <Select.Option key={hub.id} value={hub.id}>
                {hub.name}
              </Select.Option>
            ))}
          </Select>
          <Button
            onClick={clearHub}
            style={{ width: '100px' }}
          >
            Clear Hub
          </Button>
        </div>
      </Form.Item>

      <Form.Item name="facilityId" label="Facility">
        <div className="flex w-full">
          <Select
            placeholder="Select a facility"
            allowClear
            style={{ width: 'calc(100% - 100px)', marginRight: '8px' }}
            onChange={onFacilityChange}
          >
            {facilities.map((facility) => (
              <Select.Option key={facility.id} value={facility.id}>
                {facility.facilityName}
              </Select.Option>
            ))}
          </Select>
          <Button
            onClick={clearFacility}
            style={{ width: '100px' }}
          >
            Clear Facility
          </Button>
        </div>
      </Form.Item>


              <Form.Item label="Upload Image"  tooltip="One image is required">
              <ImageInput
                type="file"
                onChange={handleFileChange}
                accept="image/png, image/jpeg"
                onClick={onInputClick}
              />
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

            <Form.Item {...tailLayout}>
              <Space>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                  Submit
                </Button>
                <Button htmlType="button" onClick={onReset}>
                  Reset
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
        {showSuccessAlert && (
          <Result
            status="success"
            title="Created new Sensor"
            subTitle={createdSensorName && <>Sensor name: {createdSensorName}</>}
            extra={[
              <Button key="back" onClick={() => navigate('/sensor')}>
                Back to Sensor Management
              </Button>,
              <Button type="primary" key="view" onClick={() => navigate(`/sensor/${createdSensor?.id}`)}>
                View new Sensor
              </Button>,
            ]}
          />
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default SensorCreate;
