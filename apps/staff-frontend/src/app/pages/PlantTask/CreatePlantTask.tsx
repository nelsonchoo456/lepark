import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ContentWrapperDark, useAuth, ImageInput } from '@lepark/common-ui';
import {
  createPlantTask,
  PlantTaskResponse,
  StaffResponse,
  PlantTaskTypeEnum,
  PlantTaskUrgencyEnum,
  ParkResponse,
  ZoneResponse,
  OccurrenceResponse,
  getAllParks,
  getZonesByParkId,
  getOccurrencesByParkId,
  StaffType,
  getParkById,
} from '@lepark/data-access';
import { Button, Card, Form, Result, message, Divider, Input, Select, DatePicker, Switch, Radio } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImages from '../../hooks/Images/useUploadImages';
import dayjs from 'dayjs';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const { TextArea } = Input;

const CreatePlantTask = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const [messageApi, contextHolder] = message.useMessage();
  const [createdPlantTask, setCreatedPlantTask] = useState<PlantTaskResponse | null>(null);
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();

  const [parks, setParks] = useState<ParkResponse[]>([]);
  const [zones, setZones] = useState<ZoneResponse[]>([]);
  const [occurrences, setOccurrences] = useState<OccurrenceResponse[]>([]);

  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

  const [isZoneDisabled, setIsZoneDisabled] = useState(true);
  const [isOccurrenceDisabled, setIsOccurrenceDisabled] = useState(true);

  const [showDueDate, setShowDueDate] = useState(false);

  const [feedbackFiles, setFeedbackFiles] = useState<File[]>([]);
  const [feedbackPreviews, setFeedbackPreviews] = useState<string[]>([]);

  const location = useLocation();
  const { title: feedbackTitle, description: feedbackDescription, images: feedbackImages, parkId: feedbackParkId } = location.state || {};

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
      fetchZones(user.parkId);
      setIsZoneDisabled(false);
    }

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

        setFeedbackFiles(fetchedFiles);
        setFeedbackPreviews(fetchedPreviews);
      };

      fetchImages();
    }
  }, [feedbackTitle, feedbackDescription, feedbackImages, feedbackParkId, form, user]);

  const allFiles = [...feedbackFiles, ...selectedFiles];
  const allPreviews = [...feedbackPreviews, ...previewImages];

  useEffect(() => {
    if (user?.role === StaffType.SUPERADMIN) {
      fetchParks();
    }
  }, [user]);

  const fetchParkDetails = async (parkId: number) => {
    try {
      const parkResponse = await getParkById(parkId);
      form.setFieldsValue({ parkId: parkId.toString() });
      setSelectedParkId(parkId);
      fetchZones(parkId);
      fetchOccurrences(parkId);
    } catch (error) {
      console.error('Error fetching park details:', error);
      messageApi.error('Failed to fetch park details');
    }
  };

  const fetchParks = async () => {
    try {
      const response = await getAllParks();
      setParks(response.data);
    } catch (error) {
      console.error('Error fetching parks:', error);
      messageApi.error('Failed to fetch parks');
    }
  };

  const fetchZones = async (parkId: number) => {
    try {
      const response = await getZonesByParkId(parkId);
      setZones(response.data);
      setIsZoneDisabled(false);
    } catch (error) {
      console.error('Error fetching zones:', error);
      messageApi.error('Failed to fetch zones');
    }
  };

  const fetchOccurrences = async (parkId: number) => {
    try {
      const response = await getOccurrencesByParkId(parkId);
      setOccurrences(response.data.filter((occurrence) => !selectedZoneId || occurrence.zoneId === selectedZoneId));
      setIsOccurrenceDisabled(false);
    } catch (error) {
      console.error('Error fetching occurrences:', error);
      messageApi.error('Failed to fetch occurrences');
    }
  };

  const taskTypeOptions = Object.values(PlantTaskTypeEnum).map((type) => ({
    value: type,
    label: formatEnumLabelToRemoveUnderscores(type),
  }));

  const taskUrgencyOptions = Object.values(PlantTaskUrgencyEnum).map((urgency) => ({
    value: urgency,
    label: formatEnumLabelToRemoveUnderscores(urgency),
  }));

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

      const { parkId, zoneId, hasDueDate, dueDate, ...plantTaskData } = values;
      const taskData = {
        ...plantTaskData,
        dueDate: hasDueDate ? dayjs(dueDate).toISOString() : null,
        submittingStaffId: user.id
      };
      console.log('plantTaskData', taskData);

      const taskResponse = await createPlantTask(taskData, user.id, allFiles);
      console.log('Plant Task created:', taskResponse.data);
      setCreatedPlantTask(taskResponse.data);
    } catch (error) {
      console.error('Error creating Plant Task:', error);
      messageApi.error('Failed to create Plant Task. Please try again.');
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
      title: 'Plant Task Management',
      pathKey: '/plant-tasks',
      isMain: true,
    },
    {
      title: 'Create Plant Task',
      pathKey: '/plant-tasks/create',
      isCurrent: true,
    },
  ];

  const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  const handleParkChange = (value: string) => {
    const parkId = parseInt(value, 10);
    setSelectedParkId(parkId);
    form.setFieldsValue({ zoneId: null, occurrenceId: null });
    setZones([]);
    setOccurrences([]);
    fetchZones(parkId);
    setIsOccurrenceDisabled(true);
  };

  const handleZoneChange = (value: string) => {
    const zoneId = parseInt(value, 10);
    setSelectedZoneId(zoneId);
    form.setFieldsValue({ occurrenceId: null });
    setOccurrences([]);
    fetchOccurrences(selectedParkId!);
  };

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
         {!createdPlantTask ? (
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
            <Form.Item name="zoneId" label="Zone" rules={[{ required: true }]}>
              <Select
                showSearch
                placeholder="Select a Zone"
                optionFilterProp="children"
                filterOption={filterOption}
                options={zones.map((zone) => ({ value: zone.id.toString(), label: zone.name }))}
                onChange={handleZoneChange}
                disabled={isZoneDisabled}
              />
            </Form.Item>
            <Form.Item name="occurrenceId" label="Occurrence" rules={[{ required: true }]}>
              <Select
                showSearch
                placeholder="Select an Occurrence"
                optionFilterProp="children"
                filterOption={filterOption}
                options={occurrences.map((occurrence) => ({ value: occurrence.id.toString(), label: occurrence.title }))}
                disabled={isOccurrenceDisabled}
              />
            </Form.Item>
             <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true }, { min: 3, message: 'Valid title must be at least 3 characters long' }, { max: 100, message: 'Valid title must be at most 100 characters long' }]}
              initialValue={feedbackTitle}
            >
              <Input placeholder="Give this Plant Task a title!" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true }]}
              initialValue={feedbackDescription}
            >
              <TextArea
                placeholder="Describe the Plant Task"
                autoSize={{ minRows: 3, maxRows: 5 }}
              />
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
                Create Plant Task
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Result
            status="success"
            title="Created new Plant Task"
            subTitle={<>Plant Task title: {createdPlantTask.title}</>}
            extra={[
              <Button key="back" onClick={() => navigate('/plant-tasks')}>
                Back to Plant Task Management
              </Button>
            ]}
          />
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default CreatePlantTask;
