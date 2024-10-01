import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import { updateHubDetails, StaffResponse, StaffType, HubResponse, getFacilityById, FacilityResponse, HubUpdateData } from '@lepark/data-access';
import {
  Button,
  Card,
  Form,
  message,
  notification,
  Result,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Divider,
  FormInstance,
  Spin,
} from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import { useFetchFacilities } from '../../hooks/Facilities/useFetchFacilities';
import dayjs from 'dayjs';
import moment from 'moment';
import { useRestrictHub } from '../../hooks/Hubs/useRestrictHubs';
import { FacilityStatusEnum, FacilityTypeEnum } from '@prisma/client';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

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
  const [parkFacilities, setParkFacilities] = useState<FacilityResponse[]>([]);

  useEffect(() => {
    // to populate edit fields with existing data
    if (hub) {
      const acquisitionDate = dayjs(hub.acquisitionDate);
      const nextMaintenanceDate = dayjs(hub.nextMaintenanceDate);
      const finalData = { ...hub, acquisitionDate, nextMaintenanceDate };

      setCurrentImages(hub.images || []);

      form.setFieldsValue(finalData);

      // Fetch facility details to get parkId and filter facilities
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
    if (!hub) return;
    try {
      const values = await form.validateFields();

      const changedData: Partial<HubUpdateData> = Object.keys(values).reduce((acc, key) => {
        const typedKey = key as keyof HubUpdateData;
        if (JSON.stringify(values[typedKey]) !== JSON.stringify(hub?.[typedKey])) {
          acc[typedKey] = values[typedKey];
        }
        return acc;
      }, {} as Partial<HubUpdateData>);

      if (changedData.acquisitionDate) {
        changedData.acquisitionDate = dayjs(changedData.acquisitionDate).toISOString();
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
        // Add a 1-second delay before navigating
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
      label: formatEnumLabelToRemoveUnderscores('ACTIVE'),
    },
    {
      value: 'INACTIVE',
      label: formatEnumLabelToRemoveUnderscores('INACTIVE'),
    },
    {
      value: 'UNDER_MAINTENANCE',
      label: formatEnumLabelToRemoveUnderscores('UNDER_MAINTENANCE'),
    },
    {
      value: 'DECOMMISSIONED',
      label: formatEnumLabelToRemoveUnderscores('DECOMMISSIONED'),
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

          <Divider orientation="left">Hub Details</Divider>

          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter Hub Name' }]}>
            <Input placeholder="Enter Name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea placeholder="Enter Description" autoSize={{ minRows: 3, maxRows: 5 }} />
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
          <Form.Item name="supplier" label="Supplier" rules={[{ required: true, message: 'Please enter Supplier' }]}>
            <Input placeholder="Enter Supplier" />
          </Form.Item>
          <Form.Item
            name="supplierContactNumber"
            label="Supplier Contact Number"
            rules={[{ required: true, message: 'Please enter Supplier Contact Number' }]}
          >
            <Input placeholder="Enter Supplier Contact Number" />
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

export default HubEdit;
