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

// Add LocationState interface
interface LocationState {
  title?: string;
  description?: string;
  images?: string[];
  parkId?: number;
}

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
  const [feedbackPreviews, setFeedbackPreviews] = useState<string[]>([]);

  const location = useLocation();
  const feedbackData = location.state as LocationState;
  const { title: feedbackTitle, description: feedbackDescription, images: feedbackImages, parkId: feedbackParkId } = location.state || {};

  // Update urlToFile function
  const urlToFile = async (url: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              const filename = url.split('/').pop()?.split('?')[0] || 'image.jpg';
              const file = new File([blob], filename, { type: 'image/jpeg' });
              resolve(file);
            } else {
              reject(new Error('Failed to convert image to blob'));
            }
          }, 'image/jpeg');
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image from URL: ${url}`));
      };

      img.src = `${url}?t=${new Date().getTime()}`;
    });
  };

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
      setSelectedParkId(user.parkId);
    }

    if (feedbackImages && feedbackImages.length > 0) {
      setFeedbackPreviews(feedbackImages);
    }
  }, [feedbackTitle, feedbackDescription, feedbackImages, feedbackParkId, form, user]);

  // Add allPreviews constant
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

  const fetchOccurrences = async (parkId: number, zoneId: number) => {
    try {
      const response = await getOccurrencesByParkId(parkId);
      const filteredOccurrences = response.data.filter(
        (occurrence) => occurrence.zoneId === zoneId
      );
      setOccurrences(filteredOccurrences);
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

  // Update handleSubmit with better error handling
  const handleSubmit = async (values: any) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (feedbackPreviews.length === 0 && selectedFiles.length === 0) {
        messageApi.error('Please upload at least one image');
        return;
      }

      const feedbackFiles = await Promise.all(
        feedbackPreviews.map(async (url) => {
          try {
            return await urlToFile(url);
          } catch (error) {
            console.error(`Failed to convert image URL to file: ${url}`, error);
            messageApi.error(`Failed to process one of the images. Please try removing and re-adding it.`);
            throw error;
          }
        })
      );

      const allFiles = [...feedbackFiles, ...selectedFiles];

      const taskData = {
        title: values.title,
        description: values.description,
        taskType: values.taskType,
        taskUrgency: values.taskUrgency,
        taskStatus: 'OPEN' as const,
        dueDate: values.dueDate?.toDate() || null,
        occurrenceId: values.occurrenceId.toString(),
        submittingStaffId: user.id,
        position: 5001,
        images: []
      };

      const response = await createPlantTask(taskData, user.id, allFiles);
      setCreatedPlantTask(response.data);
      messageApi.success('Plant Task created successfully');
    } catch (error) {
      console.error('Error creating plant task:', error);
      messageApi.error('Failed to create plant task. Please try again.');
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

    if (selectedParkId && zoneId) {
      fetchOccurrences(selectedParkId, zoneId);
    }
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
