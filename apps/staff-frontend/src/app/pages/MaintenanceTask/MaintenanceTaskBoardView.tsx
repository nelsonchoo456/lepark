import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  MaintenanceTaskResponse,
  MaintenanceTaskStatusEnum,
  updateMaintenanceTaskStatus,
  assignMaintenanceTask,
  getAllStaffsByParkId,
  StaffResponse,
  getAllStaffs,
  updateMaintenanceTaskPosition,
  unassignMaintenanceTask,
  updateMaintenanceTaskDetails,
  MaintenanceTaskUpdateData,
  deleteMaintenanceTasksByStatus,
  deleteMaintenanceTask,
} from '@lepark/data-access';
import { Card, Col, message, Row, Tag, Typography, Avatar, Dropdown, Menu, Modal, Select, DatePicker } from 'antd';
import moment from 'moment';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { COLORS } from '../../config/colors';
import { MoreOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { StaffRoleEnum } from '@prisma/client';
import { useAuth } from '@lepark/common-ui';
import { StaffType } from '@lepark/data-access';
import { FiClock } from 'react-icons/fi';
// import EditMaintenanceTaskModal from './EditMaintenanceTaskModal';
// import ViewMaintenanceTaskModal from './ViewMaintenanceTaskModal';
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
}: MaintenanceTaskBoardViewProps) => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<StaffResponse[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTaskResponse | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTaskResponse | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [showLogPrompt, setShowLogPrompt] = useState(false);
  const [completedTaskObjectId, setCompletedTaskObjectId] = useState<{ type: 'facility' | 'parkAsset' | 'sensor' | 'hub', id: string } | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [maintenanceTaskToBeDeleted, setMaintenanceTaskToBeDeleted] = useState<MaintenanceTaskResponse | null>(null);
  const [taskBeingCompleted, setTaskBeingCompleted] = useState<MaintenanceTaskResponse | null>(null);
  const [taskCompletionIndex, setTaskCompletionIndex] = useState<number | null>(null);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const sourceList = getList(source.droppableId as MaintenanceTaskStatusEnum);
    const destList = getList(destination.droppableId as MaintenanceTaskStatusEnum);

    // Check if the task is unassigned and being moved from OPEN to another column
    const movedTask = sourceList[source.index];
    if (
      source.droppableId === MaintenanceTaskStatusEnum.OPEN &&
      destination.droppableId !== MaintenanceTaskStatusEnum.OPEN &&
      destination.droppableId !== MaintenanceTaskStatusEnum.CANCELLED &&
      !movedTask.assignedStaffId
    ) {
      message.error('Cannot move unassigned tasks. Please assign a staff member first.');
      return;
    }

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same list
      const reorderedTasks = Array.from(sourceList);
      const [reorderedItem] = reorderedTasks.splice(source.index, 1);
      reorderedTasks.splice(destination.index, 0, reorderedItem);

      updateListState(source.droppableId as MaintenanceTaskStatusEnum, reorderedTasks);

      // Update position in the backend
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

      // Update status and position in the backend
      try {
        await updateMaintenanceTaskStatus(movedTask.id as string, destination.droppableId as MaintenanceTaskStatusEnum);
        await updateMaintenanceTaskPosition(movedTask.id as string, destination.index);
      } catch (error) {
        console.error('Error updating task status, position, or unassigning:', error);
        message.error('Failed to update task status, position, or unassign');
      }
    }

    if (destination.droppableId === MaintenanceTaskStatusEnum.COMPLETED) {
      setTaskBeingCompleted(movedTask);
      setTaskCompletionIndex(destination.index);
      if (movedTask.facilityId) {
        setCompletedTaskObjectId({ type: 'facility', id: movedTask.facilityId });
      } else if (movedTask.parkAssetId) {
        setCompletedTaskObjectId({ type: 'parkAsset', id: movedTask.parkAssetId });
      } else if (movedTask.sensorId) {
        setCompletedTaskObjectId({ type: 'sensor', id: movedTask.sensorId });
      } else if (movedTask.hubId) {
        setCompletedTaskObjectId({ type: 'hub', id: movedTask.hubId });
      }
      setShowLogPrompt(true);
    } else {
      // If not moving to COMPLETED, update the task status immediately
      try {
        if (destination.droppableId === movedTask.taskStatus) {
          await updateMaintenanceTaskStatus(movedTask.id as string, destination.droppableId as MaintenanceTaskStatusEnum);
          await updateMaintenanceTaskPosition(movedTask.id as string, destination.index);
        } else {
          await updateMaintenanceTaskStatus(movedTask.id as string, destination.droppableId as MaintenanceTaskStatusEnum);
          await updateMaintenanceTaskPosition(movedTask.id as string, destination.index);
          message.success('Task status updated successfully');
        }
      } catch (error) {
        console.error('Error updating task status or position:', error);
        message.error('Failed to update task status or position');
      }
    }

    refreshData(); // Call the refreshData function after updating the task
  };

  const getList = (id: MaintenanceTaskStatusEnum) => {
    switch (id) {
      case 'OPEN':
        return open;
      case 'IN_PROGRESS':
        return inProgress;
      case 'COMPLETED':
        return completed;
      case 'CANCELLED':
        return cancelled;
      default:
        return [];
    }
  };

  const updateListState = (id: MaintenanceTaskStatusEnum, items: MaintenanceTaskResponse[]) => {
    switch (id) {
      case 'OPEN':
        setOpen(items);
        break;
      case 'IN_PROGRESS':
        setInProgress(items);
        break;
      case 'COMPLETED':
        setCompleted(items);
        break;
      case 'CANCELLED':
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

  const handleAssignStaff = async (task: MaintenanceTaskResponse) => {
    if (userRole !== StaffType.SUPERADMIN && userRole !== StaffType.MANAGER) {
      return; // Prevent non-superadmin/manager from assigning staff
    }
    setSelectedTask(task);
    setSelectedTaskId(task.id);
    setSelectedStaffId(null); // Reset the selected staff
    setIsAssignModalVisible(true);
    try {
      const response = await getAllStaffsByParkId(task.submittingStaff?.parkId);
      const staff = response.data.filter((s: StaffResponse) => s.role === StaffRoleEnum.ARBORIST || s.role === StaffRoleEnum.BOTANIST);
      setStaffList(staff);
    } catch (error) {
      console.error('Failed to fetch staff list:', error);
      message.error('Failed to load staff list');
    }
  };

  const handleAssignConfirm = async () => {
    if (selectedTaskId && selectedStaffId && selectedTask) {
      try {
        await assignMaintenanceTask(selectedTaskId, user?.id || '', selectedStaffId);
        message.success('Task assigned successfully');
        setIsAssignModalVisible(false);

        // Update the local state
        const updatedTask = { ...selectedTask, assignedStaffId: selectedStaffId };
        updateTaskInList(updatedTask);

        // Add a delay before refreshing data
        setTimeout(() => {
          refreshData();
        }, 500); // 0.5 second delay
      } catch (error) {
        console.error('Failed to assign task:', error);
        message.error('Failed to assign task');
      }
    }
  };

  const updateTaskInList = (updatedTask: MaintenanceTaskResponse) => {
    const listUpdaters = {
      [MaintenanceTaskStatusEnum.OPEN]: setOpen,
      [MaintenanceTaskStatusEnum.IN_PROGRESS]: setInProgress,
      [MaintenanceTaskStatusEnum.COMPLETED]: setCompleted,
      [MaintenanceTaskStatusEnum.CANCELLED]: setCancelled,
    };

    const updater = listUpdaters[updatedTask.taskStatus] as React.Dispatch<React.SetStateAction<MaintenanceTaskResponse[]>>;
    updater((prevList: MaintenanceTaskResponse[]) =>
      prevList.map((task: MaintenanceTaskResponse) => (task.id === updatedTask.id ? updatedTask : task))
    );

    // Log the updated state for debugging
    console.log('Updated task:', updatedTask);
    console.log('Updated list:', listUpdaters[updatedTask.taskStatus]);
  };

  const handleStatusChange = (newStatus: MaintenanceTaskStatusEnum) => {
    // Refresh the task list or update the local state as needed
    refreshData();
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

    if (
      (userRole === StaffType.SUPERADMIN || userRole === StaffType.MANAGER) &&
      !task.assignedStaffId &&
      task.taskStatus === MaintenanceTaskStatusEnum.OPEN
    ) {
      dropdownItems.push({
        label: 'Assign Staff',
        key: '3',
        onClick: () => handleAssignStaff(task),
      });
    }

    if (
      (userRole === StaffType.SUPERADMIN || userRole === StaffType.MANAGER) &&
      task.assignedStaffId &&
      task.taskStatus === MaintenanceTaskStatusEnum.OPEN
    ) {
      dropdownItems.push({
        label: 'Unassign Staff',
        key: '4',
        onClick: () => handleUnassignStaff(task),
      });
    }

    // Add Delete Task option for Superadmin and Manager
    if (userRole === StaffType.SUPERADMIN || userRole === StaffType.MANAGER) {
      dropdownItems.push({
        label: 'Delete Task',
        key: '5',
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
          }
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
                {task.assignedStaffId
                  ? `${task.assignedStaff?.firstName} ${task.assignedStaff?.lastName}`
                  : ''}
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
        
        <div className='flex justify-between mt-1'>
          <Typography.Text style={{ fontSize: '0.8rem', fontWeight: 500 }}>
            Due: {moment(task.dueDate).format('D MMM YY')}
          </Typography.Text>
          <div>
            {isOverdue && task.taskStatus !== MaintenanceTaskStatusEnum.COMPLETED && task.taskStatus !== MaintenanceTaskStatusEnum.CANCELLED && (
              <Tag color="red" style={{ fontSize: '0.7rem' }} bordered={false}>
                OVERDUE
              </Tag>
            )}
            {isDueSoon && !isOverdue && task.taskStatus !== MaintenanceTaskStatusEnum.COMPLETED && task.taskStatus !== MaintenanceTaskStatusEnum.CANCELLED && (
              <Tag color="gold" style={{ fontSize: '0.7rem' }} bordered={false}>
                DUE SOON
              </Tag>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const handleUnassignStaff = async (task: MaintenanceTaskResponse) => {
    try {
      await unassignMaintenanceTask(task.id, user?.id || '');
      message.success('Staff unassigned successfully');
      refreshData();

      // Update the local state
      const updatedTask = { ...task, assignedStaffId: null };
      updateTaskInList(updatedTask);
    } catch (error) {
      console.error('Failed to unassign staff:', error);
      message.error('Failed to unassign staff');
    }
  };

  const handleDeleteTasks = async (taskType: string) => {
    if (taskType === "COMPLETED" || taskType === "CANCELLED") {
      await deleteMaintenanceTasksByStatus(taskType);
      message.success('Cleared Tasks.');
      refreshData();
    }
  }

  const handleLogPromptOk = async () => {
    setShowLogPrompt(false);
    if (completedTaskObjectId) {
      if (completedTaskObjectId.type === 'facility') {
        navigate(`/facilities/${completedTaskObjectId.id}`);
      } else if (completedTaskObjectId.type === 'parkAsset') {
        navigate(`/park-assets/${completedTaskObjectId.id}`);
      } else if (completedTaskObjectId.type === 'sensor') {
        navigate(`/sensors/${completedTaskObjectId.id}`);
      } else if (completedTaskObjectId.type === 'hub') {
        navigate(`/hubs/${completedTaskObjectId.id}`);
      }
    }
  };

  const handleLogPromptCancel = async () => {
    setShowLogPrompt(false);
    await completeTask();
  };

  const completeTask = async () => {
    if (taskBeingCompleted && taskCompletionIndex !== null) {
      try {
        await updateMaintenanceTaskStatus(taskBeingCompleted.id, MaintenanceTaskStatusEnum.COMPLETED);
        await updateMaintenanceTaskPosition(taskBeingCompleted.id, taskCompletionIndex);

        message.success('Task marked as completed');
        refreshData();
      } catch (error) {
        console.error('Error completing task:', error);
        message.error('Failed to complete task');
      } finally {
        setTaskBeingCompleted(null);
        setTaskCompletionIndex(null);
        setCompletedTaskObjectId(null);
      }
    }
  };

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setDateRange(dates);
  };

  const filterTasksByDateRange = (tasks: MaintenanceTaskResponse[]) => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return tasks;
    }
    const [startDate, endDate] = dateRange;
    return tasks.filter(task => {
      const dueDate = dayjs(task.dueDate);
      return (dueDate.isSame(startDate, 'day') || dueDate.isAfter(startDate, 'day')) && (dueDate.isSame(endDate, 'day') || dueDate.isBefore(endDate, 'day'));
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
    <>
      <div style={{ marginBottom: '16px' }}>
        <RangePicker
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
                title={(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) && (status.value === "COMPLETED" || status.value === "CANCELLED") ?
                  <div className="flex justify-between">
                    <div>{status.title}</div>
                    <Dropdown menu={{ items: [{ key: 'delete', danger: true, label: 'Clear', onClick: () => handleDeleteTasks(status.value) }] }}>
                      <MoreOutlined style={{ cursor: 'pointer' }} />
                    </Dropdown>
                  </div>
                  : status.title
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
                            task.taskStatus === MaintenanceTaskStatusEnum.COMPLETED || task.taskStatus === MaintenanceTaskStatusEnum.CANCELLED
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
      <Modal
        title="Assign Staff"
        open={isAssignModalVisible}
        onOk={handleAssignConfirm}
        onCancel={() => {
          setIsAssignModalVisible(false);
          setSelectedStaffId(null); // Reset the selected staff when closing the modal
        }}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select a staff member"
          onChange={(value) => setSelectedStaffId(value)}
          value={selectedStaffId} // Add this to control the select value
        >
          {staffList.map((staff) => (
            <Select.Option key={staff.id} value={staff.id}>
              {staff.firstName} {staff.lastName} - {staff.role}
            </Select.Option>
          ))}
        </Select>
      </Modal>
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
        title="Create Log"
        open={showLogPrompt}
        onOk={handleLogPromptOk}
        onCancel={handleLogPromptCancel}
        okText="Yes, create log"
        cancelText="No, just complete the task"
      >
        <p>Do you want to create an Activity Log or Status Log for this completed task?</p>
      </Modal>
      <ConfirmDeleteModal
        onConfirm={deleteMaintenanceTaskConfirmed}
        open={deleteModalOpen}
        onCancel={cancelDelete}
        description="Are you sure you want to delete this Maintenance Task?"
      />
    </>
  );
};

export default MaintenanceTaskBoardView;
