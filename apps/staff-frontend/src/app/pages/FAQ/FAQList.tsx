import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { FAQResponse, getAllFAQs, updateFAQPriorities } from '@lepark/data-access';

const FAQList: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQResponse[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await getAllFAQs();
      setFaqs(response.data);
      const uniqueCategories: string[] = Array.from(new Set(response.data.map((faq: FAQResponse) => faq.category)));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination || source.droppableId !== destination.droppableId) return;

    const sourceList = getList(source.droppableId);

    // Reordering within the same list
    const reorderedFAQs = Array.from(sourceList);
    const [reorderedItem] = reorderedFAQs.splice(source.index, 1);
    reorderedFAQs.splice(destination.index, 0, reorderedItem);

    updateListState(source.droppableId, reorderedFAQs);

    // Update position in the backend
    try {
      await updateFAQPriorities(reorderedFAQs);
    } catch (error) {
      console.error('Error updating FAQ priorities:', error);
    }
  };

  const getList = (category: string) => {
    return faqs.filter((faq) => faq.category === category);
  };

  const updateListState = (category: string, items: FAQResponse[]) => {
    setFaqs((prevFaqs) => {
      const otherFaqs = prevFaqs.filter((faq) => faq.category !== category);
      return [...otherFaqs, ...items];
    });
  };

  return (
    <div>
      <DragDropContext onDragEnd={handleDragEnd}>
        {categories.map((category) => (
          <div key={category}>
            <h2>{category}</h2>
            <Droppable droppableId={category}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} style={{ minHeight: '100px' }}>
                  {getList(category).map((faq, index) => (
                    <Draggable key={faq.id} draggableId={faq.id} index={index}>
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
                          <div>{faq.question}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
};

export default FAQList;
