import React, { useState, useEffect, useCallback } from 'react';
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
  getParkById,
} from '@lepark/data-access';
import { Button, Card, Form, Result, message, Divider, Input, Select, DatePicker, Radio, Avatar, Space } from 'antd';
import { FaBuilding, FaTree, FaSatelliteDish, FaWifi, FaSearch } from 'react-icons/fa';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImages from '../../hooks/Images/useUploadImages';
import dayjs from 'dayjs';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const { TextArea } = Input;

const CreateMaintenanceTask: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
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

  const [feedbackFiles, setFeedbackFiles] = useState<File[]>([]);
  const [feedbackPreviews, setFeedbackPreviews] = useState<string[]>([]);

  const location = useLocation();
  const { title: feedbackTitle, description: feedbackDescription, images: feedbackImages, parkId: feedbackParkId } = location.state || {};

  const fetchParks = useCallback(async () => {
    try {
      const response = await getAllParks();
      setParks(response.data);
    } catch (error) {
      console.error('Error fetching parks:', error);
      messageApi.error('Failed to fetch parks');
    }
  }, [messageApi]);

  const fetchParkDetails = useCallback(async (parkId: number) => {
    try {
      const parkResponse = await getParkById(parkId);
      form.setFieldsValue({ parkId: parkId.toString() });
      setSelectedParkId(parkId);
      fetchFacilities(parkId);
    } catch (error) {
      console.error('Error fetching park details:', error);
      messageApi.error('Failed to fetch park details');
    }
  }, [form, messageApi]);

  const fetchFacilities = useCallback(async (parkId: number) => {
    try {
      const response = await getFacilitiesByParkId(parkId);
      setFacilities(response.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      messageApi.error('Failed to fetch facilities');
    }
  }, [messageApi]);

  useEffect(() => {
    if (user?.role === StaffType.SUPERADMIN) {
      fetchParks();
    }
  }, [user?.role, fetchParks]);

  useEffect(() => {
    if (feedbackTitle || feedbackDescription) {
      form.setFieldsValue({
        title: feedbackTitle,
        description: feedbackDescription
      });
    }

    if (user?.role === StaffType.SUPERADMIN && feedbackParkId) {
      fetchParkDetails(feedbackParkId);
    } else if (user?.parkId) {
      fetchFacilities(user.parkId);
    }
  }, [feedbackTitle, feedbackDescription, feedbackParkId, user?.role, user?.parkId, form, fetchParkDetails, fetchFacilities]);

   useEffect(() => {
    if (feedbackImages && feedbackImages.length > 0) {
      const fetchImages = async () => {
        const fetchedFiles: File[] = [];
        const fetchedPreviews: string[] = [];

        for (const imageUrl of feedbackImages) {
          try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const fileName = imageUrl.split('/').pop() || 'image.jpg';
            const file = new File([blob], fileName, { type: blob.type });
            fetchedFiles.push(file);
            fetchedPreviews.push(URL.createObjectURL(blob));
          } catch (error) {
            console.error('Error fetching image:', error);
          }
        }

        // Replace the existing feedback files and previews instead of appending
        setFeedbackFiles(fetchedFiles);
        setFeedbackPreviews(fetchedPreviews);
      };

      fetchImages();
    }
  }, [feedbackImages]);

  useEffect(() => {
    if (selectedParkId) {
      fetchFacilities(selectedParkId);
    }
  }, [selectedParkId, fetchFacilities]);

  const allFiles = React.useMemo(() => [...feedbackFiles, ...selectedFiles], [feedbackFiles, selectedFiles]);
  const allPreviews = React.useMemo(() => [...feedbackPreviews, ...previewImages], [feedbackPreviews, previewImages]);

  const fetchEntityDetails = useCallback(async (entityType: string, identifier: string) => {
    setIsSearching(true);
    try {
      let response;
      switch (entityType) {
        case 'parkAsset':
          response = await getParkAssetByIdentifierNumber(identifier);
          if (!response.data) {
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
          if (!response.data) {
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
          if (!response.data) {
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

      if (response.data) {
        setSelectedEntity(response.data);
        messageApi.success(`${convertCamelCaseToTitleCase(entityType)} found successfully`);
      } else {
        setSelectedEntity(null);
        messageApi.error(`No ${convertCamelCaseToTitleCase(entityType)} found with the given identifier`);
      }
    } catch (error) {
      console.error(`Error fetching ${entityType} details:`, error);
      setSelectedEntity(null);
      messageApi.error(`Failed to fetch ${entityType} details. Please try again.`);
    } finally {
      setIsSearching(false);
    }
  }, [messageApi]);

  const handleSubmit = async () => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const values = await form.validateFields();

      if (allFiles.length === 0) {
        messageApi.error('Please upload at least one image.');
        return;
      }

      if (allFiles.length > 3) {
        messageApi.error('You can upload a maximum of 3 images.');
        return;
      }

      const { parkId, hasDueDate, dueDate, entityType, entityId, ...maintenanceTaskData } = values;
      const taskData = {
        ...maintenanceTaskData,
        dueDate: hasDueDate ? dayjs(dueDate).toISOString() : null,
        submittingStaffId: user.id,
        facilityId: entityType === 'facility' ? selectedEntity?.id : null,
        parkAssetId: entityType === 'parkAsset' ? selectedEntity?.id : null,
        sensorId: entityType === 'sensor' ? selectedEntity?.id : null,
        hubId: entityType === 'hub' ? selectedEntity?.id : null,
      };

      console.log('Maintenance Task Data:', taskData);

      const taskResponse = await createMaintenanceTask(taskData, user.id, allFiles);
      console.log('Maintenance Task created:', taskResponse.data);
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
    form.setFieldsValue({ entityType: null, entityId: null });
    setSelectedEntityType(null);
    setSelectedEntity(null);
    fetchFacilities(parkId);
  };

  const handleEntityTypeChange = (value: string) => {
    setSelectedEntityType(value);
    form.setFieldsValue({ entityId: null });
    setSelectedEntity(null);
    setEntityIdInput('');
  };

  const handleEntityIdSearch = () => {
    if (selectedEntityType && entityIdInput) {
      fetchEntityDetails(selectedEntityType, entityIdInput);
    } else {
      messageApi.warning('Please select an entity type and enter an identifier number');
    }
  };

  const convertCamelCaseToTitleCase = (text: string) => {
    return text.replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, (char: string) => char.toUpperCase());
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

  const renderEntityCard = () => {
    if (!selectedEntity) return null;

    return (
      <Card size="small">
        <div className="flex items-center">
          <Avatar icon={getEntityIcon(selectedEntityType ?? '')} className="mr-2" />
          <div>
            <p className="font-semibold">
              {selectedEntity.name ||
               ('serialNumber' in selectedEntity ? selectedEntity.serialNumber : '') ||
               ('identifierNumber' in selectedEntity ? selectedEntity.identifierNumber : '')}
            </p>
            <p className="text-xs text-gray-500">{convertCamelCaseToTitleCase(selectedEntityType!)}</p>
          </div>
        </div>
      </Card>
    );
  };

  const taskTypeOptions = Object.values(MaintenanceTaskTypeEnum).map((type) => ({
    value: type,
    label: formatEnumLabelToRemoveUnderscores(type),
  }));

  const taskUrgencyOptions = Object.values(MaintenanceTaskUrgencyEnum).map((urgency) => ({
    value: urgency,
    label: formatEnumLabelToRemoveUnderscores(urgency),
  }));

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {!createdMaintenanceTask ? (
          <Form form={form} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8" onFinish={handleSubmit}>
            {user?.role === StaffType.SUPERADMIN && (
              <Form.Item name="parkId" label="Park" rules={[{ required: true }]}>
                <Select
                  showSearch
                  placeholder="Select a Park"
                  optionFilterProp="children"
                  filterOption={filterOption}
                  options={parks.map((park) => ({ value: park.id.toString(), label: park.name }))}
                  onChange={handleParkChange}
                  disabled={!!feedbackParkId}
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
            {selectedEntityType && selectedEntityType !== 'facility' ? (
              <Form.Item label="Entity Identifier">
                <Space>
                  <Input
                    placeholder="Enter identifier number"
                    value={entityIdInput}
                    onChange={(e) => setEntityIdInput(e.target.value)}
                    style={{ width: 200 }}
                  />
                  <Button icon={<FaSearch />} onClick={handleEntityIdSearch} loading={isSearching}>
                    Search
                  </Button>
                </Space>
              </Form.Item>
            ) : null}
            {selectedEntity && (
              <Form.Item label="Entity Details">
                {renderEntityCard()}
              </Form.Item>
            )}
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true }, { min: 3, message: 'Valid title must be at least 3 characters long' }, { max: 100, message: 'Valid title must be at most 100 characters long' }]}
              initialValue={feedbackTitle}
            >
              <Input placeholder="Give this Maintenance Task a title!" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true }]}
              initialValue={feedbackDescription}
            >
              <TextArea placeholder="Describe the Maintenance Task" autoSize={{ minRows: 3, maxRows: 5 }} />
            </Form.Item>
            <Form.Item name="taskType" label="Task Type" rules={[{ required: true}]}>
              <Select placeholder="Select a Task Type" options={taskTypeOptions} />
            </Form.Item>
            <Form.Item name="taskUrgency" label="Task Urgency" rules={[{ required: true }]}>
              <Select placeholder="Select Task Urgency" options={taskUrgencyOptions} />
            </Form.Item>
            <Form.Item name="hasDueDate" label="Set Due Date" valuePropName="checked">
              <Radio.Group onChange={(e) => handleDueDateToggle(e.target.value)} optionType='button' defaultValue="no">
                <Radio value="yes">Yes</Radio>
                <Radio value="no">No</Radio>
              </Radio.Group>
            </Form.Item>
            {showDueDate && (
              <Form.Item
                name="dueDate"
                label="Due Date"
                rules={[{ required: true, message: 'Please select a due date' }]}
              >
                <DatePicker
                  className="w-full"
                  disabledDate={(current) => current && current < dayjs().endOf('day')}
                />
              </Form.Item>
            )}
            <Form.Item label="Upload Images" required tooltip="At least 1 image is required, maximum 3 images">
              <ImageInput
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/png, image/jpeg"
                onClick={onInputClick}
                disabled={allFiles.length >= 3}
              />
            </Form.Item>
            {allPreviews.length > 0 && (
              <Form.Item label="Image Previews" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                <div className="flex flex-wrap gap-2">
                  {allPreviews.map((imgSrc, index) => (
                    <img
                      key={index}
                      src={imgSrc}
                      alt={`Preview ${index}`}
                      className="w-20 h-20 object-cover rounded border-[1px] border-green-100"
                      onClick={() => {
                        if (index < feedbackPreviews.length) {
                          // Remove feedback image
                          setFeedbackFiles(prev => prev.filter((_, i) => i !== index));
                          setFeedbackPreviews(prev => prev.filter((_, i) => i !== index));
                        } else {
                          // Remove uploaded image
                          removeImage(index - feedbackPreviews.length);
                        }
                      }}
                    />
                  ))}
                </div>
              </Form.Item>
            )}
            {allFiles.length >= 3 && (
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
              </Button>
            ]}
          />
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default CreateMaintenanceTask;
