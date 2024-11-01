import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, message, Tooltip, Flex } from 'antd';
import {
  MaintenanceTaskResponse,
  MaintenanceTaskStatusEnum,
  MaintenanceTaskTypeEnum,
  MaintenanceTaskUpdateData,
  StaffType,
  getFacilityById,
  updateMaintenanceTaskDetails,
  assignMaintenanceTask,
  unassignMaintenanceTask,
  updateMaintenanceTaskStatus,
  StaffResponse,
} from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import dayjs from 'dayjs';
import { FiExternalLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@lepark/common-ui';

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
  const [facilityName, setFacilityName] = useState<string>('');
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();

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

      const fetchFacilityName = async () => {
        let name = '';
        if (initialValues.parkAsset?.facilityId) {
          const facility = await getFacilityById(initialValues.parkAsset.facilityId);
          name = facility?.data?.name || '';
        } else if (initialValues.sensor?.facilityId) {
          const facility = await getFacilityById(initialValues.sensor.facilityId);
          name = facility?.data?.name || '';
        } else if (initialValues.hub?.facilityId) {
          const facility = await getFacilityById(initialValues.hub.facilityId);
          name = facility?.data?.name || '';
        } else if (initialValues.facility) {
          name = initialValues.facility.name;
        }
        setFacilityName(name);
      };

      fetchFacilityName();
    } else {
      form.resetFields();
      setFacilityName('');
    }
  }, [visible, initialValues, form]);

  const getFaultyEntityType = () => {
    if (initialValues?.parkAsset) return 'Park Asset';
    if (initialValues?.sensor) return 'Sensor';
    if (initialValues?.hub) return 'Hub';
    if (initialValues?.facility) return 'Facility';
    return 'Unknown';
  };

  const getFaultyEntityName = () => {
    if (initialValues?.parkAsset) return initialValues.parkAsset.name;
    if (initialValues?.sensor) return initialValues.sensor.name;
    if (initialValues?.hub) return initialValues.hub.name;
    if (initialValues?.facility) return initialValues.facility.name;
    return 'Unknown';
  };

  const navigateToEntity = () => {
    if (initialValues?.parkAsset) {
      window.open(`/parkasset/${initialValues.parkAsset.id}`, '_blank', 'noopener,noreferrer');
    } else if (initialValues?.sensor) {
      window.open(`/sensor/${initialValues.sensor.id}`, '_blank', 'noopener,noreferrer');
    } else if (initialValues?.hub) {
      window.open(`/hubs/${initialValues.hub.id}`, '_blank', 'noopener,noreferrer');
    } else if (initialValues?.facility) {
      window.open(`/facilities/${initialValues.facility.id}`, '_blank', 'noopener,noreferrer');
    }
  };

  const navigateToLocation = () => {
    if (initialValues?.parkAsset) {
      window.open(`/facilities/${initialValues.parkAsset.facilityId}`, '_blank', 'noopener,noreferrer');
    } else if (initialValues?.sensor) {
      window.open(`/facilities/${initialValues.sensor.facilityId}`, '_blank', 'noopener,noreferrer');
    } else if (initialValues?.hub) {
      window.open(`/facilities/${initialValues.hub.facilityId}`, '_blank', 'noopener,noreferrer');
    } else if (initialValues?.facility) {
      window.open(`/facilities/${initialValues.facility.id}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();

      // Handle status changes
      if (values.taskStatus !== initialValues?.taskStatus) {
        if (values.taskStatus === MaintenanceTaskStatusEnum.OPEN && initialValues?.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS) {
          await unassignMaintenanceTask(initialValues.id, user?.id || '');
          values.assignedStaffId = null;
        } else if (values.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS && initialValues?.taskStatus === MaintenanceTaskStatusEnum.OPEN) {
          await assignMaintenanceTask(initialValues.id, user?.id || '');
          values.assignedStaffId = user?.id;
        }
      }
      // First, try to submit the form
      await onSubmit(values);
      console.log('initialValues', initialValues);
      console.log('values', values);

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
    let url = '';
    if (initialValues?.facility?.id) {
      url = `/facilities/${initialValues.facility.id}/edit`;
    } else if (initialValues?.parkAsset?.id) {
      url = `/parkasset/${initialValues.parkAsset.id}/edit`;
    } else if (initialValues?.sensor?.id) {
      url = `/sensor/${initialValues.sensor.id}/edit`;
    } else if (initialValues?.hub?.id) {
      url = `/hubs/${initialValues.hub.id}/edit`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    onCancel(); // Close the edit modal
  };

  const handleLogPromptCancel = () => {
    setShowLogPrompt(false);
    onStatusChange(MaintenanceTaskStatusEnum.COMPLETED);
    onCancel(); // Close the edit modal
  };

  const handleCancel = () => {
    form.resetFields();
    setFacilityName('');
    onCancel();
  };

  return (
    <>
      <Modal
        title="Edit Maintenance Task"
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
              <Form.Item style={{ marginBottom: '4px' }}>Park: {initialValues?.submittingStaff?.park?.name}</Form.Item>
            )}
            {/* <Form.Item style={{ marginBottom: '4px' }}>Facility: {getFacilityNameForFaultyItem()}</Form.Item> */}
            <Form.Item style={{ marginBottom: '4px' }}>
              Location: {facilityName}
              <Tooltip title="Go to location">
                <Button type="link" icon={<FiExternalLink />} onClick={() => navigateToLocation()} />
              </Tooltip>
            </Form.Item>
            <Form.Item style={{ marginBottom: '0' }}>
              Faulty Entity: {getFaultyEntityName()}
              <Tooltip title="Go to faulty entity">
                <Button type="link" icon={<FiExternalLink />} onClick={() => navigateToEntity()} />
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
        title="Task Completed"
        open={showLogPrompt}
        onOk={handleLogPromptOk}
        onCancel={handleLogPromptCancel}
        okText="Yes, edit status"
        cancelText="No, just complete the task"
      >
        <p>Do you want to edit the status of the {getFaultyEntityType()} "{getFaultyEntityName()}"?</p>
      </Modal>
    </>
  );
};

export default EditMaintenanceTaskModal;
