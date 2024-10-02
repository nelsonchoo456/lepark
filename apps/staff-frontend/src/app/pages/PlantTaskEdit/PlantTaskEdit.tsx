import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, useAuth, ImageInput } from '@lepark/common-ui';
import {
  PlantTaskResponse,
  StaffResponse,
  StaffType,
  updatePlantTaskDetails,
  getPlantTaskById,
  PlantTaskTypeEnum,
  PlantTaskUrgencyEnum,
  ZoneResponse,
} from '@lepark/data-access';
import { Button, Card, Form, Input, message, Select, DatePicker, Divider } from 'antd';
import dayjs from 'dayjs';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImages from '../../hooks/Images/useUploadImages';

const { TextArea } = Input;

const PlantTaskEdit = () => {
  const { user } = useAuth<StaffResponse>();
  const { plantTaskId } = useParams();
  const [form] = Form.useForm();
  const [plantTask, setPlantTask] = useState<PlantTaskResponse>();
  const [zone, setZone] = useState<ZoneResponse>();
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();

  useEffect(() => {
    if (plantTaskId) {
      fetchPlantTask(plantTaskId);
    }
  }, [plantTaskId]);

  const fetchPlantTask = async (id: string) => {
    try {
      const response = await getPlantTaskById(id);
      setPlantTask(response.data);
      const formData = {
        ...response.data,
        dueDate: dayjs(response.data.dueDate),
      };

      setCurrentImages(response.data.images);
      form.setFieldsValue(formData);
    } catch (error) {
      console.error('Error fetching plant task:', error);
      messageApi.error('Failed to fetch plant task details');
    }
  };

  const handleSubmit = async () => {
    try {
      const formValues = await form.validateFields();
      if (!plantTask) return;

      const changedData: Partial<PlantTaskResponse> = Object.keys(formValues).reduce((acc, key) => {
        const typedKey = key as keyof PlantTaskResponse; // Cast key to the correct type
        if (JSON.stringify(formValues[typedKey]) !== JSON.stringify(plantTask?.[typedKey])) {
          acc[typedKey] = formValues[typedKey];
        }
        return acc;
      }, {} as Partial<PlantTaskResponse>);

      changedData.images = currentImages;
      const response = await updatePlantTaskDetails(plantTask.id, changedData, selectedFiles);
      if (response.status === 200) {
        messageApi.success('Saved changes to Plant Task. Redirecting to Plant Task details page...');
        setTimeout(() => {
          navigate(`/plant-tasks/${plantTask.id}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating Plant Task', error);
      messageApi.error('Unable to update Plant Task. Please try again later.');
    }
  };

  const handleCurrentImageClick = (index: number) => {
    setCurrentImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const taskTypeOptions = Object.values(PlantTaskTypeEnum).map((type) => ({
    value: type,
    label: type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase()),
  }));

  const taskUrgencyOptions = Object.values(PlantTaskUrgencyEnum).map((urgency) => ({
    value: urgency,
    label: urgency
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase()),
  }));

  const statusOptions = [
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const breadcrumbItems = [
    {
      title: 'Plant Task Management',
      pathKey: '/plant-tasks',
      isMain: true,
    },
    {
      title: plantTask?.title ? plantTask.title : 'Details',
      pathKey: `/plant-tasks/${plantTask?.id}`,
    },
    {
      title: 'Edit',
      pathKey: `/plant-tasks/${plantTask?.id}/edit`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Form form={form} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8" onFinish={handleSubmit}>
          <Form.Item label="Zone">{plantTask?.zoneName}</Form.Item>
          <Form.Item label="Occurrence">{plantTask?.occurrence?.title}</Form.Item>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Enter Plant Task title" />
          </Form.Item>
          <Form.Item name="taskType" label="Task Type" rules={[{ required: true }]}>
            <Select placeholder="Select a Task Type" options={taskTypeOptions} />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea placeholder="Enter Plant Task description" autoSize={{ minRows: 3, maxRows: 5 }} />
          </Form.Item>
          <Form.Item name="taskUrgency" label="Task Urgency" rules={[{ required: true }]}>
            <Select placeholder="Select Task Urgency" options={taskUrgencyOptions} />
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

export default PlantTaskEdit;
