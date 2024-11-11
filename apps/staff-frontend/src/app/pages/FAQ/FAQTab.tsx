import React, { useState, useMemo, useEffect } from 'react';
import { Card, Collapse, Button, Input, Row, Col, Pagination, Flex, App, Select } from 'antd';
import { FiSearch } from 'react-icons/fi';
import { RiEdit2Line, RiEyeLine } from 'react-icons/ri';
import { MdDeleteOutline } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { FAQResponse, deleteFAQ, FAQCategoryEnum, ParkResponse, FAQStatusEnum, updateFAQPriorities, StaffType, StaffResponse } from '@lepark/data-access';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const { Option } = Select;

interface FAQTabProps {
  faqs: FAQResponse[];
  triggerFetch: () => void;
  showParkColumn?: boolean;
  parks: ParkResponse[];
}

const FAQTab: React.FC<FAQTabProps> = ({ faqs, triggerFetch, showParkColumn = false, parks }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const navigate = useNavigate();
  const { modal, message } = App.useApp();
  const [selectedStatuses, setSelectedStatuses] = useState<FAQStatusEnum[]>([]);
  const [groupedFAQs, setGroupedFAQs] = useState<{ [key in FAQCategoryEnum]: FAQResponse[] }>({} as { [key in FAQCategoryEnum]: FAQResponse[] });
  const { user } = useAuth<StaffResponse>();



  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: FAQStatusEnum[]) => {
    setSelectedStatuses(value);
    setCurrentPage(1);
  };

  const filteredFAQs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(faq.status);
      const matchesPark = faq.parkId === null || user?.role === StaffType.SUPERADMIN || faq.parkId === user?.parkId;
      return matchesSearch && matchesStatus && matchesPark;
    });
  }, [faqs, searchQuery, selectedStatuses, user?.role, user?.parkId]);


  useEffect(() => {
    const grouped: { [key in FAQCategoryEnum]: FAQResponse[] } = {} as { [key in FAQCategoryEnum]: FAQResponse[] };
    Object.values(FAQCategoryEnum).forEach(category => {
      grouped[category] = filteredFAQs.filter(faq => faq.category === category);
    });
    setGroupedFAQs(grouped);
  }, [filteredFAQs]);

  const categoriesPerPage = 6;

  const formatCategoryName = (category: string) => {
    return category
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const categoryColors: { [key in FAQCategoryEnum]: string } = {
    GENERAL: '#4a90e2',
    PARK_RULES: '#7ed321',
    FACILITIES: '#d5c300',
    EVENTS: '#bd10e0',
    SAFETY: '#d0021b',
    ACCESSIBILITY: '#50e3c2',
    SERVICES: '#9013fe',
    TICKETING: '#4a90e2',
    PARK_HISTORY: '#f5a623',
    OTHER: '#037d50',
  };

const getParkName = (parkId: number | null) => {
    if (parkId === null) return 'All Parks';
    const park = parks?.find((p) => p.id === parkId);
    return park ? park.name : 'Unknown Park';
  };

  const handleDelete = async (id: string) => {
    try {
      const confirmed = await new Promise<boolean>((resolve) => {
        modal.confirm({
          title: 'Confirm Deletion?',
          content: 'Deleting an FAQ cannot be undone. Are you sure you want to proceed?',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
          okText: 'Confirm Delete',
          okButtonProps: { danger: true },
        });
      });

      if (!confirmed) return;

      await deleteFAQ(id);
      triggerFetch();
      message.success('FAQ deleted successfully');
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      message.error('Failed to delete FAQ. Please try again.');
    }
  };


  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceCategory = source.droppableId as FAQCategoryEnum;
    const destCategory = destination.droppableId as FAQCategoryEnum;

    const newGroupedFAQs = { ...groupedFAQs };
    const [movedFAQ] = newGroupedFAQs[sourceCategory].splice(source.index, 1);

    movedFAQ.category = destCategory;

    newGroupedFAQs[destCategory].splice(destination.index, 0, movedFAQ);

    newGroupedFAQs[sourceCategory] = newGroupedFAQs[sourceCategory].map((faq, index) => ({
      ...faq,
      priority: index + 1,
    }));
    newGroupedFAQs[destCategory] = newGroupedFAQs[destCategory].map((faq, index) => ({
      ...faq,
      priority: index + 1,
    }));

    setGroupedFAQs(newGroupedFAQs);

    try {
      const updatedFAQs = [
        ...newGroupedFAQs[sourceCategory],
        ...newGroupedFAQs[destCategory],
      ];

      await updateFAQPriorities(updatedFAQs.map(faq => ({
        id: faq.id,
        category: faq.category,
        priority: faq.priority,
        question: faq.question,
        answer: faq.answer,
        status: faq.status,
        parkId: faq.parkId,
      })));

      message.success('FAQ order updated successfully');
    } catch (error) {
      console.error('Error updating FAQ priorities:', error);
      message.error('Failed to update FAQ order. Please try again.');
    }
  };
    const renderFAQCard = (faq: FAQResponse, index: number) => (
    <Draggable key={faq.id} draggableId={faq.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.5 : 1,
            marginBottom: '8px',
          }}
        >
          <Collapse
            items={[
              {
                key: faq.id,
                label: truncateQuestion(faq.question),
                children: (
                  <>
                    <p>{faq.answer}</p>
                    <p style={{ color: 'grey' }}><em>{getParkName(faq.parkId)}</em></p>

                    {(user?.role === StaffType.PARK_RANGER || user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) && (
                      <>
                        <Button
                          type="link"
                          icon={<RiEdit2Line />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/faq/${faq.id}/edit`);
                          }}
                          style={{ marginRight: 8 }}
                        />
                        <Button
                          type="link"
                          icon={<MdDeleteOutline style={{ color: '#ff4d4f' }} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(faq.id);
                          }}
                          danger
                        />
                      </>
                    )}
                    <Button
                      type="link"
                      icon={<RiEyeLine />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/faq/${faq.id}`);
                      }}
                    />
                  </>
                ),
              },
            ]}
          />
        </div>
      )}
    </Draggable>
  );

  const truncateQuestion = (question: string) => {
    const maxLength = 50;
    return question.length > maxLength ? `${question.substring(0, maxLength)}...` : question;
  };

  const paginatedCategories = useMemo(() => {
    const categories = Object.entries(groupedFAQs).filter(([_, faqs]) => faqs.length > 0);
    const startIndex = (currentPage - 1) * categoriesPerPage;
    return categories.slice(startIndex, startIndex + categoriesPerPage);
  }, [groupedFAQs, currentPage]);

   return (
    <>

        <Flex justify="space-between" align="center" style={{ marginBottom: '16px', marginTop: '16px' }}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search FAQs..."
          onChange={handleSearch}
          style={{
            flexGrow: 1,
            marginRight: (user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER || user?.role === StaffType.PARK_RANGER) ? '16px' : '0'
          }}
        />
        {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER || user?.role === StaffType.PARK_RANGER) && (
          <Button type="primary" onClick={() => navigate('/faq/create')}>
            Create FAQ
          </Button>
        )}
      </Flex>
      <Select
        mode="multiple"
        style={{ width: '100%', maxWidth: '100%', marginRight: '16px', marginBottom: '16px' }}
        placeholder="Filter by status"
        onChange={handleStatusFilter}
      >
        {Object.values(FAQStatusEnum).map((status) => (
          <Option key={status} value={status}>
            {formatEnumLabelToRemoveUnderscores(status)}
          </Option>
        ))}
      </Select>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Row gutter={[16, 16]}>
          {paginatedCategories.map(([category, categoryFaqs]) => (
            <Col xs={24} md={24} lg={8} key={category}>
              <Droppable droppableId={category}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <Card
                      title={formatCategoryName(category)}
                      bordered={false}
                      styles={{
                        header: {
                          backgroundColor: categoryColors[category as FAQCategoryEnum],
                          color: 'white'
                        }
                      }}
                    >
                      {categoryFaqs.map((faq, index) => renderFAQCard(faq, index))}
                      {provided.placeholder}
                    </Card>
                  </div>
                )}
              </Droppable>
            </Col>
          ))}
        </Row>
      </DragDropContext>
      <Pagination
        current={currentPage}
        total={Object.keys(groupedFAQs).filter(category => groupedFAQs[category as FAQCategoryEnum].length > 0).length}
        pageSize={categoriesPerPage}
        onChange={(page) => setCurrentPage(page)}
        style={{ marginTop: '16px', textAlign: 'center' }}
      />
    </>
  );
};


export default FAQTab;
