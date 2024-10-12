import React, { useState, useEffect } from 'react';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
import {
  FAQCategoryEnum,
  FAQStatusEnum,
  updateFAQ,
  FAQUpdateData,
  StaffResponse,
  ParkResponse,
  StaffType,
} from '@lepark/data-access';
import { Button, Card, Form, Input, Select, message, Result, Spin, InputNumber, Divider } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { useRestrictFAQs } from '../../hooks/FAQ/useRestrictFAQs';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';

const { TextArea } = Input;
const { Option } = Select;

const formatEnumLabel = formatEnumLabelToRemoveUnderscores;

const FAQEdit: React.FC = () => {
  const { faqId = '' } = useParams();
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const navigate = useNavigate();
  const [updatedFAQ, setUpdatedFAQ] = useState<any | null>();
  const { user } = useAuth<StaffResponse>();
  const { faq, loading: faqLoading } = useRestrictFAQs(faqId);
  const { parks, loading: parksLoading } = useFetchParks();
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);

  const [form] = Form.useForm();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [updatedFAQQuestion, setUpdatedFAQQuestion] = useState('');
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
    if (faq) {
      form.setFieldsValue({
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
        status: faq.status,
        priority: faq.priority,
        parkId: faq.parkId || -1,
      });
      setSelectedParkId(faq.parkId || null);
    }
  }, [faq, form]);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const faqData: FAQUpdateData = {
        category: values.category,
        question: values.question,
        answer: values.answer,
        status: values.status,
        priority: values.priority,
      };

      if (values.parkId && values.parkId !== -1) {
        faqData.parkId = values.parkId;
      }

      const response = await updateFAQ(faqId, faqData);
      setUpdatedFAQ(response.data);
      setUpdatedFAQQuestion(values.question);
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error updating FAQ:', error);
      message.error('Failed to update FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParkChange = (value: number) => {
    setSelectedParkId(value);
  };

  const breadcrumbItems = [
    { title: 'FAQ Management', pathKey: '/faq', isMain: false },
    { title: 'Edit FAQ', pathKey: `/faq/edit/${faqId}`, isMain: true, isCurrent: true },
  ];

  if (faqLoading || parksLoading) {
    return (
      <ContentWrapperDark>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </ContentWrapperDark>
    );
  }

  if (!faq) {
    return null; // This will not be rendered as the hook will redirect unauthorized access
  }

  const userPark = parks.find(park => park.id === user?.parkId);

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
                  <Option key={-1} value={-1}>All Parks</Option>
                  {parks.map((park) => (
                    <Option key={park.id} value={park.id}>
                      {park.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            ) : (
              <Form.Item label="Park">
                {userPark ? userPark.name : 'No park assigned'}
              </Form.Item>
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
            <Form.Item name="question" label="Question" rules={[{ required: true, message: 'Please enter a question' }]}>
              <Input placeholder="Enter question" />
            </Form.Item>
            <Form.Item name="answer" label="Answer" rules={[{ required: true, message: 'Please enter an answer' }]}>
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
            <Form.Item
              name="priority"
              label="Priority"
              rules={[
                { type: 'number', min: 1, message: 'Priority must be a number greater than or equal to 1' },
                { required: true, message: 'Please enter a priority' }
              ]}
            >
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item label={" "} colon={false}>
              <Button type="primary" htmlType="submit" loading={isSubmitting} className="w-full">
                Update FAQ
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Result
            status="success"
            title="Updated FAQ"
            subTitle={updatedFAQQuestion && <>Question: {updatedFAQQuestion}</>}
            extra={[
              <Button key="back" onClick={() => navigate('/faq')}>
                Back to FAQ Management
              </Button>,
              <Button type="primary" key="view" onClick={() => navigate(`/faq/${faqId}`)}>
                View Updated FAQ
              </Button>,
            ]}
          />
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default FAQEdit;
