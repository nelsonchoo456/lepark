import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import { updateHubDetails, StaffResponse, StaffType, HubResponse, getFacilityById } from '@lepark/data-access';
import { Button, Card, Form, message, notification, Result, Input, Select, DatePicker, InputNumber, Divider, FormInstance } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import { useFetchFacilities } from '../../hooks/Facilities/useFetchFacilities';
import dayjs from 'dayjs';
import moment from 'moment';
import { useRestrictHub } from '../../hooks/Hubs/useRestrictHubs';

const center = {
  lat: 1.3503881629328163,
  lng: 103.85132690751749,
};
const { TextArea } = Input;

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const HubEdit = () => {
  const { user } = useAuth<StaffResponse>();
  const { hubId } = useParams();
  const { hub, loading } = useRestrictHub(hubId); // Custom hook to fetch hub details
  const [form] = Form.useForm();
  const [createdData, setCreatedData] = useState<HubResponse>();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { selectedFiles, previewImages, setPreviewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const notificationShown = useRef(false);
  const { parks } = useFetchParks();
  const { facilities } = useFetchFacilities();
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);

  useEffect(() => {
    if (hub) {
      const acquisitionDate = dayjs(hub.acquisitionDate);
      const nextMaintenanceDate = dayjs(hub.nextMaintenanceDate);
      const finalData = { ...hub, acquisitionDate, nextMaintenanceDate };

      setCurrentImages(hub.images || []);

      form.setFieldsValue(finalData);

      // Fetch facility details to get parkId
      if (hub.facilityId) {
        fetchFacilityDetails(hub.facilityId);
      }
    }
  }, [hub]);

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

  const handleSubmit = async () => {
    if (!hub) return;
    try {
      const formValues = await form.validateFields();

      // Remove parkId from form values
      const { parkId, ...filteredValues } = formValues;

      const changedData: Partial<HubResponse> = Object.keys(filteredValues).reduce((acc, key) => {
        const typedKey = key as keyof HubResponse; // Cast key to the correct type
        if (JSON.stringify(filteredValues[typedKey]) !== JSON.stringify(hub?.[typedKey])) {
          acc[typedKey] = filteredValues[typedKey];
        }
        return acc;
      }, {} as Partial<HubResponse>);

      if (changedData.acquisitionDate) {
        changedData.acquisitionDate = dayjs(changedData.acquisitionDate).toISOString();
      }
      if (changedData.nextMaintenanceDate) {
        changedData.nextMaintenanceDate = dayjs(changedData.nextMaintenanceDate).toISOString();
      }

      changedData.images = currentImages;
      const hubRes = await updateHubDetails(hub.id, changedData, selectedFiles);
      setPreviewImages([]);
      if (hubRes.status === 200) {
        setCreatedData(hubRes.data);
        messageApi.open({
          type: 'success',
          content: 'Saved changes to Hub. Redirecting to Hub details page...',
        });
        // Add a 3-second delay before navigating
        setTimeout(() => {
          navigate(`/hubs/${hub.id}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating Hub', error);
      messageApi.open({
        type: 'error',
        content: 'Unable to update Hub. Please try again later.',
      });
    }
  };

  const handleCurrentImageClick = (index: number) => {
    setCurrentImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const hubStatusOptions = [
    {
      value: 'ACTIVE',
      label: 'Active',
    },
    {
      value: 'INACTIVE',
      label: 'Inactive',
    },
    {
      value: 'UNDER_MAINTENANCE',
      label: 'Under Maintenance',
    },
    {
      value: 'DECOMMISSIONED',
      label: 'Decommissioned',
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Hub Management',
      pathKey: '/hubs',
      isMain: true,
    },
    {
      title: hub?.serialNumber ? hub?.serialNumber : 'Details',
      pathKey: `/hubs/${hub?.id}`,
    },
    {
      title: 'Edit',
      pathKey: `/hubs/${hub?.id}/edit`,
      isCurrent: true,
    },
  ];

  const validateDates = (form: FormInstance) => ({
    validator(_: any, value: moment.Moment) {
      if (!value) {
        return Promise.reject(new Error('Please select a date'));
      }
      if (value.isAfter(moment(), 'day')) {
        return Promise.reject(new Error('Date cannot be in the future'));
      }
      return Promise.resolve();
    },
  });

  const validateFutureDate = (form: FormInstance) => ({
    validator(_: any, value: moment.Moment) {
      if (!value) {
        return Promise.reject(new Error('Please select a date'));
      }
      if (value.isBefore(moment(), 'day')) {
        return Promise.reject(new Error('Date cannot be in the past'));
      }
      return Promise.resolve();
    },
  });

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Form form={form} labelCol={{ span: 12 }} className="max-w-[600px] mx-auto mt-8">
          <Divider orientation="left">Hub Details</Divider>

          {user?.role === StaffType.SUPERADMIN && (
            <Form.Item name="parkId" label="Park" rules={[{ required: true }]}>
              <Select
                placeholder="Select a Park"
                options={parks?.map((park) => ({ key: park.id, value: park.id, label: park.name }))}
                onChange={(value) => setSelectedParkId(value)}
              />
            </Form.Item>
          )}

          <Form.Item name="facilityId" label="Facility" rules={[{ required: true }]}>
            <Select
              placeholder="Select a Facility"
              options={facilities?.map((facility) => ({ key: facility.id, value: facility.id, label: facility.facilityName }))}
              disabled={user?.role === StaffType.SUPERADMIN && !selectedParkId}
            />
          </Form.Item>

          <Form.Item name="serialNumber" label="Serial Number" rules={[{ required: true, message: 'Please enter Serial Number' }]}>
            <Input placeholder="Enter Serial Number" />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter Hub Name' }]}>
            <Input placeholder="Enter Name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea placeholder="Enter Description" autoSize={{ minRows: 3, maxRows: 5 }} />
          </Form.Item>
          <Form.Item name="remarks" label="Remarks">
            <TextArea placeholder="Enter any remarks" autoSize={{ minRows: 3, maxRows: 5 }} />
          </Form.Item>
          <Form.Item name="hubStatus" label="Hub Status" rules={[{ required: true, message: 'Please select Hub Status' }]}>
            <Select placeholder="Select Hub Status" options={hubStatusOptions} />
          </Form.Item>
          <Form.Item
            name="acquisitionDate"
            label="Acquisition Date"
            rules={[{ required: true, message: 'Please enter Acquisition Date' }, validateDates(form)]}
          >
            <DatePicker className="w-full" maxDate={dayjs()} />
          </Form.Item>
          <Form.Item
            name="recommendedCalibrationFrequencyDays"
            label="Recommended Calibration Frequency (Days)"
            rules={[{ required: true, message: 'Please enter Calibration Frequency in Days' }]}
          >
            <InputNumber min={1} className="w-full" placeholder="Enter Calibration Frequency in Days" />
          </Form.Item>
          <Form.Item
            name="recommendedMaintenanceDuration"
            label="Recommended Maintenance Duration (Days)"
            rules={[{ required: true, message: 'Please enter Maintenance Duration in Days' }]}
          >
            <InputNumber min={1} className="w-full" placeholder="Enter Maintenance Duration in Days" />
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
          <Form.Item wrapperCol={{ offset: 8 }}>
            <Button type="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </ContentWrapperDark>
  );
};

export default HubEdit;
