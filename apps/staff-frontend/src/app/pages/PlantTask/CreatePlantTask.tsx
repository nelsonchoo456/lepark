import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    if (user?.role === StaffType.SUPERADMIN) {
      fetchParks();
    } else if (user?.parkId) {
      fetchZones(user.parkId);
      setIsZoneDisabled(false); // Enable Zone field for other staff roles
    }
  }, [user]);

  useEffect(() => {
    if (selectedParkId) {
      fetchZones(selectedParkId);
    }
  }, [selectedParkId]);

  useEffect(() => {
    if (user?.role === StaffType.SUPERADMIN && selectedParkId) {
      fetchOccurrences(selectedParkId);
    } else if (user?.parkId) {
      fetchOccurrences(user.parkId);
    }
  }, [selectedParkId, selectedZoneId]);

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
    } catch (error) {
      console.error('Error fetching zones:', error);
      messageApi.error('Failed to fetch zones');
    }
  };

  const fetchOccurrences = async (parkId: number) => {
    try {
      console.log('fetchOccurrences', parkId, selectedZoneId);
      const response = await getOccurrencesByParkId(parkId);
      setOccurrences(response.data.filter((occurrence) => !selectedZoneId || occurrence.zoneId === selectedZoneId));
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

      if (selectedFiles.length === 0) {
        messageApi.error('Please upload at least one image.');
        return;
      }

      if (selectedFiles.length > 3) {
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

      const taskResponse = await createPlantTask(taskData, user.id, selectedFiles);
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

  // Add this function to filter options
  const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  const handleParkChange = (value: string) => {
    const parkId = parseInt(value, 10);
    setSelectedParkId(parkId);
    form.setFieldsValue({ zoneId: null, occurrenceId: null });
    setZones([]);
    setOccurrences([]);
    setIsZoneDisabled(false); // Enable Zone field
    setIsOccurrenceDisabled(true); // Disable Occurrence field
  };

  const handleZoneChange = (value: string) => {
    const zoneId = parseInt(value, 10);
    setSelectedZoneId(zoneId);
    form.setFieldsValue({ occurrenceId: null });
    setOccurrences([]);
    setIsOccurrenceDisabled(false); // Enable Occurrence field
  };

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {!createdPlantTask ? (
          <Form form={form} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8" onFinish={handleSubmit}>
            <Divider orientation="left">Plant Task Details</Divider>
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
            <Form.Item name="zoneId" label="Zone" rules={[{ required: true }]}>
              <Select
                showSearch
                placeholder="Select a Zone"
                optionFilterProp="children"
                filterOption={filterOption}
                options={zones.map((zone) => ({ value: zone.id.toString(), label: zone.name }))}
                onChange={handleZoneChange}
                disabled={isZoneDisabled && user?.role === StaffType.SUPERADMIN} // Disable Zone field initially only for SUPERADMIN
              />
            </Form.Item>
            <Form.Item name="occurrenceId" label="Occurrence" rules={[{ required: true }]}>
              <Select
                showSearch
                placeholder="Select an Occurrence"
                optionFilterProp="children"
                filterOption={filterOption}
                options={occurrences.map((occurrence) => ({ value: occurrence.id.toString(), label: occurrence.title }))}
                disabled={isOccurrenceDisabled} // Disable Occurrence field initially
              />
            </Form.Item>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true }, { min: 3, message: 'Valid title must be at least 3 characters long' }, { max: 100, message: 'Valid title must be at most 100 characters long' }]}
            >
              <Input placeholder="Give this Plant Task a title!" />
            </Form.Item>
            <Form.Item name="description" label="Description" rules={[{ required: true }]}>
              <TextArea placeholder="Describe the Plant Task" autoSize={{ minRows: 3, maxRows: 5 }} />
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
                disabled={selectedFiles.length >= 3}
              />
            </Form.Item>
            {previewImages?.length > 0 && (
              <Form.Item label="Image Previews" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
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
            {selectedFiles.length >= 3 && (
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
