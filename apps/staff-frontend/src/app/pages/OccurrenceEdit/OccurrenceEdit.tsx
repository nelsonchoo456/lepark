import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import {
  OccurrenceResponse,
  StaffResponse,
  StaffType,
  updateOccurrenceDetails,
} from '@lepark/data-access';
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Typography,
  TimePicker,
  Select,
  DatePicker,
  InputNumber,
  notification,
  FormInstance,
} from 'antd';
import moment from 'moment';
import { LatLng } from 'leaflet';
import dayjs from 'dayjs';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useRestrictOccurrence } from '../../hooks/Occurrences/useRestrictOccurrence';

const center = {
  lat: 1.3503881629328163,
  lng: 103.85132690751749,
};
const { TextArea } = Input;

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const daysOfTheWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const attributes = ['name', 'description', 'address', 'contactNumber', 'openingHours', 'closingHours'];

const OccurrenceEdit = () => {
  const { user, updateUser } = useAuth<StaffResponse>();
  const { occurrenceId } = useParams();
  const { occurrence, species, loading } = useRestrictOccurrence(occurrenceId);
  const [form] = Form.useForm();
  const [createdData, setCreatedData] = useState<OccurrenceResponse>();
  // const [occurrence, setOccurrence] = useState<OccurrenceResponse>();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { selectedFiles, previewImages, setPreviewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const notificationShown = useRef(false);

  useEffect(() => {
    if (
      user?.role !== StaffType.SUPERADMIN &&
      user?.role !== StaffType.MANAGER &&
      user?.role !== StaffType.BOTANIST &&
      user?.role !== StaffType.ARBORIST
    ) {
      if (!notificationShown.current) {
        notification.error({
          message: 'Access Denied',
          description: 'You are not allowed to access the Occurrence Creation page!',
        });
        notificationShown.current = true;
      }
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (occurrence) {
      const dateOfBirth = dayjs(occurrence.dateOfBirth);
      const dateObserved = dayjs(occurrence.dateObserved);
      const finalData = { ...occurrence, dateObserved, dateOfBirth };

      setCurrentImages(occurrence.images);

      form.setFieldsValue(finalData);
    }
  }, [occurrence]);

  // Map Values
  const [polygon, setPolygon] = useState<LatLng[][]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [lat, setLat] = useState(center.lat);
  const [lng, setLng] = useState(center.lng);

  const parkStatusOptions = [
    {
      value: 'OPEN',
      label: 'Open',
    },
    {
      value: 'UNDER_CONSTRUCTION',
      label: 'Under Construction',
    },
    {
      value: 'LIMITED_ACCESS',
      label: 'Limited Access',
    },
  ];

  const handleSubmit = async () => {
    if (!occurrence) return;
    try {
      const formValues = await form.validateFields();
      console.log(formValues);

      const changedData: Partial<OccurrenceResponse> = Object.keys(formValues).reduce((acc, key) => {
        const typedKey = key as keyof OccurrenceResponse; // Cast key to the correct type
        if (JSON.stringify(formValues[typedKey]) !== JSON.stringify(occurrence?.[typedKey])) {
          acc[typedKey] = formValues[typedKey];
        }
        return acc;
      }, {} as Partial<OccurrenceResponse>);

      if (changedData.dateObserved) {
        changedData.dateObserved = dayjs(changedData.dateObserved).toISOString();
      }
      if (changedData.dateOfBirth) {
        changedData.dateOfBirth = dayjs(changedData.dateOfBirth).toISOString();
      }

      changedData.images = currentImages;
      const occurrenceRes = await updateOccurrenceDetails(occurrence.id, changedData, selectedFiles);
      setPreviewImages([]);
      if (occurrenceRes.status === 200) {
        setCreatedData(occurrenceRes.data);
        messageApi.open({
          type: 'success',
          content: 'Saved changes to Occurrence. Redirecting to Occurrence details page...',
        });
        // Add a 3-second delay before navigating
        setTimeout(() => {
          navigate(`/occurrences/${occurrence.id}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating Occurrence', error);
      messageApi.open({
        type: 'error',
        content: 'Unable to update Occurrence. Please try again later.',
      });
    }
  };

  const handleCurrentImageClick = (index: number) => {
    setCurrentImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const speciesOptions = [
    {
      value: 'genus',
      title: 'keke',
      children: [
        {
          value: 'orchid',
          title: 'Orchid',
        },
      ],
    },
  ];

  const decarbonizationTypeOptions = [
    {
      value: 'TREE_TROPICAL',
      label: 'Tree Tropical',
    },
    {
      value: 'TREE_MANGROVE',
      label: 'Tree Mangronve',
    },
    {
      value: 'SHRUB',
      label: 'Shrub',
    },
  ];

  const occurrenceStatusOptions = [
    {
      value: 'HEALTHY',
      label: 'Healthy',
    },
    {
      value: 'MONITOR_AFTER_TREATMENT',
      label: 'Monitor After Treatment',
    },
    {
      value: 'NEEDS_ATTENTION',
      label: 'Needs Attention',
    },
    {
      value: 'URGENT_ACTION_REQUIRED',
      label: 'Urgent Action Required',
    },
    {
      value: 'REMOVED',
      label: 'Removed',
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Occurrence Management',
      pathKey: '/occurrences',
      isMain: true,
    },
    {
      title: occurrence?.title ? occurrence?.title : 'Details',
      pathKey: `/occurrences/${occurrence?.id}`,
    },
    {
      title: 'Edit',
      pathKey: `/occurrences/${occurrence?.id}/edit`,
      isCurrent: true,
    },
  ];

  if (
    user?.role !== StaffType.SUPERADMIN &&
    user?.role !== StaffType.MANAGER &&
    user?.role !== StaffType.BOTANIST &&
    user?.role !== StaffType.ARBORIST
  ) {
    return <></>;
  }

  const validateDates = (form: FormInstance) => ({
    validator(_: any, value: moment.Moment) {
      const dateOfBirth = form.getFieldValue('dateOfBirth') as moment.Moment;
  
      if (!value) {
        // return Promise.reject(new Error('This field is required'));
      }
  
      if (value.isAfter(moment(), 'day')) {
        return Promise.reject(new Error('Date cannot be beyond today'));
      }
  
      if (dateOfBirth && value.isBefore(dateOfBirth, 'day')) {
        return Promise.reject(new Error('Date Observed cannot be earlier than Date of Birth'));
      }
  
      return Promise.resolve();
    }
  });

  const validateDateOfBirth = {
    validator(_: any, value: moment.Moment) {
      if (value.isAfter(moment(), 'day')) {
        return Promise.reject(new Error('Date of Birth cannot be beyond today'));
      }
  
      return Promise.resolve();
    }
  };
  
  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Form
          form={form}
          // style={{ maxWidth: 50 }}
          labelCol={{ span: 8 }}
          className="max-w-[600px] mx-auto mt-8"
          onFinish={handleSubmit}
        >
          {/* <Form.Item name="species" label="Species" rules={[{ required: true }]}>
        <TreeSelect placeholder="Select a Species" treeData={speciesOptions}/>
      </Form.Item> */}
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Give this Plant Occurrence a title!" />
          </Form.Item>
          <Form.Item name="dateObserved" label="Date Observed" rules={[{ required: true }, validateDates(form)]}>
            <DatePicker className="w-full" maxDate={dayjs()}/>
          </Form.Item>
          <Form.Item name="dateOfBirth" label="Date of Birth" rules={[validateDateOfBirth]}>
            <DatePicker className="w-full" maxDate={dayjs()}/>
          </Form.Item>
          <Form.Item name="numberOfPlants" label="Number of Plants" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" placeholder="Number of Plants" />
          </Form.Item>
          <Form.Item name="biomass" label="Biomass (in kg)" rules={[{ required: true }]}>
            <InputNumber min={0} placeholder="Biomass" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea
              // value={value}
              // onChange={(e) => setValue(e.target.value)}
              placeholder="Share details about this Plant Occurrence!"
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>
          <Form.Item name="occurrenceStatus" label="Occurrence Status" rules={[{ required: true }]}>
            <Select placeholder="Select a Status for the Occurrence" options={occurrenceStatusOptions} />
          </Form.Item>
          <Form.Item name="decarbonizationType" label="Decarbonization Type" rules={[{ required: true }]}>
            <Select placeholder="Select a Decarbonization Type" options={decarbonizationTypeOptions} />
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
            <Button type="primary" className="w-full" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </ContentWrapperDark>
  );
};

export default OccurrenceEdit;
