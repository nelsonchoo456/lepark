import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { PlantTaskResponse, StaffResponse, StaffType, updatePlantTaskDetails, getPlantTaskById } from '@lepark/data-access';
import { Button, Card, Form, Input, message, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import PageHeader2 from '../../components/main/PageHeader2';

const { TextArea } = Input;

const PlantTaskEdit = () => {
  const { user } = useAuth<StaffResponse>();
  const { plantTaskId } = useParams();
  const [form] = Form.useForm();
  const [plantTask, setPlantTask] = useState<PlantTaskResponse>();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

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

      const updatedData = {
        ...formValues,
        dueDate: formValues.dueDate.toISOString(),
      };

      const response = await updatePlantTaskDetails(plantTask.id, updatedData);
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

  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
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
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Enter Plant Task title" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea placeholder="Enter Plant Task description" autoSize={{ minRows: 3, maxRows: 5 }} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
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
