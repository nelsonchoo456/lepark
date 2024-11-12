import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ContentWrapperDark, useAuth, ImageInput } from '@lepark/common-ui';
import {
  createMaintenanceTask,
  MaintenanceTaskResponse,
  StaffResponse,
  MaintenanceTaskTypeEnum,
  MaintenanceTaskUrgencyEnum,
  ParkResponse,
  ZoneResponse,
  OccurrenceResponse,
  getAllParks,
  getZonesByParkId,
  getOccurrencesByParkId,
  StaffType,
  getFacilitiesByParkId,
  FacilityResponse,
  getParkAssetBySerialNumber,
  ParkAssetResponse,
  getSensorById,
  SensorResponse,
  getHubById,
  HubResponse,
  getSensorByIdentifierNumber,
  getParkAssetByIdentifierNumber,
  getHubByIdentifierNumber,
  getFacilityById,
} from '@lepark/data-access';
import { Button, Card, Form, Result, message, Divider, Input, Select, DatePicker, Radio, Avatar, Space } from 'antd';
import { FaBuilding, FaTree, FaSatelliteDish, FaWifi, FaSearch } from 'react-icons/fa';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImages from '../../hooks/Images/useUploadImages';
import dayjs from 'dayjs';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const { TextArea } = Input;

interface LocationState {
  title?: string;
  description?: string;
  images?: string[];
  parkId?: number;
}

const CreateMaintenanceTask = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth<StaffResponse>();
  const [messageApi, contextHolder] = message.useMessage();
  const [createdMaintenanceTask, setCreatedMaintenanceTask] = useState<MaintenanceTaskResponse | null>(null);
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();


  const [parks, setParks] = useState<ParkResponse[]>([]);
  const [zones, setZones] = useState<ZoneResponse[]>([]);
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);

  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<FacilityResponse | ParkAssetResponse | SensorResponse | HubResponse | null>(null);

  const [showDueDate, setShowDueDate] = useState(false);
  const [entityIdInput, setEntityIdInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);


  const feedbackData = location.state as LocationState;

  const [feedbackPreviews, setFeedbackPreviews] = useState<string[]>([]);
const { title: feedbackTitle, description: feedbackDescription, images: feedbackImages, parkId: feedbackParkId } = location.state || {};

const urlToFile = async (url: string): Promise<File> => {
  try {
    // Add no-cors mode to the fetch request
    const response = await fetch(url, {
      mode: 'no-cors'
    });

    // For S3 URLs, construct filename from the URL
    const filename = url.split('/').pop()?.split('?')[0] || 'image.jpg';

    // Since we can't directly access the blob with no-cors,
    // we'll create a new Image and convert it to a blob
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';  // Try to request with CORS
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], filename, { type: 'image/png' });
            resolve(file);
          } else {
            reject(new Error('Failed to convert image to blob'));
          }
        }, 'image/png');
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      // Add timestamp to bypass cache
      img.src = `${url}?t=${new Date().getTime()}`;
    });
  } catch (error) {
    console.error('Error converting URL to File:', error);
    throw error;
  }
};

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const entityId = queryParams.get('entityId');
    const dueDate = queryParams.get('dueDate');
    const entityType = queryParams.get('entityType');

    if (entityId && entityType) {
      fetchEntityDetails(entityType, entityId);
      setSelectedEntityType(entityType);
      form.setFieldsValue({ entityType, entityId }); // Ensure the form fields are set
      setEntityIdInput(entityId); // Set the identifier input field
    }
    console.log('entityId:', entityId, 'entityType:', entityType, 'dueDate:', dueDate);

    if (dueDate) {
      setShowDueDate(true);
      form.setFieldsValue({ dueDate: dayjs(dueDate) });
    }
  }, [location.search]);



  useEffect(() => {
  if (feedbackTitle || feedbackDescription) {
    form.setFieldsValue({
      title: feedbackTitle,
      description: feedbackDescription
    });
  }

  if (user?.role === StaffType.SUPERADMIN && feedbackParkId) {
    form.setFieldsValue({ parkId: feedbackParkId.toString() });
    setSelectedParkId(feedbackParkId);
  }

  // Set feedback images for preview
  if (feedbackImages && feedbackImages.length > 0) {
    setFeedbackPreviews(feedbackImages);
  }
}, [feedbackTitle, feedbackDescription, feedbackImages, feedbackParkId, form, user]);


   useEffect(() => {
    if (feedbackData) {
      // Set form values from feedback
      form.setFieldsValue({
        title: feedbackData.title,
        description: feedbackData.description,
      });

      // Handle parkId if present
      if (feedbackData.parkId) {
        setSelectedParkId(feedbackData.parkId);
        form.setFieldsValue({ parkId: feedbackData.parkId.toString() });
      }

      // Set feedback images
      if (feedbackData.images && feedbackData.images.length > 0) {
        setFeedbackPreviews(feedbackData.images);
      }
    }
  }, [feedbackData, form]);


  useEffect(() => {
    if (user?.role === StaffType.SUPERADMIN) {
      fetchParks();
    } else if (user?.parkId) {
      fetchFacilities(user.parkId);
    }
  }, [user]);

  useEffect(() => {
    if (selectedParkId) {
      fetchFacilities(selectedParkId);
    }
  }, [selectedParkId]);

  const fetchParks = async () => {
    try {
      const response = await getAllParks();
      setParks(response.data);
    } catch (error) {
      console.error('Error fetching parks:', error);
      messageApi.error('Failed to fetch parks');
    }
  };

  const fetchFacilities = async (parkId: number) => {
    try {
      const response = await getFacilitiesByParkId(parkId);
      setFacilities(response.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      messageApi.error('Failed to fetch facilities');
    }
  };

  const fetchEntityDetails = async (entityType: string, identifier: string) => {
    setIsSearching(true);
    try {
      let response;
      switch (entityType) {
        case 'parkAsset':
          response = await getParkAssetByIdentifierNumber(identifier);
          if (!response.data || (response.data.facility?.parkId !== selectedParkId && response.data.facility?.parkId !== user?.parkId)) {
            setSelectedEntity(null);
            messageApi.error(`${convertCamelCaseToTitleCase(entityType)} not found`);
            return;
          } else if (response.data.facility?.parkId === selectedParkId || response.data.facility?.parkId === user?.parkId) {
            setSelectedEntity(response.data);
            messageApi.success(`${convertCamelCaseToTitleCase(entityType)} found successfully`);
          }
          break;
        case 'sensor':
          response = await getSensorByIdentifierNumber(identifier);
          if (!response.data || (response.data.facility?.parkId !== selectedParkId && response.data.facility?.parkId !== user?.parkId)) {
            setSelectedEntity(null);
            messageApi.error(`${convertCamelCaseToTitleCase(entityType)} not found`);
            return;
          } else if (response.data.facility?.parkId === selectedParkId || response.data.facility?.parkId === user?.parkId) {
            setSelectedEntity(response.data);
            messageApi.success(`${convertCamelCaseToTitleCase(entityType)} found successfully`);
          }
          break;
        case 'hub':
          response = await getHubByIdentifierNumber(identifier);

          if (!response.data || (response.data.facility?.parkId !== selectedParkId && response.data.facility?.parkId !== user?.parkId)) {
            setSelectedEntity(null);
            messageApi.error(`${convertCamelCaseToTitleCase(entityType)} not found`);
            return;
          } else if (response.data.facility?.parkId === selectedParkId || response.data.facility?.parkId === user?.parkId) {
            setSelectedEntity(response.data);
            messageApi.success(`${convertCamelCaseToTitleCase(entityType)} found successfully`);
          }
          break;
        default:
          throw new Error('Invalid entity type');
      }
    } catch (error) {
      console.error(`Error fetching ${entityType} details:`, error);
      setSelectedEntity(null);
      messageApi.error(`Failed to fetch ${entityType} details. Please try again.`);
    } finally {
      setIsSearching(false);
    }
  };

  const taskTypeOptions = Object.values(MaintenanceTaskTypeEnum).map((type) => ({
    value: type,
    label: formatEnumLabelToRemoveUnderscores(type),
  }));

  const taskUrgencyOptions = Object.values(MaintenanceTaskUrgencyEnum).map((urgency) => ({
    value: urgency,
    label: formatEnumLabelToRemoveUnderscores(urgency),
  }));

  const handleSubmit = async () => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const values = await form.validateFields();

      // Check if we have either feedback images or newly uploaded files
      if (feedbackPreviews.length === 0 && selectedFiles.length === 0) {
        messageApi.error('Please upload at least one image.');
        return;
      }

      const totalImages = feedbackPreviews.length + selectedFiles.length;
      if (totalImages > 3) {
        messageApi.error('You can upload a maximum of 3 images.');
        return;
      }

      // Convert feedback preview URLs to Files
      const feedbackFiles = await Promise.all(
        feedbackPreviews.map(url => urlToFile(url))
      );

      // Combine all files
      const allFiles = [...feedbackFiles, ...selectedFiles];

      const { parkId, hasDueDate, dueDate, entityType, entityId, ...maintenanceTaskData } = values;

      let formattedDueDate = null;
      if (dueDate) {
        formattedDueDate = dayjs(dueDate).toISOString();
      }

      const taskData = {
        ...maintenanceTaskData,
        dueDate: formattedDueDate,
        submittingStaffId: user.id,
        facilityId: entityType === 'facility' ? selectedEntity?.id : null,
        parkAssetId: entityType === 'parkAsset' ? selectedEntity?.id : null,
        sensorId: entityType === 'sensor' ? selectedEntity?.id : null,
        hubId: entityType === 'hub' ? selectedEntity?.id : null,
        images: [] // Add empty images array since actual images will be uploaded separately
      };

      const taskResponse = await createMaintenanceTask(taskData, user.id, allFiles);
      setCreatedMaintenanceTask(taskResponse.data);
    } catch (error) {
      console.error('Error creating Maintenance Task:', error);
      messageApi.error('Failed to create Maintenance Task. Please try again.');
    }
  };
  const handleDueDateToggle = (value: string) => {
    const checked = value === 'yes';
    setShowDueDate(checked);
    if (!checked) {
      form.setFieldsValue({ dueDate: null });
    }
  };

  const breadcrumbItems = [
    {
      title: 'Maintenance Task Management',
      pathKey: '/maintenance-tasks',
      isMain: true,
    },
    {
      title: 'Create Maintenance Task',
      pathKey: '/maintenance-tasks/create',
      isCurrent: true,
    },
  ];

  const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  const handleParkChange = (value: string) => {
    const parkId = parseInt(value, 10);
    setSelectedParkId(parkId);
    form.setFieldsValue({ zoneId: null, occurrenceId: null, entityType: null, entityId: null });
    setZones([]);
    setSelectedEntityType(null);
    setSelectedEntity(null);
  };

  const handleEntityTypeChange = (value: string) => {
    setSelectedEntityType(value);
    form.setFieldsValue({ entityId: null });
    setSelectedEntity(null);
    setEntityIdInput(''); // Clear the identifier input field
  };

  const handleEntityIdSearch = () => {
    if (selectedEntityType && entityIdInput) {
      fetchEntityDetails(selectedEntityType, entityIdInput);
    } else {
      messageApi.warning('Please select an entity type and enter an identifier number');
    }
  };

  const convertCamelCaseToTitleCase = (text: string) => {
    return text
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Adds space before uppercase letters
      .replace(/^./, (char: string) => char.toUpperCase()); // Capitalize the first letter
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'facility':
        return <FaBuilding />;
      case 'parkAsset':
        return <FaTree />;
      case 'sensor':
        return <FaSatelliteDish />;
      case 'hub':
        return <FaWifi />;
      default:
        return null;
    }
  };

  const allPreviews = [...feedbackPreviews, ...previewImages];

  const renderEntityCard = () => {
    if (!selectedEntity) return null;

    let entityType = selectedEntityType || '';
    const icon = getEntityIcon(entityType);

    const getEntityType = () => {
      if ('facilityType' in selectedEntity) return formatEnumLabelToRemoveUnderscores(selectedEntity.facilityType);
      if ('parkAssetType' in selectedEntity) return formatEnumLabelToRemoveUnderscores(selectedEntity.parkAssetType);
      if ('sensorType' in selectedEntity) return formatEnumLabelToRemoveUnderscores(selectedEntity.sensorType);
      return null; // For hub, we don't show the type
    };

    const getEntityLocation = () => {
      if (!selectedEntity) return null;

      if ('facilityType' in selectedEntity) return null; // For facility, we don't show the location
      if ('parkAssetType' in selectedEntity) return selectedEntity.facility?.name || 'Unknown';
      if ('sensorType' in selectedEntity) return selectedEntity.facility?.name || 'Unknown';
      if ('hubStatus' in selectedEntity) return selectedEntity.facility?.name || 'Unknown';

      return 'Unknown';
    };

    const location = getEntityLocation();
    entityType = getEntityType() || '';

    const getEntityImage = () => {
      if (selectedEntity.images && selectedEntity.images.length > 0) {
        return selectedEntity.images[0];
      }
      return null;
    };

    const entityImage = getEntityImage();

    return (
      <Card className="mb-4">
        <Card.Meta
          avatar={entityImage ? <Avatar src={entityImage} size={64} /> : <Avatar icon={icon} size={64} />}
          title={selectedEntity.name || `${entityType || 'Entity'} ${selectedEntity.id}`}
          description={
            <div>
              {entityType && (
                <p>
                  <strong>Type:</strong> {entityType}
                </p>
              )}
              {location && (
                <p>
                  <strong>Location:</strong> {location}
                </p>
              )}
            </div>
          }
        />
      </Card>
    );
  };

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {!createdMaintenanceTask ? (
          <Form form={form} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8" onFinish={handleSubmit}>
            <Divider orientation="left">Maintenance Task Details</Divider>
            {user?.role === StaffType.SUPERADMIN && (
              <Form.Item name="parkId" label="Park" rules={[{ required: true }]}>
                <Select
                  showSearch
                  placeholder="Select a Park"
                  optionFilterProp="children"
                  filterOption={filterOption}
                  options={parks.map((park) => ({ value: park.id.toString(), label: park.name }))}
                  onChange={handleParkChange}
                />
              </Form.Item>
            )}
            <Form.Item name="entityType" label="Faulty Entity Type" rules={[{ required: true }]}>
              <Select
                placeholder="Select Entity Type"
                onChange={handleEntityTypeChange}
                options={[
                  { value: 'facility', label: 'Facility' },
                  { value: 'parkAsset', label: 'Park Asset' },
                  { value: 'sensor', label: 'Sensor' },
                  { value: 'hub', label: 'Hub' },
                ]}
              />
            </Form.Item>
            {selectedEntityType === 'facility' ? (
              <Form.Item name="entityId" label="Facility" rules={[{ required: true }]}>
                <Select
                  showSearch
                  placeholder="Select a Facility"
                  optionFilterProp="children"
                  filterOption={filterOption}
                  options={facilities.map((facility) => ({ value: facility.id.toString(), label: facility.name }))}
                  onChange={(value) => setSelectedEntity(facilities.find((f) => f.id.toString() === value) || null)}
                />
              </Form.Item>
            ) : selectedEntityType ? (
              <Form.Item
                name="entityId"
                label={`${convertCamelCaseToTitleCase(selectedEntityType)} Identifier Number`}
                rules={[{ required: true }]}
              >
                <Space>
                  <Input
                    placeholder={`Enter Identifier Number of ${convertCamelCaseToTitleCase(selectedEntityType)}`}
                    value={entityIdInput}
                    onChange={(e) => setEntityIdInput(e.target.value)}
                    style={{ width: '300px' }}
                  />
                  <Button icon={<FaSearch />} onClick={handleEntityIdSearch} type="primary" loading={isSearching}>
                    Search
                  </Button>
                </Space>
              </Form.Item>
            ) : null}
            {selectedEntity && <Form.Item label="Entity Details">{renderEntityCard()}</Form.Item>}
            <Form.Item
              name="title"
              label="Title"
              rules={[
                { required: true },
                { min: 3, message: 'Valid title must be at least 3 characters long' },
                { max: 100, message: 'Valid title must be at most 100 characters long' },
              ]}
            >
              <Input placeholder="Give this Maintenance Task a title!" />
            </Form.Item>
            <Form.Item name="description" label="Description" rules={[{ required: true }]}>
              <TextArea placeholder="Describe the Maintenance Task" autoSize={{ minRows: 3, maxRows: 5 }} />
            </Form.Item>
            <Form.Item name="taskType" label="Task Type" rules={[{ required: true }]}>
              <Select placeholder="Select a Task Type" options={taskTypeOptions} />
            </Form.Item>
            <Form.Item name="taskUrgency" label="Task Urgency" rules={[{ required: true }]}>
              <Select placeholder="Select Task Urgency" options={taskUrgencyOptions} />
            </Form.Item>
            <Form.Item name="hasDueDate" label="Set Due Date" valuePropName="checked">
              <Radio.Group onChange={(e) => handleDueDateToggle(e.target.value)} optionType="button" value={showDueDate ? 'yes' : 'no'}>
                <Radio value="yes">Yes</Radio>
                <Radio value="no">No</Radio>
              </Radio.Group>
            </Form.Item>
            {showDueDate && (
              <Form.Item name="dueDate" label="Due Date" rules={[{ required: true, message: 'Please select a due date' }]}>
                <DatePicker className="w-full" disabledDate={(current) => current && current < dayjs().endOf('day')} />
              </Form.Item>
            )}
            <Form.Item label="Upload Images" required tooltip="At least 1 image is required, maximum 3 images">
  <ImageInput
    type="file"
    multiple
    onChange={handleFileChange}
    accept="image/png, image/jpeg"
    onClick={onInputClick}
    disabled={allPreviews.length >= 3}
  />
</Form.Item>
{(feedbackPreviews.length > 0 || previewImages.length > 0) && (
  <Form.Item label="Image Previews" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
    <div className="flex flex-wrap gap-2">
      {feedbackPreviews.map((imgSrc, index) => (
        <div key={`feedback-${index}`} className="relative group">
          <img
            src={imgSrc}
            alt={`Feedback Preview ${index}`}
            className="w-20 h-20 object-cover rounded border-[1px] border-green-100"
          />
          <div
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => {
              setFeedbackPreviews(prev => prev.filter((_, i) => i !== index));
            }}
          >
            <span className="text-white">Remove</span>
          </div>
        </div>
      ))}
      {previewImages.map((imgSrc, index) => (
        <div key={`upload-${index}`} className="relative group">
          <img
            src={imgSrc}
            alt={`Upload Preview ${index}`}
            className="w-20 h-20 object-cover rounded border-[1px] border-green-100"
          />
          <div
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => removeImage(index)}
          >
            <span className="text-white">Remove</span>
          </div>
        </div>
      ))}
    </div>
  </Form.Item>
)}
{allPreviews.length >= 3 && (
  <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
    <p className="text-yellow-500">Maximum number of images (3) reached.</p>
  </Form.Item>
)}

            <Form.Item wrapperCol={{ offset: 8 }}>
              <Button type="primary" htmlType="submit" className="w-full">
                Create Maintenance Task
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Result
            status="success"
            title="Created new Maintenance Task"
            subTitle={<>Maintenance Task title: {createdMaintenanceTask.title}</>}
            extra={[
              <Button key="back" onClick={() => navigate('/maintenance-tasks')}>
                Back to Maintenance Task Management
              </Button>,
            ]}
          />
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default CreateMaintenanceTask;
