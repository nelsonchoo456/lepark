import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, message, Tooltip, Flex } from 'antd';
import { MaintenanceTaskResponse, MaintenanceTaskStatusEnum, MaintenanceTaskTypeEnum, MaintenanceTaskUpdateData, StaffType } from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import dayjs from 'dayjs';
import { FiExternalLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface EditMaintenanceTaskModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: MaintenanceTaskUpdateData) => Promise<void>;
  initialValues: MaintenanceTaskResponse | null;
  userRole: StaffType;
  onStatusChange: (newStatus: MaintenanceTaskStatusEnum) => void;
}

const EditMaintenanceTaskModal: React.FC<EditMaintenanceTaskModalProps> = ({
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

  React.useEffect(() => {
    if (initialValues) {
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
  }, [initialValues, form]);

  const getFacilityNameForFaultyItem = () => {
    if (initialValues?.facility) {
      return initialValues.facility.name;
    } else if (initialValues?.parkAsset) {
      return initialValues.parkAsset.facility?.name;
    } else if (initialValues?.sensor) {
      return initialValues.sensor.facility?.name;
    } else if (initialValues?.hub) {
      return initialValues.hub.facility?.name;
    }
    return '';
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();

      // First, try to submit the form
      await onSubmit(values);

      // If submission is successful, then check if we need to show the log prompt
      if (values.taskStatus === MaintenanceTaskStatusEnum.COMPLETED && initialValues?.taskStatus !== MaintenanceTaskStatusEnum.COMPLETED) {
        setShowLogPrompt(true);
      } else {
        // If we don't need to show the log prompt, just close the modal
        onCancel();
      }
    } catch (error) {
      console.error('Error updating maintenance task:', error);
      if (error instanceof Error) {
        message.error(error.message || 'Failed to update maintenance task. Please try again.');
      } else {
        message.error('Failed to update maintenance task. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogPromptOk = () => {
    setShowLogPrompt(false);
    onStatusChange(MaintenanceTaskStatusEnum.COMPLETED);
    if (initialValues?.facility?.id) {
      navigate(`/facilities/${initialValues.facility.id}`);
    } else if (initialValues?.parkAsset?.id) {
      navigate(`/park-assets/${initialValues.parkAsset.id}`);
    } else if (initialValues?.sensor?.id) {
      navigate(`/sensors/${initialValues.sensor.id}`);
    } else if (initialValues?.hub?.id) {
      navigate(`/hubs/${initialValues.hub.id}`);
    }
    onCancel(); // Close the edit modal
  };

  const handleLogPromptCancel = () => {
    setShowLogPrompt(false);
    onStatusChange(MaintenanceTaskStatusEnum.COMPLETED);
    onCancel(); // Close the edit modal
  };

  const navigateToFacility = () => {
    if (initialValues?.facility) {
      window.open(`/facilities/${initialValues.facility.id}`, '_blank', 'noopener,noreferrer');
    } else if (initialValues?.parkAsset) {
      window.open(`/facilities/${initialValues.parkAsset.facility?.id}`, '_blank', 'noopener,noreferrer');
    } else if (initialValues?.sensor) {
      window.open(`/facilities/${initialValues.sensor.facility?.id}`, '_blank', 'noopener,noreferrer');
    } else if (initialValues?.hub) {
      window.open(`/facilities/${initialValues.hub.facility?.id}`, '_blank', 'noopener,noreferrer');
    }
  };

  const renderFaultyEntity = () => {
    let title = '';
    if (initialValues?.facility) {
      title = initialValues.facility.name;
    } else if (initialValues?.parkAsset) {
      title = initialValues.parkAsset.name;
    } else if (initialValues?.sensor) {
      title = initialValues.sensor.name;
    } else if (initialValues?.hub) {
      title = initialValues.hub.name;
    }

    return (
      <Flex align="center" justify="space-between">
        <span>{title}</span>
        <Tooltip title="Go to entity">
          <Button type="link" icon={<FiExternalLink />} onClick={() => navigateToFacility()} />
        </Tooltip>
      </Flex>
    );
  };

  const navigateToFaultyEntity = () => {
    if (initialValues?.facility) {
      navigate(`/facilities/${initialValues.facility.id}`);
    } else if (initialValues?.parkAsset) {
      navigate(`/park-assets/${initialValues.parkAsset.id}`);
    } else if (initialValues?.sensor) {
      navigate(`/sensors/${initialValues.sensor.id}`);
    } else if (initialValues?.hub) {
      navigate(`/hubs/${initialValues.hub.id}`);
    }
  };

  return (
    <>
      <Modal
        title="Edit Maintenance Task"
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
          <div style={{ marginBottom: '16px' }}>
            {userRole === StaffType.SUPERADMIN && (
              <Form.Item style={{ marginBottom: '4px' }}>Park: {initialValues?.submittingStaff?.park?.name}</Form.Item>
            )}
            {/* <Form.Item style={{ marginBottom: '4px' }}>Facility: {getFacilityNameForFaultyItem()}</Form.Item> */}
            <Form.Item style={{ marginBottom: '0' }}>
              Location: {getFacilityNameForFaultyItem()}
              <Tooltip title="Go to location">
                <Button type="link" icon={<FiExternalLink />} onClick={() => navigateToFacility()} />
              </Tooltip>
            </Form.Item>
            <Form.Item style={{ marginBottom: '0' }}>
              Faulty Entity: {renderFaultyEntity()}
              <Tooltip title="Go to faulty entity">
                <Button type="link" icon={<FiExternalLink />} onClick={() => navigateToFaultyEntity()} />
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
              {Object.values(MaintenanceTaskTypeEnum).map((type) => (
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
              {Object.values(MaintenanceTaskStatusEnum).map((status) => (
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

export default EditMaintenanceTaskModal;
