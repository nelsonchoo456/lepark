import React, { useState, useEffect, useRef } from 'react';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
import {
  FAQCategoryEnum,
  FAQStatusEnum,
  createFAQ,
  FAQCreateData,
  StaffResponse,
  ParkResponse,
  getAllParks,
  StaffType,
} from '@lepark/data-access';
import { Button, Card, Form, Input, Select, message, Result, Spin, InputNumber, Divider, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const { TextArea } = Input;
const { Option } = Select;

const formatEnumLabel = formatEnumLabelToRemoveUnderscores;

const FAQCreate: React.FC = () => {
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const navigate = useNavigate();
  const [createdFAQ, setCreatedFAQ] = useState<any | null>();
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(true);
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);
  const notificationShown = useRef(false);

  const [form] = Form.useForm();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [createdFAQQuestion, setCreatedFAQQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWebMode(window.innerWidth >= SCREEN_LG);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchParks = async () => {
      try {
        const parksResponse = await getAllParks();
        setParks(parksResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching parks:', error);
        message.error('Failed to fetch parks');
        setLoading(false);
      }
    };

    fetchParks();
  }, []);

  useEffect(() => {
    // Check if the user has permission to create FAQs
    if (user?.role !== StaffType.SUPERADMIN && user?.role !== StaffType.PARK_RANGER && user?.role !== StaffType.MANAGER) {
      if (!notificationShown.current) {
        notification.error({
          message: 'Access Denied',
          description: 'You do not have permission to access this resource.',
        });
        notificationShown.current = true;
      }
      navigate('/faq');
    }
  }, [user, navigate]);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const faqData: FAQCreateData = {
        category: values.category,
        question: values.question,
        answer: values.answer,
        status: values.status,
        priority: 0, // Set default priority value
      };

      if (user?.role === StaffType.SUPERADMIN) {
        if (values.parkId && values.parkId !== -1) {
          faqData.parkId = values.parkId;
        }
      } else {
        // For PARK_RANGER and MANAGER, always set their parkId
        faqData.parkId = user?.parkId;
      }

      const response = await createFAQ(faqData);
      setCreatedFAQ(response.data);
      setCreatedFAQQuestion(values.question);
      setShowSuccessAlert(true);
      form.resetFields();
    } catch (error) {
      console.error('Error creating FAQ:', error);
      message.error('Failed to create FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParkChange = (value: number) => {
    setSelectedParkId(value);
  };

  const breadcrumbItems = [
    { title: 'FAQ Management', pathKey: '/faq', isMain: false },
    { title: 'Create FAQ', pathKey: '/faq/create', isMain: true, isCurrent: true },
  ];

  if (loading) {
    return (
      <ContentWrapperDark>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </ContentWrapperDark>
    );
  }

  const userPark = parks.find((park) => park.id === user?.parkId);

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {!showSuccessAlert ? (
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="horizontal"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: '600px', margin: '0 auto' }}
          >
            <Divider orientation="left">Select Park</Divider>
            {user?.role === StaffType.SUPERADMIN ? (
              <Form.Item name="parkId" label="Park" rules={[{ required: true, message: 'Please select a park!' }]}>
                <Select placeholder="Select a park" onChange={handleParkChange}>
                  <Option key={-1} value={-1}>
                    All Parks
                  </Option>
                  {parks.map((park) => (
                    <Option key={park.id} value={park.id}>
                      {park.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            ) : (
              <Form.Item label="Park">{userPark ? userPark.name : 'No park assigned'}</Form.Item>
            )}
            <Divider orientation="left">FAQ Details</Divider>
            <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Please select a category' }]}>
              <Select placeholder="Select category">
                {Object.values(FAQCategoryEnum).map((category) => (
                  <Option key={category} value={category}>
                    {formatEnumLabel(category)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="question"
              label="Question"
              rules={[
                { required: true, message: 'Please enter a question' },
                { min: 3, message: 'Question must be at least 3 characters long' },
              ]}
            >
              <Input placeholder="Enter question" />
            </Form.Item>
            <Form.Item
              name="answer"
              label="Answer"
              rules={[
                { required: true, message: 'Please enter an answer' },
                { min: 3, message: 'Answer must be at least 3 characters long' },
              ]}
            >
              <TextArea placeholder="Enter answer" autoSize={{ minRows: 3, maxRows: 5 }} />
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select a status' }]}>
              <Select placeholder="Select status">
                {Object.values(FAQStatusEnum).map((status) => (
                  <Option key={status} value={status}>
                    {formatEnumLabel(status)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={' '} colon={false}>
              <Button type="primary" htmlType="submit" loading={isSubmitting} className="w-full">
                Create FAQ
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Result
            status="success"
            title="Created new FAQ"
            subTitle={createdFAQQuestion && <>Question: {createdFAQQuestion}</>}
            extra={[
              <Button key="back" onClick={() => navigate('/faq')}>
                Back to FAQ Management
              </Button>,
              <Button type="primary" key="view" onClick={() => navigate(`/faq/${createdFAQ?.id}`)}>
                View new FAQ
              </Button>,
            ]}
          />
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default FAQCreate;
