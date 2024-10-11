import React, { useEffect, useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { FAQResponse, getAllFAQs, updateFAQPriorities, deleteFAQ } from '@lepark/data-access';
import { Card, message, Input, Button, Collapse, Row, Col, Modal, Pagination, Flex } from 'antd';
import { FiSearch } from 'react-icons/fi';
import { RiEdit2Line } from 'react-icons/ri';
import { MdDeleteOutline } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAuth, ContentWrapperDark } from '@lepark/common-ui';
import PageHeader2 from '../../components/main/PageHeader2';

const { Panel } = Collapse;

const FAQList: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQResponse[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [faqToBeDeleted, setFaqToBeDeleted] = useState<FAQResponse | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const navigate = useNavigate();
  const { user } = useAuth();

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
      messageApi.error('Failed to fetch FAQs');
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

    // Update priority values based on new order
    const updatedFAQs = reorderedFAQs.map((faq, index) => ({
      ...faq,
      priority: index + 1,
    }));

    updateListState(source.droppableId, updatedFAQs);

    // Update position in the backend
    try {
      await updateFAQPriorities(updatedFAQs);
      messageApi.success('FAQ priorities updated successfully');
    } catch (error) {
      console.error('Error updating FAQ priorities:', error);
      messageApi.error('Failed to update FAQ priorities');
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredFAQs = useMemo(() => {
    return faqs.filter((faq) => faq.question.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, faqs]);

  const handleDelete = async () => {
    if (!faqToBeDeleted) return;
    try {
      await deleteFAQ(faqToBeDeleted.id);
      fetchFAQs();
      setFaqToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.success('FAQ deleted successfully');
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      messageApi.error('Failed to delete FAQ');
    }
  };

  const formatCategoryName = (category: string) => {
    return category
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const categoryColors: { [key: string]: string } = {
    GENERAL: '#4a90e2',
    PARK_RULES: '#7ed321',
    FACILITIES: '#f8e71c',
    EVENTS: '#bd10e0',
    SAFETY: '#d0021b',
    ACCESSIBILITY: '#50e3c2',
    SERVICES: '#9013fe',
    TICKETING: '#4a90e2',
    PARK_HISTORY: '#f5a623',
    OTHER: '#b8e986',
  };

  const renderFAQCard = (faq: FAQResponse) => (
    <Collapse>
      <Panel header={truncateQuestion(faq.question)} key={faq.id}>
        <p>{faq.answer}</p>
        <Button
          type="link"
          icon={<RiEdit2Line />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/faqs/edit/${faq.id}`);
          }}
          style={{ marginRight: 8 }}
        />
        <Button
          type="link"
          icon={<MdDeleteOutline style={{ color: '#ff4d4f' }} />}
          onClick={(e) => {
            e.stopPropagation();
            setFaqToBeDeleted(faq);
            setDeleteModalOpen(true);
          }}
          danger
        />
      </Panel>
    </Collapse>
  );

  const truncateQuestion = (question: string) => {
    const maxLength = 50;
    return question.length > maxLength ? `${question.substring(0, maxLength)}...` : question;
  };

  const breadcrumbItems = [
    {
      title: 'FAQ Management',
      pathKey: '/faqs',
      isMain: true,
      isCurrent: true,
    },
  ];

  const handleCategoryClick = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const itemsPerPage = 5;

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Flex justify="end" gap={10}>
        <Input suffix={<FiSearch />} placeholder="Search FAQs..." onChange={handleSearch} style={{ marginBottom: '16px' }} />
        <Button type="primary" onClick={() => navigate('/faq/create')} style={{ marginBottom: '16px' }}>
          Create FAQ
        </Button>
      </Flex>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Row gutter={16}>
          {categories.map((category) => (
            <Col span={expandedCategory === category ? 24 : 8} key={category}>
              <Droppable droppableId={category}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} style={{ marginBottom: '16px' }}>
                    <Card
                      title={formatCategoryName(category)}
                      bordered={false}
                      headStyle={{ backgroundColor: categoryColors[category], color: 'white' }}
                    //   onClick={(e) => handleCategoryClick(category, e)}
                    >
                      {getList(category)
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((faq, index) => (
                          <Draggable key={faq.id} draggableId={faq.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.5 : 1,
                                }}
                              >
                                {renderFAQCard(faq)}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                      {getList(category).length > 10 && (
                        <Pagination
                          current={currentPage}
                          pageSize={itemsPerPage}
                          total={getList(category).length}
                          onChange={handlePageChange}
                          style={{ marginTop: '16px', textAlign: 'center' }}
                        />
                      )}
                    </Card>
                  </div>
                )}
              </Droppable>
            </Col>
          ))}
        </Row>
      </DragDropContext>
      <Modal title="Confirm Delete" open={deleteModalOpen} onOk={handleDelete} onCancel={() => setDeleteModalOpen(false)}>
        <p>Are you sure you want to delete this FAQ?</p>
      </Modal>
    </ContentWrapperDark>
  );
};

export default FAQList;