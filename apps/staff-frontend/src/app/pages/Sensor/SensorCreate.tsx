import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import { createSensor, FacilityResponse, ParkResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { Button, Card, DatePicker, Divider, Form, Input, InputNumber, Select, message, Result, FormInstance } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import dayjs from 'dayjs';
import moment from 'moment';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import { useFetchFacilities } from '../../hooks/Facilities/useFetchFacilities';
import { FacilityStatusEnum, FacilityTypeEnum, SensorStatusEnum, SensorTypeEnum, SensorUnitEnum } from '@prisma/client';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const { TextArea } = Input;

const SensorCreate = () => {
  const { user } = useAuth<StaffResponse>();
  const { parks } = useFetchParks();
  const { facilities } = useFetchFacilities();
  const [messageApi, contextHolder] = message.useMessage();
  const [createdData, setCreatedData] = useState<any | null>();
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);

  const sensorTypeOptions = Object.values(SensorTypeEnum).map((type) => ({
    value: type,
    label: formatEnumLabelToRemoveUnderscores(type),
  }));

  const sensorStatusOptions = Object.values(SensorStatusEnum).map((status) => ({
    value: status,
    label: formatEnumLabelToRemoveUnderscores(status),
  }));

  const sensorUnitOptions = Object.values(SensorUnitEnum).map((unit) => ({
    value: unit,
    label: formatEnumLabelToRemoveUnderscores(unit),
  }));

  const validateDates = (form: FormInstance) => ({
    validator(_: any, value: moment.Moment) {
      if (value.isAfter(moment(), 'day')) {
        return Promise.reject(new Error('Date cannot be beyond today'));
      }
      return Promise.resolve();
    },
  });

  const validatePhoneNumber = (_: any, value: string) => {
    const phoneRegex = /^[689]\d{7}$/;
    if (!value || phoneRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject('Please enter a valid 8-digit phone number starting with 6, 8, or 9');
  };

  // Filter facilities based on selectedParkId for Superadmin, or use all facilities for other roles
  const filteredFacilities =
    user?.role === StaffType.SUPERADMIN && selectedParkId
      ? facilities.filter((facility) => facility.parkId === selectedParkId && facility.facilityStatus === FacilityStatusEnum.OPEN && facility.facilityType === FacilityTypeEnum.STOREROOM)
      : facilities.filter((facility) => facility.parkId === user?.parkId && facility.facilityStatus === FacilityStatusEnum.OPEN && facility.facilityType === FacilityTypeEnum.STOREROOM);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);

      const { parkId, ...filteredValues } = values;

      const finalData = {
        ...filteredValues,
        acquisitionDate: filteredValues.acquisitionDate ? dayjs(filteredValues.acquisitionDate).toISOString() : null,
        images: selectedFiles.length > 0 ? selectedFiles.map((file) => file.name) : [],
      };

      console.log('finalData', finalData);

      const response = await createSensor(finalData, selectedFiles.length > 0 ? selectedFiles : undefined);
      console.log('response', response);
      if (response?.status && response.status === 201) {
        setCreatedData(response.data);
      }
    } catch (error) {
      if ((error as { errorFields?: any }).errorFields) {
        console.log('Validation failed:', (error as { errorFields?: any }).errorFields);
      } else {
        console.log(error);
        messageApi.open({
          type: 'error',
          content: 'Unable to create Sensor. Please try again later.',
        });
      }
    }
  };

  const breadcrumbItems = [
    {
      title: 'Sensor Management',
      pathKey: '/sensor',
      isMain: true,
    },
    {
      title: 'Create',
      pathKey: `/sensor/create`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {!createdData ? (
          <Form form={form} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
            <Divider orientation="left">Select Park & Facility</Divider>

            {user?.role === StaffType.SUPERADMIN && (
              <Form.Item name="parkId" label="Park" rules={[{ required: true }]}>
                <Select
                  placeholder="Select a Park"
                  options={parks?.map((park) => ({ key: park.id, value: park.id, label: park.name }))}
                  onChange={(value) => {
                    setSelectedParkId(value);
                    form.setFieldsValue({ facilityId: undefined });
                  }}
                />
              </Form.Item>
            )}

            <Form.Item name="facilityId" label="Facility" rules={[{ required: true }]}>
              <Select
                placeholder="Select a Facility"
                options={filteredFacilities?.map((facility) => ({ key: facility.id, value: facility.id, label: facility.name }))}
                disabled={user?.role === StaffType.SUPERADMIN && !selectedParkId}
              />
            </Form.Item>

            <Divider orientation="left">Sensor Details</Divider>

            <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter Sensor Name' }]}>
              <Input placeholder="Enter Name" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <TextArea placeholder="Enter Description" autoSize={{ minRows: 3, maxRows: 5 }} />
            </Form.Item>
            <Form.Item name="sensorType" label="Sensor Type" rules={[{ required: true, message: 'Please select Sensor Type' }]}>
              <Select placeholder="Select Sensor Type" options={sensorTypeOptions} />
            </Form.Item>
            <Form.Item name="sensorStatus" label="Sensor Status" rules={[{ required: true, message: 'Please select Sensor Status' }]}>
              <Select placeholder="Select Sensor Status" options={sensorStatusOptions} />
            </Form.Item>
            <Form.Item name="sensorUnit" label="Sensor Unit" rules={[{ required: true, message: 'Please select Sensor Unit' }]}>
              <Select placeholder="Select Sensor Unit" options={sensorUnitOptions} />
            </Form.Item>
            <Form.Item
              name="acquisitionDate"
              label="Acquisition Date"
              rules={[{ required: true, message: 'Please enter Acquisition Date' }, validateDates(form)]}
            >
              <DatePicker className="w-full" maxDate={dayjs()} />
            </Form.Item>
            {/* <Form.Item
              name="calibrationFrequencyDays"
              label="Calibration Frequency"
              tooltip={{
                title: 'Calibration Frequency is the number of days between each calibration of the sensor.',
              }}
              rules={[{ required: true, type: 'number', min: 0, max: 90, message: 'Please enter a number between 0 and 90' }]}
            >
              <InputNumber min={0} max={90} className="w-full" />
            </Form.Item> */}

            <Form.Item name="remarks" label="Remarks">
              <TextArea placeholder="Enter any remarks" autoSize={{ minRows: 3, maxRows: 5 }} />
            </Form.Item>

            <Form.Item label={'Images'}>
              <ImageInput type="file" multiple onChange={handleFileChange} accept="image/png, image/jpeg" onClick={onInputClick} />
            </Form.Item>
            {previewImages?.length > 0 && (
              <Form.Item label={'Image Previews'}>
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
              <Button type="primary" className="w-full" onClick={handleSubmit}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div className="py-4">
            <Result
              status="success"
              title="Created new Sensor"
              subTitle={createdData && <>Sensor name: {createdData.name}</>}
              extra={[
                <Button key="back" onClick={() => navigate('/sensor')}>
                  Back to Sensor Management
                </Button>,
                <Button type="primary" key="view" onClick={() => navigate(`/sensor/${createdData?.id}`)}>
                  View new Sensor
                </Button>,
              ]}
            />
          </div>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default SensorCreate;
