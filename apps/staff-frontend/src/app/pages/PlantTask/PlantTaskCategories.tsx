import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { PlantTaskResponse, PlantTaskStatusEnum, updatePlantTaskStatus } from '@lepark/data-access';
import { Card, Col, message, Row } from 'antd';
import { useState } from 'react';
import { COLORS } from '../../config/colors';

interface PlantTaskCategoriesProps {
  open: PlantTaskResponse[];
  inProgress: PlantTaskResponse[];
  completed: PlantTaskResponse[];
  cancelled: PlantTaskResponse[];

  setOpen: (items: PlantTaskResponse[]) => void;
  setInProgress: (items: PlantTaskResponse[]) => void;
  setCompleted: (items: PlantTaskResponse[]) => void;
  setCancelled: (items: PlantTaskResponse[]) => void;
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
}: PlantTaskCategoriesProps) => {

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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Row gutter={16} className="mb-4">
        {[
          { value: 'OPEN', title: 'Open', color: COLORS.sky[400] },
          { value: 'IN_PROGRESS', title: 'In Progress', color: COLORS.mustard[400] },
          { value: 'COMPLETED', title: 'Completed', color: COLORS.green[400] },
          { value: 'CANCELLED', title: 'Cancelled', color: COLORS.gray[600] },
        ].map((status) => (
          <Col span={6} key={status.value}>
            <Card title={status.title} styles={{ header: {backgroundColor: status.color, color: "white" }, body: { padding: "1rem" }}}>
              <Droppable droppableId={status.value} >
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} style={{ minHeight: "200px" }}>
                    {getList(status.value as PlantTaskStatusEnum).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <Card styles={{ body: { padding: 0 }}} className='p-2'>{task.title}</Card>
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
  );
};

export default PlantTaskCategories;
