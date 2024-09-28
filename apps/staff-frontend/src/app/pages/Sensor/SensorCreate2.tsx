import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, useAuth, ImageInput } from '@lepark/common-ui';
import { createSensor, StaffResponse, HubResponse, FacilityResponse, getAllParks, ParkResponse } from '@lepark/data-access';
import { Button, Card, Form, Input, Result, message, notification, DatePicker, Divider, InputNumber, Select, Space, Modal } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import { SensorResponse } from '@lepark/data-access';
import useUploadImagesAssets from '../../hooks/Images/useUploadImagesAssets';
import { useFetchHubs } from '../../hooks/Hubs/useFetchHubs';
import { useFetchFacilities } from '../../hooks/Facilities/useFetchFacilities';
import { SensorTypeEnum, SensorStatusEnum, SensorUnitEnum } from '@prisma/client';
import dayjs from 'dayjs';

const { TextArea } = Input;

const SensorCreate2 = () => {
  const { user } = useAuth<StaffResponse>();
  const { hubs } = useFetchHubs();
  const { facilities } = useFetchFacilities();
  const [createdData, setCreatedData] = useState<SensorResponse | null>();
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImagesAssets();

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const notificationShown = useRef(false);

  const [form] = Form.useForm();
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<FacilityResponse[]>([]);

  useEffect(() => {
    const fetchParks = async () => {
      if (user?.role === 'SUPERADMIN') {
        try {
          const parksResponse = await getAllParks();
          setParks(parksResponse.data);
        } catch (error) {
          console.error('Error fetching parks:', error);
          message.error('Failed to fetch parks');
        }
      }
    };

    fetchParks();
  }, [user]);

  const handleParkChange = (parkId: string) => {
    const parkFacilities = facilities.filter(facility => facility.parkId === Number(parkId));
    setFilteredFacilities(parkFacilities);
    form.setFieldsValue({ facilityId: undefined });
  };

  const formatEnumLabel = (enumValue: string): string => {
    return enumValue
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const validatePhoneNumber = (_: any, value: string) => {
    const phoneRegex = /^[689]\d{7}$/;
    if (!value || phoneRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject('Please enter a valid 8-digit phone number starting with 6, 8, or 9');
  };

  const disabledDate = (current: dayjs.Dayjs) => {
    return current && current > dayjs().endOf('day');
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

  const onFinish = async (values: any) => {


    try {
      const sensorData = {
        ...values,
        latitude: 0,
        longitude: 0,
      };
      delete sensorData.parkId;
      const imagesToUpload = selectedFiles.length > 0 ? selectedFiles : [];
      const response = await createSensor(sensorData, imagesToUpload);
      setCreatedData(response.data);
      message.success('Sensor created successfully');
    } catch (error) {
      message.error(String(error));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedFiles.length + (e.target.files?.length || 0) > 5) {
      message.error('You can only upload up to 5 images');
      return;
    }
    handleFileChange(e);
  };


  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {!createdData ? (
          <Form
            form={form}
            layout="horizontal"
            onFinish={onFinish}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: '600px', margin: '0 auto' }}
          >
            <Divider orientation="left">Sensor Details</Divider>
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
            <Form.Item name="sensorUnit" label="Sensor Unit" rules={[{ required: true }]}>
              <Select placeholder="Select sensor unit">
                {Object.values(SensorUnitEnum).map((unit) => (
                  <Select.Option key={unit} value={unit}>
                    {formatEnumLabel(unit)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="acquisitionDate"
              label="Acquisition Date"
              rules={[{ required: true, message: 'Please select the acquisition date' }]}
            >
              <DatePicker className="w-full" disabledDate={disabledDate} />
            </Form.Item>
            <Form.Item name="lastCalibratedDate" label="Last Calibrated Date">
              <DatePicker className="w-full" disabledDate={disabledDate} />
            </Form.Item>
            <Form.Item
              name="calibrationFrequencyDays"
              label="Calibration Frequency"
              rules={[{ required: true, type: 'number', min: 1, max: 500, message: 'Please enter a number between 1 and 500' }]}
            >
              <InputNumber placeholder="Enter frequency in days" min={1} max={500} className="w-full" />
            </Form.Item>

            <Form.Item
              name="dataFrequencyMinutes"
              label="Data Frequency"
              rules={[{ required: true, type: 'number', min: 1, max: 999, message: 'Please enter a number between 1 and 999' }]}
            >
              <InputNumber placeholder="Enter data frequency in minutes" min={1} max={999} className="w-full" />
            </Form.Item>
            <Form.Item name="supplier" label="Supplier" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="supplierContactNumber"
              label="Supplier Contact"
              rules={[
                { required: true, message: 'Please input the supplier contact number' },
                { validator: validatePhoneNumber }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="remarks" label="Remarks">
              <TextArea />
            </Form.Item>
            {user?.role === 'SUPERADMIN' && (
              <Form.Item name="parkId" label="Park" rules={[{ required: true, message: 'Please select a park' }]}>
                <Select placeholder="Select a park" onChange={handleParkChange}>
                  {parks.map((park) => (
                    <Select.Option key={park.id} value={park.id}>
                      {park.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            <Form.Item
              name="facilityId"
              label="Facility"
              rules={[{ required: true, message: 'Please select a facility' }]}
            >
              <Select placeholder="Select a facility">
                {(user?.role === 'SUPERADMIN' ? filteredFacilities : facilities).map((facility) => (
                  <Select.Option key={facility.id} value={facility.id}>
                    {facility.facilityName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
           <Form.Item label="Upload Images" tooltip="Optional. You can upload up to 5 images.">
              <ImageInput
                type="file"
                multiple
                onChange={handleImageUpload}
                accept="image/png, image/jpeg"
                onClick={onInputClick}
              />
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
              <Button type="primary" htmlType="submit" className="w-full">
                Create Sensor
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Result
            status="success"
            title="Created new Sensor"
            subTitle={createdData && <>Sensor name: {createdData.sensorName}</>}
            extra={[
              <Button key="back" onClick={() => navigate('/sensor')}>
                Back to Sensor Management
              </Button>,
              <Button type="primary" key="view" onClick={() => navigate(`/sensor/${createdData?.id}`)}>
                View new Sensor
              </Button>,
            ]}
          />
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default SensorCreate2;
