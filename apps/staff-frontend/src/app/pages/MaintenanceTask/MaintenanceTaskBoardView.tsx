import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  MaintenanceTaskResponse,
  MaintenanceTaskStatusEnum,
  updateMaintenanceTaskStatus,
  assignMaintenanceTask,
  unassignMaintenanceTask,
  updateMaintenanceTaskPosition,
  updateMaintenanceTaskDetails,
  MaintenanceTaskUpdateData,
  deleteMaintenanceTasksByStatus,
  deleteMaintenanceTask,
  StaffType,
  StaffResponse,
} from '@lepark/data-access';
import { Card, Col, message, Row, Tag, Typography, Avatar, Dropdown, Menu, Modal, DatePicker, Spin } from 'antd';
import moment from 'moment';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { COLORS } from '../../config/colors';
import { MoreOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@lepark/common-ui';
import { FiClock } from 'react-icons/fi';
import dayjs from 'dayjs';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import EditMaintenanceTaskModal from './EditMaintenanceTaskModal';
import ViewMaintenanceTaskModal from './ViewMaintenanceTaskModal';

interface MaintenanceTaskBoardViewProps {
  open: MaintenanceTaskResponse[];
  inProgress: MaintenanceTaskResponse[];
  completed: MaintenanceTaskResponse[];
  cancelled: MaintenanceTaskResponse[];

  setOpen: (items: MaintenanceTaskResponse[]) => void;
  setInProgress: (items: MaintenanceTaskResponse[]) => void;
  setCompleted: (items: MaintenanceTaskResponse[]) => void;
  setCancelled: (items: MaintenanceTaskResponse[]) => void;
  refreshData: () => void;
  userRole: string;
  loading: boolean; // Add this new prop
}

const { RangePicker } = DatePicker;

const MaintenanceTaskBoardView = ({
  open,
  inProgress,
  completed,
  cancelled,
  setOpen,
  setInProgress,
  setCompleted,
  setCancelled,
  refreshData,
  userRole,
  loading, // Add this new prop
}: MaintenanceTaskBoardViewProps) => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<MaintenanceTaskResponse | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTaskResponse | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [showLogPrompt, setShowLogPrompt] = useState(false);
  const [movedTaskObjectId, setMovedTaskObjectId] = useState<{ type: 'facility' | 'parkAsset' | 'sensor' | 'hub'; id: string } | null>(
    null,
  );
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    dayjs().startOf('month').subtract(1, 'month'),
    dayjs().endOf('month').add(1, 'month'),
  ]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [maintenanceTaskToBeDeleted, setMaintenanceTaskToBeDeleted] = useState<MaintenanceTaskResponse | null>(null);
  const [taskBeingMoved, setTaskBeingMoved] = useState<MaintenanceTaskResponse | null>(null);
  const [taskMovedIndex, setTaskMovedIndex] = useState<number | null>(null);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const sourceList = getList(source.droppableId as MaintenanceTaskStatusEnum);
    const destList = getList(destination.droppableId as MaintenanceTaskStatusEnum);

    // Prevent unassigned tasks from being moved directly to COMPLETE
    if (source.droppableId === MaintenanceTaskStatusEnum.OPEN && destination.droppableId === MaintenanceTaskStatusEnum.COMPLETED) {
      message.error('Tasks must be assigned before they can be completed.');
      return;
    }

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same list
      const reorderedTasks = Array.from(sourceList);
      const [reorderedItem] = reorderedTasks.splice(source.index, 1);
      reorderedTasks.splice(destination.index, 0, reorderedItem);

      updateListState(source.droppableId as MaintenanceTaskStatusEnum, reorderedTasks);

      try {
        await updateMaintenanceTaskPosition(reorderedItem.id, destination.index);
      } catch (error) {
        console.error('Error updating task position:', error);
        message.error('Failed to update task position');
      }
    } else {
      // Moving from one list to another
      const sourceClone = Array.from(sourceList);
      const destClone = Array.from(destList);
      const [movedTask] = sourceClone.splice(source.index, 1);

      destClone.splice(destination.index, 0, { ...movedTask, taskStatus: destination.droppableId as MaintenanceTaskStatusEnum });

      updateListState(source.droppableId as MaintenanceTaskStatusEnum, sourceClone);
      updateListState(destination.droppableId as MaintenanceTaskStatusEnum, destClone);

      try {
        if (source.droppableId === MaintenanceTaskStatusEnum.OPEN && destination.droppableId === MaintenanceTaskStatusEnum.IN_PROGRESS) {
          await assignMaintenanceTask(movedTask.id, user?.id || '');
          message.success('Task has been assigned and updated successfully');
        } else if (destination.droppableId === MaintenanceTaskStatusEnum.COMPLETED) {
          message.success('Task marked as completed');
        } else if (
          source.droppableId === MaintenanceTaskStatusEnum.IN_PROGRESS &&
          destination.droppableId === MaintenanceTaskStatusEnum.OPEN
        ) {
          await unassignMaintenanceTask(movedTask.id, user?.id || '');
          message.success('Task has been unassigned and updated successfully');
        } else {
          message.success('Task updated successfully');
        }

        await updateMaintenanceTaskStatus(movedTask.id, destination.droppableId as MaintenanceTaskStatusEnum, user?.id);
        await updateMaintenanceTaskPosition(movedTask.id, destination.index);

        // Refresh data to show changes immediately
        await refreshData();

        // Show log prompt for all moves except to CANCELLED
        if (destination.droppableId !== MaintenanceTaskStatusEnum.CANCELLED) {
          setTaskBeingMoved(movedTask);
          setTaskMovedIndex(destination.index);
          if (movedTask.parkAssetId) {
            setMovedTaskObjectId({ type: 'parkAsset', id: movedTask.parkAssetId });
          } else if (movedTask.sensorId) {
            setMovedTaskObjectId({ type: 'sensor', id: movedTask.sensorId });
          } else if (movedTask.hubId) {
            setMovedTaskObjectId({ type: 'hub', id: movedTask.hubId });
          } else if (movedTask.facilityId) {
            setMovedTaskObjectId({ type: 'facility', id: movedTask.facilityId });
          }

          setShowLogPrompt(true);
        }
      } catch (error) {
        console.error('Error updating task:', error);
        message.error('Failed to update task');
        // Revert the UI changes
        updateListState(source.droppableId as MaintenanceTaskStatusEnum, sourceList);
        updateListState(destination.droppableId as MaintenanceTaskStatusEnum, destList);
      }
    }
  };

  const getList = (id: MaintenanceTaskStatusEnum) => {
    switch (id) {
      case MaintenanceTaskStatusEnum.OPEN:
        return open;
      case MaintenanceTaskStatusEnum.IN_PROGRESS:
        return userRole === StaffType.SUPERADMIN ? inProgress : inProgress.filter((task) => task.assignedStaffId === user?.id);
      case MaintenanceTaskStatusEnum.COMPLETED:
        return userRole === StaffType.SUPERADMIN ? completed : completed.filter((task) => task.assignedStaffId === user?.id);
      case MaintenanceTaskStatusEnum.CANCELLED:
        return userRole === StaffType.SUPERADMIN ? cancelled : cancelled.filter((task) => task.assignedStaffId === user?.id);
      default:
        return [];
    }
  };

  const updateListState = (id: MaintenanceTaskStatusEnum, items: MaintenanceTaskResponse[]) => {
    switch (id) {
      case MaintenanceTaskStatusEnum.OPEN:
        setOpen(items);
        break;
      case MaintenanceTaskStatusEnum.IN_PROGRESS:
        setInProgress(items);
        break;
      case MaintenanceTaskStatusEnum.COMPLETED:
        setCompleted(items);
        break;
      case MaintenanceTaskStatusEnum.CANCELLED:
        setCancelled(items);
        break;
      default:
        break;
    }
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

  const handleEditDetails = (task: MaintenanceTaskResponse) => {
    setEditingTask(task);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values: MaintenanceTaskUpdateData) => {
    if (editingTask) {
      try {
        await updateMaintenanceTaskDetails(editingTask.id, values);
        message.success('Task updated successfully');
        setEditModalVisible(false);
        refreshData(); // Refresh the task list
      } catch (error) {
        console.error('Error updating maintenance task:', error);
        throw new Error('Failed to update task.' + ' ' + error + '.');
      }
    }
  };

  const handleStatusChange = (newStatus: MaintenanceTaskStatusEnum) => {
    // Refresh the task list or update the local state as needed
    refreshData();
  };

  const showViewModal = (task: MaintenanceTaskResponse) => {
    setSelectedTask(task);
    setViewModalVisible(true);
  };

  const renderTaskCard = (task: MaintenanceTaskResponse) => {
    const isOverdue = moment().startOf('day').isAfter(moment(task.dueDate).startOf('day'));
    const isDueSoon = moment(task.dueDate).startOf('day').isSameOrBefore(moment().startOf('day').add(3, 'days'));
    const shouldHighlightOverdue =
      isOverdue && task.taskStatus !== MaintenanceTaskStatusEnum.COMPLETED && task.taskStatus !== MaintenanceTaskStatusEnum.CANCELLED;
    const shouldHighlightDueSoon =
      isDueSoon && task.taskStatus !== MaintenanceTaskStatusEnum.COMPLETED && task.taskStatus !== MaintenanceTaskStatusEnum.CANCELLED;

    const dropdownItems = [
      {
        label: 'View Details',
        key: '1',
        onClick: () => showViewModal(task),
      },
    ];

    if (task.taskStatus !== MaintenanceTaskStatusEnum.COMPLETED && task.taskStatus !== MaintenanceTaskStatusEnum.CANCELLED) {
      dropdownItems.push({
        label: 'Edit Details',
        key: '2',
        onClick: () => handleEditDetails(task),
      });
    }

    // Add Delete Task option for Superadmin and Manager
    if (userRole === StaffType.SUPERADMIN || userRole === StaffType.MANAGER || userRole === StaffType.VENDOR_MANAGER) {
      dropdownItems.push({
        label: 'Delete Task',
        key: '3',
        danger: true,
        onClick: () => handleDeleteTask(task),
      } as any);
    }

    return (
      <Card
        size="small"
        className="mb-2"
        style={{
          ...(shouldHighlightOverdue
            ? { backgroundColor: 'rgba(255, 0, 0, 0.1)' }
            : shouldHighlightDueSoon
            ? { backgroundColor: 'rgba(255, 255, 0, 0.1)' }
            : {}),
          height: '150px', // Set a fixed height for all cards
          display: 'flex',
          flexDirection: 'column',
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {task.images && task.images.length > 0 && <Avatar src={task.images[0]} size="small" style={{ marginRight: 8 }} />}
              <Typography.Text ellipsis style={{ maxWidth: 200 }}>
                {task.title}
              </Typography.Text>
            </div>
            <Dropdown menu={{ items: dropdownItems }} trigger={['click']}>
              <MoreOutlined style={{ cursor: 'pointer' }} />
            </Dropdown>
          </div>
        }
        styles={{
          body: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
          },
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Typography.Text type="secondary" style={{ fontSize: '0.8rem' }}>
              {formatEnumLabelToRemoveUnderscores(task.taskType)}
            </Typography.Text>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <UserOutlined style={{ marginRight: 4, color: task.assignedStaffId ? '#1890ff' : '#d9d9d9' }} />
              <Typography.Text style={{ fontSize: '0.8rem', color: task.assignedStaffId ? '#1890ff' : '#d9d9d9' }}>
                {task.assignedStaffId ? `${task.assignedStaff?.firstName} ${task.assignedStaff?.lastName}` : ''}
              </Typography.Text>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 4 }}>
            <div>
              <Typography.Text type="secondary" style={{ fontSize: '0.8rem' }}>
                {`Priority: `}
              </Typography.Text>
              <Tag color={getUrgencyColor(task.taskUrgency)} style={{ fontSize: '0.7rem' }} bordered={false}>
                {formatEnumLabelToRemoveUnderscores(task.taskUrgency)}
              </Tag>
            </div>
          </div>
          {userRole === StaffType.SUPERADMIN && (
            <div>
              <Typography.Text type="secondary" style={{ fontSize: '0.8rem', marginBottom: 4 }}>
                {`Park: ${task.submittingStaff?.park?.name}`}
              </Typography.Text>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-1">
          <Typography.Text style={{ fontSize: '0.8rem', fontWeight: 500 }}>Due: {moment(task.dueDate).format('D MMM YY')}</Typography.Text>
          <div>
            {isOverdue &&
              task.taskStatus !== MaintenanceTaskStatusEnum.COMPLETED &&
              task.taskStatus !== MaintenanceTaskStatusEnum.CANCELLED && (
                <Tag color="red" style={{ fontSize: '0.7rem' }} bordered={false}>
                  OVERDUE
                </Tag>
              )}
            {isDueSoon &&
              !isOverdue &&
              task.taskStatus !== MaintenanceTaskStatusEnum.COMPLETED &&
              task.taskStatus !== MaintenanceTaskStatusEnum.CANCELLED && (
                <Tag color="gold" style={{ fontSize: '0.7rem' }} bordered={false}>
                  DUE SOON
                </Tag>
              )}
          </div>
        </div>
      </Card>
    );
  };

  const handleDeleteTasks = async (taskType: string) => {
    if (taskType === 'COMPLETED' || taskType === 'CANCELLED') {
      await deleteMaintenanceTasksByStatus(taskType);
      message.success('Cleared Tasks.');
      refreshData();
    }
  };

  const handleLogPromptOk = () => {
    setShowLogPrompt(false);
    if (movedTaskObjectId) {
      let url = '';
      if (movedTaskObjectId.type === 'facility') {
        url = `/facilities/${movedTaskObjectId.id}/edit`;
      } else if (movedTaskObjectId.type === 'parkAsset') {
        url = `/parkasset/${movedTaskObjectId.id}/edit`;
      } else if (movedTaskObjectId.type === 'sensor') {
        url = `/sensor/${movedTaskObjectId.id}/edit`;
      } else if (movedTaskObjectId.type === 'hub') {
        url = `/hubs/${movedTaskObjectId.id}/edit`;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    cleanupAfterPrompt();
  };

  const handleLogPromptCancel = () => {
    setShowLogPrompt(false);
    cleanupAfterPrompt();
  };

  const cleanupAfterPrompt = () => {
    setTaskBeingMoved(null);
    setTaskMovedIndex(null);
    setMovedTaskObjectId(null);
  };

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setDateRange(dates || [null, null]);
  };

  const filterTasksByDateRange = (tasks: MaintenanceTaskResponse[]) => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return tasks;
    }
    const [startDate, endDate] = dateRange;
    return tasks.filter((task) => {
      const dueDate = dayjs(task.dueDate);
      return (
        (dueDate.isSame(startDate, 'day') || dueDate.isAfter(startDate, 'day')) &&
        (dueDate.isSame(endDate, 'day') || dueDate.isBefore(endDate, 'day'))
      );
    });
  };

  const filteredOpen = filterTasksByDateRange(open);
  const filteredInProgress = filterTasksByDateRange(inProgress);
  const filteredCompleted = filterTasksByDateRange(completed);
  const filteredCancelled = filterTasksByDateRange(cancelled);

  // Add this function to handle task deletion
  const handleDeleteTask = (task: MaintenanceTaskResponse) => {
    setMaintenanceTaskToBeDeleted(task);
    setDeleteModalOpen(true);
  };

  const deleteMaintenanceTaskConfirmed = async () => {
    try {
      if (!maintenanceTaskToBeDeleted) {
        throw new Error('Unable to delete Maintenance Task at this time');
      }
      await deleteMaintenanceTask(maintenanceTaskToBeDeleted.id);
      refreshData();
      setMaintenanceTaskToBeDeleted(null);
      setDeleteModalOpen(false);
      message.success(`Deleted Maintenance Task: ${maintenanceTaskToBeDeleted.title}.`);
    } catch (error) {
      console.error(error);
      setMaintenanceTaskToBeDeleted(null);
      setDeleteModalOpen(false);
      message.error('Unable to delete Maintenance Task at this time. Please try again later.');
    }
  };

  const cancelDelete = () => {
    setMaintenanceTaskToBeDeleted(null);
    setDeleteModalOpen(false);
  };

  return (
    <Spin spinning={loading} tip="Loading tasks...">
      <div style={{ marginBottom: '16px' }}>
        <RangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          style={{ width: '100%' }}
          placeholder={['Start Date', 'End Date']}
        />
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Row gutter={[16, 16]} className="mb-4">
          {[
            { value: 'OPEN', title: 'Open', color: COLORS.sky[400], tasks: filteredOpen },
            { value: 'IN_PROGRESS', title: 'In Progress', color: COLORS.mustard[400], tasks: filteredInProgress },
            { value: 'COMPLETED', title: 'Completed', color: COLORS.green[400], tasks: filteredCompleted },
            { value: 'CANCELLED', title: 'Cancelled', color: COLORS.gray[600], tasks: filteredCancelled },
          ].map((status) => (
            // <Col span={6} key={status.value}>
            <Col xs={24} md={24} lg={6} key={status.value}>
              <Card
                title={
                  (user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) &&
                  (status.value === 'COMPLETED' || status.value === 'CANCELLED') ? (
                    <div className="flex justify-between">
                      <div>{status.title}</div>
                      <Dropdown
                        menu={{ items: [{ key: 'delete', danger: true, label: 'Clear', onClick: () => handleDeleteTasks(status.value) }] }}
                      >
                        <MoreOutlined style={{ cursor: 'pointer' }} />
                      </Dropdown>
                    </div>
                  ) : (
                    status.title
                  )
                }
                styles={{
                  header: { backgroundColor: status.color, color: 'white' },
                  body: { padding: '1rem', overflowY: 'auto' },
                }}
              >
                <Droppable droppableId={status.value}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} style={{ minHeight: '100px' }}>
                      {status.tasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                          isDragDisabled={
                            task.taskStatus === MaintenanceTaskStatusEnum.COMPLETED ||
                            task.taskStatus === MaintenanceTaskStatusEnum.CANCELLED
                          }
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.5 : 1,
                              }}
                            >
                              {renderTaskCard(task)}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card>
            </Col>
          ))}
        </Row>
      </DragDropContext>
      <EditMaintenanceTaskModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSubmit={handleEditSubmit}
        initialValues={editingTask}
        userRole={userRole as StaffType}
        onStatusChange={handleStatusChange}
      />
      <ViewMaintenanceTaskModal
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        task={selectedTask}
        userRole={userRole as StaffType}
      />
      <Modal
        title="Update Task"
        open={showLogPrompt}
        onOk={handleLogPromptOk}
        onCancel={handleLogPromptCancel}
        okText="Yes, edit status"
        cancelText="No, just update the task"
      >
        <p>
          Do you want to edit the status of the{' '}
          {taskBeingMoved?.parkAsset ? 'Park Asset' : taskBeingMoved?.sensor ? 'Sensor' : taskBeingMoved?.hub ? 'Hub' : 'Facility'} "
          {taskBeingMoved?.parkAsset?.name || taskBeingMoved?.sensor?.name || taskBeingMoved?.hub?.name || taskBeingMoved?.facility?.name}"?
        </p>
      </Modal>
      <ConfirmDeleteModal
        onConfirm={deleteMaintenanceTaskConfirmed}
        open={deleteModalOpen}
        onCancel={cancelDelete}
        description="Are you sure you want to delete this Maintenance Task?"
      />
    </Spin>
  );
};

export default MaintenanceTaskBoardView;
