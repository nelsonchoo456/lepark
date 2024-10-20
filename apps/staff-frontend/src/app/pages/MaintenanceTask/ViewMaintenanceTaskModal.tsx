import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Typography, Button, Tooltip, Flex, Space, Image, Empty } from 'antd';
import { getFacilityById, MaintenanceTaskResponse, StaffType } from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import dayjs from 'dayjs';
import { FiExternalLink } from 'react-icons/fi';
import { COLORS } from '../../config/colors';

interface ViewMaintenanceTaskModalProps {
  visible: boolean;
  onCancel: () => void;
  task: MaintenanceTaskResponse | null;
  userRole: StaffType;
}

const ViewMaintenanceTaskModal: React.FC<ViewMaintenanceTaskModalProps> = ({ visible, onCancel, task, userRole }) => {
  const [facilityName, setFacilityName] = useState<string>('');

  console.log('task', task);

  useEffect(() => {
    const fetchFacilityName = async () => {
      if (!task) return;

      let name = '';
      if (task.parkAsset?.facilityId) {
        const facility = await getFacilityById(task.parkAsset.facilityId);
        name = facility?.data?.name || '';
      } else if (task.sensor?.facilityId) {
        const facility = await getFacilityById(task.sensor.facilityId);
        name = facility?.data?.name || '';
      } else if (task.hub?.facilityId) {
        const facility = await getFacilityById(task.hub.facilityId);
        name = facility?.data?.name || '';
      }
      setFacilityName(name);
    };

    fetchFacilityName();
  }, [task]);

  if (!task) return null;

  const getFaultyEntityType = () => {
    if (task.parkAsset) return 'Park Asset';
    if (task.sensor) return 'Sensor';
    if (task.hub) return 'Hub';
    if (task.facility) return 'Facility';
    return 'Unknown';
  };

  const getFaultyEntityName = () => {
    if (task.parkAsset) return task.parkAsset.name;
    if (task.sensor) return task.sensor.name;
    if (task.hub) return task.hub.name;
    if (task.facility) return task.facility.name;
    return 'Unknown';
  };

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
        return COLORS.sky[400];
      case 'IN_PROGRESS':
        return COLORS.mustard[400];
      case 'COMPLETED':
        return COLORS.green[400];
      case 'CANCELLED':
        return 'gray';
      default:
        return 'default';
    }
  };

  const navigateToEntity = () => {
    if (task.parkAsset) {
      window.open(`/park-assets/${task.parkAsset.id}`, '_blank', 'noopener,noreferrer');
    } else if (task.sensor) {
      window.open(`/sensor/${task.sensor.id}`, '_blank', 'noopener,noreferrer');
    } else if (task.hub) {
      window.open(`/hubs/${task.hub.id}`, '_blank', 'noopener,noreferrer');
    } else if (task.facility) {
      window.open(`/facilities/${task.facility.id}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Modal
      title="Maintenance Task Details"
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
        {userRole === StaffType.SUPERADMIN && <Descriptions.Item label="Park">{task.submittingStaff?.park?.name}</Descriptions.Item>}
        {(task.parkAsset || task.sensor || task.hub) && (
          <Descriptions.Item label="Location">
            <span>{facilityName || 'Loading...'}</span>
            <Tooltip title="Go to location">
              <Button type="link" icon={<FiExternalLink />} onClick={() => navigateToEntity()} />
            </Tooltip>
          </Descriptions.Item>
        )}
        <Descriptions.Item label={`Faulty ${getFaultyEntityType()}`}>
          <span>{getFaultyEntityName()}</span>
          <Tooltip title="Go to entity">
            <Button type="link" icon={<FiExternalLink />} onClick={() => navigateToEntity()} />
          </Tooltip>
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
        <Descriptions.Item label="Completed Date">
          {task.completedDate ? dayjs(task.completedDate).format('D MMM YYYY') : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Remarks">
          <Typography.Paragraph>{task.remarks || '-'}</Typography.Paragraph>
        </Descriptions.Item>
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
        <div className="h-64 bg-gray-200 flex items-center justify-center rounded-lg">
          <Empty description="No Image" />
        </div>
      )}
    </Modal>
  );
};

export default ViewMaintenanceTaskModal;
