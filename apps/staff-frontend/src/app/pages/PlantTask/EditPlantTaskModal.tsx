import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, message, Tooltip } from 'antd';
import { PlantTaskResponse, PlantTaskStatusEnum, PlantTaskTypeEnum, PlantTaskUpdateData, StaffType } from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import dayjs from 'dayjs';
import { FiExternalLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface EditPlantTaskModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: PlantTaskUpdateData) => Promise<void>;
  initialValues: PlantTaskResponse | null;
  userRole: StaffType;
  onStatusChange: (newStatus: PlantTaskStatusEnum) => void;
}

const EditPlantTaskModal: React.FC<EditPlantTaskModalProps> = ({ visible, onCancel, onSubmit, initialValues, userRole, onStatusChange }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogPrompt, setShowLogPrompt] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title,
        taskType: initialValues.taskType,
        taskUrgency: initialValues.taskUrgency,
        taskStatus: initialValues.taskStatus,
        dueDate: dayjs(initialValues.dueDate),
        description: initialValues.description,
      });
    }
  }, [initialValues, form]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();
      
      // First, try to submit the form
      await onSubmit(values);
      
      // If submission is successful, then check if we need to show the log prompt
      if (values.taskStatus === PlantTaskStatusEnum.COMPLETED && initialValues?.taskStatus !== PlantTaskStatusEnum.COMPLETED) {
        setShowLogPrompt(true);
      } else {
        // If we don't need to show the log prompt, just close the modal
        onCancel();
      }
    } catch (error) {
      console.error('Error updating plant task:', error);
      if (error instanceof Error) {
        message.error(error.message || 'Failed to update plant task. Please try again.');
      } else {
        message.error('Failed to update plant task. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogPromptOk = () => {
    setShowLogPrompt(false);
    onStatusChange(PlantTaskStatusEnum.COMPLETED);
    if (initialValues?.occurrence?.id) {
      navigate(`/occurrences/${initialValues.occurrence.id}`);
    }
    onCancel(); // Close the edit modal
  };

  const handleLogPromptCancel = () => {
    setShowLogPrompt(false);
    onStatusChange(PlantTaskStatusEnum.COMPLETED);
    onCancel(); // Close the edit modal
  };

  const navigateToOccurrence = (occurrenceId: string) => {
    window.open(`/occurrences/${occurrenceId}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Modal
        title="Edit Plant Task"
        open={visible}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={isSubmitting} onClick={handleSubmit}>
            Update Task
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          {userRole === StaffType.SUPERADMIN && <Form.Item>Park: {initialValues?.occurrence?.zone.park.name}</Form.Item>}
          <Form.Item>Zone: {initialValues?.occurrence?.zone.name}</Form.Item>
          <Form.Item>
            Occurrence: {initialValues?.occurrence?.title}
            <Tooltip title="Go to Occurrence">
              <Button type="link" icon={<FiExternalLink />} onClick={() => navigateToOccurrence(initialValues?.occurrence?.id || '')} />
            </Tooltip>
          </Form.Item>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter the title' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="taskType" label="Task Type" rules={[{ required: true, message: 'Please select the task type' }]}>
            <Select>
              {Object.values(PlantTaskTypeEnum).map((type) => (
                <Select.Option key={type} value={type}>
                  {formatEnumLabelToRemoveUnderscores(type)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="taskUrgency" label="Task Urgency" rules={[{ required: true, message: 'Please select the task urgency' }]}>
            <Select>
              {['IMMEDIATE', 'HIGH', 'NORMAL', 'LOW'].map((urgency) => (
                <Select.Option key={urgency} value={urgency}>
                  {formatEnumLabelToRemoveUnderscores(urgency)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="taskStatus" label="Task Status" rules={[{ required: true, message: 'Please select the task status' }]}>
            <Select>
              {Object.values(PlantTaskStatusEnum).map((status) => (
                <Select.Option key={status} value={status}>
                  {formatEnumLabelToRemoveUnderscores(status)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date" rules={[{ required: true, message: 'Please select the due date' }]}>
            <DatePicker 
              className="w-full" 
              disabledDate={(current) => current && current < dayjs().endOf('day')} 
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Create Log"
        open={showLogPrompt}
        onOk={handleLogPromptOk}
        onCancel={handleLogPromptCancel}
        okText="Yes, create log"
        cancelText="No, just complete the task"
      >
        <p>Do you want to create an Activity Log or Status Log for this completed task?</p>
      </Modal>
    </>
  );
};

export default EditPlantTaskModal;