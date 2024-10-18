import React from 'react';
import { Modal, Descriptions, Tag, Typography, Button, Tooltip, Flex, Space, Image, Empty } from 'antd';
import { PlantTaskResponse, StaffType } from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import dayjs from 'dayjs';
import { FiExternalLink } from 'react-icons/fi';

interface ViewPlantTaskModalProps {
  visible: boolean;
  onCancel: () => void;
  task: PlantTaskResponse | null;
  userRole: StaffType;
}

const ViewPlantTaskModal: React.FC<ViewPlantTaskModalProps> = ({ visible, onCancel, task, userRole }) => {
  if (!task) return null;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'IMMEDIATE':
        return 'red';
      case 'HIGH':
        return 'orange';
      case 'NORMAL':
        return 'blue';
      case 'LOW':
        return 'green';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'default';
      case 'IN_PROGRESS':
        return 'blue';
      case 'COMPLETED':
        return 'green';
      case 'CANCELLED':
        return 'gray';
      default:
        return 'default';
    }
  };

  const navigateToOccurrence = (occurrenceId: string) => {
    window.open(`/occurrences/${occurrenceId}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      title="Plant Task Details"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
      ]}
      width={700}
    >
      <Descriptions column={1} bordered>
        {userRole === StaffType.SUPERADMIN && (
          <Descriptions.Item label="Park">{task.occurrence?.zone.park.name}</Descriptions.Item>
        )}
        <Descriptions.Item label="Zone">{task.occurrence?.zone.name}</Descriptions.Item>
        <Descriptions.Item label="Occurrence">
          <Flex align="center" justify="space-between">
            <span>{task.occurrence?.title}</span>
            <Tooltip title="Go to Occurrence">
              <Button type="link" icon={<FiExternalLink />} onClick={() => navigateToOccurrence(task.occurrence?.id || '')} />
            </Tooltip>
          </Flex>
        </Descriptions.Item>
        <Descriptions.Item label="Title">{task.title}</Descriptions.Item>
        <Descriptions.Item label="Description">
          <Typography.Paragraph>{task.description || 'No description provided'}</Typography.Paragraph>
        </Descriptions.Item>
        <Descriptions.Item label="Task Type">
          <Tag bordered={false}>{formatEnumLabelToRemoveUnderscores(task.taskType)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Task Urgency">
          <Tag color={getUrgencyColor(task.taskUrgency)} bordered={false}>
            {formatEnumLabelToRemoveUnderscores(task.taskUrgency)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Task Status">
          <Tag color={getStatusColor(task.taskStatus)} bordered={false}>
            {formatEnumLabelToRemoveUnderscores(task.taskStatus)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Created Date">{dayjs(task.createdAt).format('D MMM YYYY')}</Descriptions.Item>
        <Descriptions.Item label="Due Date">{dayjs(task.dueDate).format('D MMM YYYY')}</Descriptions.Item>
        <Descriptions.Item label="Last Updated">{dayjs(task.updatedAt).format('D MMM YYYY')}</Descriptions.Item>
        <Descriptions.Item label="Completed Date">{task.completedDate ? dayjs(task.completedDate).format('D MMM YYYY') : '-'}</Descriptions.Item>
        <Descriptions.Item label="Assigned Staff">
          {task.assignedStaff ? `${task.assignedStaff.firstName} ${task.assignedStaff.lastName}` : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Submitted By">
          {task.submittingStaff ? `${task.submittingStaff.firstName} ${task.submittingStaff.lastName}` : '-'}
        </Descriptions.Item>
      </Descriptions>

      <Typography.Title level={4} className="mt-4 mb-2">
        Images
      </Typography.Title>
      {task.images && task.images.length > 0 ? (
        <Space size="large" wrap>
          {task.images.map((image, index) => (
            <Image key={index} width={200} src={image} className="rounded-md" />
          ))}
        </Space>
      ) : (
        <div className='h-64 bg-gray-200 flex items-center justify-center rounded-lg'>
          <Empty description="No Image"/>
        </div>
      )}
    </Modal>
  );
};

export default ViewPlantTaskModal;