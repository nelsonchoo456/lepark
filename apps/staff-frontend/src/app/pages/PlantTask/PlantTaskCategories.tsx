import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { PlantTaskResponse, PlantTaskStatusEnum, updatePlantTaskStatus, assignPlantTask, getAllStaffsByParkId, StaffResponse, getAllStaffs } from '@lepark/data-access';
import { Card, Col, message, Row, Tag, Typography, Avatar, Dropdown, Menu, Modal, Select } from 'antd';
import moment from 'moment';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { COLORS } from '../../config/colors';
import { MoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { StaffRoleEnum } from '@prisma/client';

interface PlantTaskCategoriesProps {
  open: PlantTaskResponse[];
  inProgress: PlantTaskResponse[];
  completed: PlantTaskResponse[];
  cancelled: PlantTaskResponse[];

  setOpen: (items: PlantTaskResponse[]) => void;
  setInProgress: (items: PlantTaskResponse[]) => void;
  setCompleted: (items: PlantTaskResponse[]) => void;
  setCancelled: (items: PlantTaskResponse[]) => void;
  refreshData: () => void;
}

// Utility function to reorder the lists after drag and drop
const reorder = (list: PlantTaskResponse[], startIndex: number, endIndex: number): PlantTaskResponse[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Utility function to move tasks between different lists
const move = (
  source: PlantTaskResponse[],
  destination: PlantTaskResponse[],
  droppableSource: { index: number; droppableId: string },
  droppableDestination: { index: number; droppableId: string },
): { [key in PlantTaskStatusEnum]: PlantTaskResponse[] } => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);
  destClone.splice(droppableDestination.index, 0, removed);

  const result: { [key in PlantTaskStatusEnum]: PlantTaskResponse[] } = {
    OPEN: [],
    IN_PROGRESS: [],
    COMPLETED: [],
    CANCELLED: [],
  };
  result[droppableSource.droppableId as PlantTaskStatusEnum] = sourceClone;
  result[droppableDestination.droppableId as PlantTaskStatusEnum] = destClone;

  return result;
};

const PlantTaskCategories = ({
  open,
  inProgress,
  completed,
  cancelled,
  setOpen,
  setInProgress,
  setCompleted,
  setCancelled,
  refreshData,
}: PlantTaskCategoriesProps) => {
  const navigate = useNavigate();
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<StaffResponse[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const updateTaskStatusInBackend = async (taskId: string, newStatus: PlantTaskStatusEnum) => {
    try {
      // Call your backend API to update the task status
      await updatePlantTaskStatus(taskId, newStatus);
      message.success('Task status updated successfully');
    } catch (error) {
      message.error('Failed to update task status');
      console.error(error);
    }
  };
  
  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const movedTask = getList(source.droppableId as PlantTaskStatusEnum)[source.index];
    if (source.droppableId === destination.droppableId) {
      const items = reorder(getList(source.droppableId as PlantTaskStatusEnum), source.index, destination.index);

      updateListState(source.droppableId as PlantTaskStatusEnum, items);
    } else {
      const result = move(
        getList(source.droppableId as PlantTaskStatusEnum),
        getList(destination.droppableId as PlantTaskStatusEnum),
        source,
        destination,
      );

      updateListState(source.droppableId as PlantTaskStatusEnum, result[source.droppableId as PlantTaskStatusEnum]);
      updateListState(destination.droppableId as PlantTaskStatusEnum, result[destination.droppableId as PlantTaskStatusEnum]);

      console.log("movedTask", movedTask)
      await updateTaskStatusInBackend(movedTask.id, destination.droppableId as PlantTaskStatusEnum);
      refreshData(); // Call the refreshData function after updating the task status
    }
  };

  const getList = (id: PlantTaskStatusEnum) => {
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

  const updateListState = (id: PlantTaskStatusEnum, items: PlantTaskResponse[]) => {
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

  const handleViewDetails = (taskId: string) => {
    navigate(`/plant-tasks/${taskId}`);
  };

  const handleAssignStaff = async (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsAssignModalVisible(true);
    try {
      const response = await getAllStaffs();
      const staff = response.data.filter((s: StaffResponse) => s.role === StaffRoleEnum.ARBORIST || s.role === StaffRoleEnum.BOTANIST);
      setStaffList(staff);
    } catch (error) {
      console.error('Failed to fetch staff list:', error);
      message.error('Failed to load staff list');
    }
  };

  const handleAssignConfirm = async () => {
    if (selectedTaskId && selectedStaffId) {
      try {
        await assignPlantTask(selectedTaskId, 'currentStaffId', selectedStaffId);
        message.success('Task assigned successfully');
        setIsAssignModalVisible(false);
        refreshData();
      } catch (error) {
        console.error('Failed to assign task:', error);
        message.error('Failed to assign task');
      }
    }
  };

  const renderTaskCard = (task: PlantTaskResponse) => (
    <Card
      size="small"
      className="mb-2"
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {task.images && task.images.length > 0 && (
              <Avatar src={task.images[0]} size="small" style={{ marginRight: 8 }} />
            )}
            <Typography.Text ellipsis style={{ maxWidth: 200 }}>{task.title}</Typography.Text>
          </div>
          <Dropdown overlay={
            <Menu>
              <Menu.Item key="1" onClick={() => handleViewDetails(task.id)}>View Details</Menu.Item>
              <Menu.Item key="2" onClick={() => handleAssignStaff(task.id)}>Assign Staff</Menu.Item>
            </Menu>
          } trigger={['click']}>
            <MoreOutlined style={{ cursor: 'pointer' }} />
          </Dropdown>
        </div>
      }
    >
      <Typography.Text type="secondary" style={{ fontSize: '0.8rem' }}>
        {"Type: "} {formatEnumLabelToRemoveUnderscores(task.taskType)}
      </Typography.Text>
      <div style={{ marginTop: 4, marginBottom: 4 }}>
        <Tag color={getUrgencyColor(task.taskUrgency)} style={{ fontSize: '0.7rem' }} bordered={false}>
          {formatEnumLabelToRemoveUnderscores(task.taskUrgency)}
        </Tag>
      </div>
      <Typography.Text type="secondary" style={{ fontSize: '0.8rem' }}>
        Due: {moment(task.dueDate).format('D MMM YY')}
      </Typography.Text>
    </Card>
  );

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Row gutter={16} className="mb-4">
          {[
            { value: 'OPEN', title: 'Open', color: COLORS.sky[400] },
            { value: 'IN_PROGRESS', title: 'In Progress', color: COLORS.mustard[400] },
            { value: 'COMPLETED', title: 'Completed', color: COLORS.green[400] },
            { value: 'CANCELLED', title: 'Cancelled', color: COLORS.gray[600] },
          ].map((status) => (
            <Col span={6} key={status.value}>
              <Card 
                title={status.title} 
                styles={{ 
                  header: {backgroundColor: status.color, color: "white" }, 
                  body: { padding: "1rem", maxHeight: "60vh", overflowY: "auto" }
                }}
              >
                <Droppable droppableId={status.value} >
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      style={{ minHeight: '100px' }}
                    >
                      {getList(status.value as PlantTaskStatusEnum).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
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
        visible={isAssignModalVisible}
        onOk={handleAssignConfirm}
        onCancel={() => setIsAssignModalVisible(false)}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select a staff member"
          onChange={(value) => setSelectedStaffId(value)}
        >
          {staffList.map((staff) => (
            <Select.Option key={staff.id} value={staff.id}>
              {staff.firstName} {staff.lastName}
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </>
  );
};

export default PlantTaskCategories;