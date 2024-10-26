import React, { useState, useEffect } from 'react';
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
  onStatusChange: (newStatus: PlantTaskStatusEnum, oldStatus: PlantTaskStatusEnum) => void;
}

const EditPlantTaskModal: React.FC<EditPlantTaskModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  userRole,
  onStatusChange,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogPrompt, setShowLogPrompt] = useState(false);
  const navigate = useNavigate();

  // Use useEffect to reset form fields when the modal becomes visible
  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        title: initialValues.title,
        taskType: initialValues.taskType,
        taskUrgency: initialValues.taskUrgency,
        taskStatus: initialValues.taskStatus,
        dueDate: dayjs(initialValues.dueDate),
        description: initialValues.description,
        remarks: initialValues.remarks,
      });
    }
  }, [visible, initialValues, form]);

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

  const handleCancel = () => {
    form.resetFields(); // Reset form fields when cancelling
    onCancel();
  };

  return (
    <>
      <Modal
        title="Edit Plant Task"
        open={visible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={isSubmitting} onClick={handleSubmit}>
            Update Task
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <div style={{ marginBottom: '16px' }}>
            {userRole === StaffType.SUPERADMIN && (
              <Form.Item style={{ marginBottom: '4px' }}>Park: {initialValues?.occurrence?.zone.park.name}</Form.Item>
            )}
            <Form.Item style={{ marginBottom: '4px' }}>Zone: {initialValues?.occurrence?.zone.name}</Form.Item>
            <Form.Item style={{ marginBottom: '0' }}>
              Occurrence: {initialValues?.occurrence?.title}
              <Tooltip title="Go to Occurrence">
                <Button type="link" icon={<FiExternalLink />} onClick={() => navigateToOccurrence(initialValues?.occurrence?.id || '')} />
              </Tooltip>
            </Form.Item>
          </div>
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
          {userRole === StaffType.SUPERADMIN ||
            (userRole === StaffType.MANAGER && (
              <Form.Item name="dueDate" label="Due Date" rules={[{ required: true, message: 'Please select the due date' }]}>
                <DatePicker className="w-full" disabledDate={(current) => current && current < dayjs().endOf('day')} />
              </Form.Item>
            ))}
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea rows={2} />
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
