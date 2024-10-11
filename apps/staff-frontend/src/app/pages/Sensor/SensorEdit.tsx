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
  FacilityResponse,
  checkSensorDuplicateSerialNumber,
} from '@lepark/data-access';
import { ContentWrapperDark } from '@lepark/common-ui';
import PageHeader2 from '../../components/main/PageHeader2';
import { Divider, Form, Input, Button, message, notification, Select, DatePicker, Card, InputNumber, Space, Spin } from 'antd';
import dayjs from 'dayjs';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import { useFetchFacilities } from '../../hooks/Facilities/useFetchFacilities';
import { SensorTypeEnum, SensorStatusEnum, SensorUnitEnum, FacilityStatusEnum, FacilityTypeEnum } from '@prisma/client';
import { useRestrictSensors } from '../../hooks/Sensors/useRestrictSensors';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const { TextArea } = Input;

const formatEnumLabel = (enumValue: string): string => {
  return enumValue
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const SensorEdit = () => {
  const { user } = useAuth<StaffResponse>();
  const { sensorId } = useParams();
  const { sensor, loading } = useRestrictSensors(sensorId);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { selectedFiles, previewImages, setPreviewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const { facilities } = useFetchFacilities();
  const [parkFacilities, setParkFacilities] = useState<FacilityResponse[]>([]);

  useEffect(() => {
    if (sensor) {
      const acquisitionDate = dayjs(sensor.acquisitionDate);
      const finalData = { ...sensor, acquisitionDate };

      setCurrentImages(sensor.images || []);

      form.setFieldsValue(finalData);

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
        const parkId = facility.parkId;
        form.setFieldsValue({ facilityId: facility.id });

        // Filter facilities based on the current facility's parkId
        const filtered = facilities.filter(
          (f) => f.parkId === parkId && f.facilityStatus === FacilityStatusEnum.OPEN && f.facilityType === FacilityTypeEnum.STOREROOM,
        );
        setParkFacilities(filtered);
      }
    } catch (error) {
      console.error('Error fetching facility details:', error);
    }
  };

  const handleSubmit = async () => {
    if (!sensor) return;
    try {
      const values = await form.validateFields();

      const changedData: Partial<SensorUpdateData> = Object.keys(values).reduce((acc, key) => {
        const typedKey = key as keyof SensorUpdateData;
        if (JSON.stringify(values[typedKey]) !== JSON.stringify(sensor?.[typedKey])) {
          acc[typedKey] = values[typedKey];
        }
        return acc;
      }, {} as Partial<SensorUpdateData>);

      const isDuplicate = await checkSensorDuplicateSerialNumber(values.serialNumber, sensor.id);
      if (isDuplicate) {
        messageApi.error('This Serial Number already exists. Please enter a unique Serial Number.');
        return;
      }

      if (changedData.acquisitionDate) {
        changedData.acquisitionDate = dayjs(changedData.acquisitionDate).toISOString();
      }

      changedData.images = currentImages;
      const sensorRes = await updateSensorDetails(sensor.id, changedData, selectedFiles);
      setPreviewImages([]);
      if (sensorRes.status === 200) {
        messageApi.open({
          type: 'success',
          content: 'Saved changes to Sensor. Redirecting to Sensor details page...',
        });
        setTimeout(() => {
          navigate(`/sensor/${sensor.id}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating Sensor', error);
      messageApi.open({
        type: 'error',
        content: 'Unable to update Sensor. Please try again later.',
      });
    }
  };

  const handleCurrentImageClick = (index: number) => {
    setCurrentImages((prevImages) => prevImages.filter((_, i) => i !== index));
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
      title: sensor?.identifierNumber ? sensor?.identifierNumber : 'Details',
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
        <Form form={form} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8" onFinish={handleSubmit}>
          <Divider orientation="left">Select Facility</Divider>

          <Form.Item name="facilityId" label="Facility" rules={[{ required: true }]}>
            <Select
              placeholder="Select a Facility"
              options={parkFacilities?.map((facility) => ({ key: facility.id, value: facility.id, label: facility.name }))}
            />
          </Form.Item>

          <Divider orientation="left">Sensor Details</Divider>

          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter Sensor Name' }]}>
            <Input placeholder="Enter Name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea placeholder="Enter Description" autoSize={{ minRows: 3, maxRows: 5 }} />
          </Form.Item>
          <Form.Item name="serialNumber" label="Serial Number" rules={[{ required: true, message: 'Please enter Serial Number' }]}>
            <Input placeholder="Enter Serial Number" />
          </Form.Item>
          <Form.Item name="sensorType" label="Sensor Type" rules={[{ required: true, message: 'Please select Sensor Type' }]}>
            <Select placeholder="Select Sensor Type">
              {Object.values(SensorTypeEnum).map((type) => (
                <Select.Option key={type} value={type}>
                  {formatEnumLabelToRemoveUnderscores(type)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="sensorStatus" label="Sensor Status" rules={[{ required: true, message: 'Please select Sensor Status' }]}>
            <Select placeholder="Select Sensor Status">
              {Object.values(SensorStatusEnum).filter((s) => s !== "ACTIVE").map((status) => (
                <Select.Option key={status} value={status}>
                  {formatEnumLabelToRemoveUnderscores(status)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="sensorUnit" label="Sensor Unit" rules={[{ required: true, message: 'Please select Sensor Unit' }]}>
            <Select placeholder="Select Sensor Unit">
              {Object.values(SensorUnitEnum).map((unit) => (
                <Select.Option key={unit} value={unit}>
                  {formatEnumLabelToRemoveUnderscores(unit)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="acquisitionDate" label="Acquisition Date" rules={[{ required: true, message: 'Please enter Acquisition Date' }]}>
            <DatePicker className="w-full" disabledDate={(current) => current && current > dayjs().endOf('day')} />
          </Form.Item>
          <Form.Item name="remarks" label="Remarks">
            <TextArea placeholder="Enter any remarks" autoSize={{ minRows: 3, maxRows: 5 }} />
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
                    alt={`Current ${index}`}
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
          <Divider orientation="left">Supplier Details</Divider>
          <Form.Item name="supplier" label="Supplier" rules={[{ required: true, message: 'Please enter Supplier' }]}>
            <Input placeholder="Enter Supplier" />
          </Form.Item>
          <Form.Item
            name="supplierContactNumber"
            label="Supplier Contact Number"
            rules={[{ required: true, message: 'Please enter Supplier Contact Number' }, { validator: validatePhoneNumber }]}
          >
            <Input placeholder="Enter Supplier Contact Number" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8 }}>
            <Button type="primary" htmlType="submit" className="w-full">
              Update
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </ContentWrapperDark>
  );
};

export default SensorEdit;
