import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, message, Tooltip } from 'antd';
import { PlantTaskResponse, PlantTaskStatusEnum, PlantTaskTypeEnum, PlantTaskUpdateData, StaffType } from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import dayjs from 'dayjs';
import { FiExternalLink } from 'react-icons/fi';

interface EditPlantTaskModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: PlantTaskUpdateData) => Promise<void>;
  initialValues: PlantTaskResponse | null;
  userRole: StaffType;
}

const EditPlantTaskModal: React.FC<EditPlantTaskModalProps> = ({ visible, onCancel, onSubmit, initialValues, userRole }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await onSubmit(values);
      // Success message and modal closing are now handled in the parent component
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message || 'Failed to update plant task');
      } else {
        message.error('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToOccurrence = (occurrenceId: string) => {
    window.open(`/occurrences/${occurrenceId}`, '_blank', 'noopener,noreferrer');
  };

  return (
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
        {userRole === StaffType.SUPERADMIN && (
          <Form.Item>
            Park: {initialValues?.occurrence?.zone.park.name}
          </Form.Item>
        )}
        <Form.Item>
          Zone: {initialValues?.occurrence?.zone.name}
        </Form.Item>
        <Form.Item>
          Occurrence: {initialValues?.occurrence?.title}
          <Tooltip title="Go to Occurrence">
            <Button type="link" icon={<FiExternalLink />} onClick={() => navigateToOccurrence(initialValues?.occurrence?.id || '')} />
          </Tooltip>
        </Form.Item>
        <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter the title' }]}>
          <Input />
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
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditPlantTaskModal;