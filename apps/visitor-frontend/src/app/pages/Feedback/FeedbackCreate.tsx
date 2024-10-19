import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@lepark/common-ui';
import { Form, Input, Select, Button, Upload, message, Result } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { usePark } from '../../park-context/ParkContext';
import { VisitorResponse, FeedbackData, createFeedback, FeedbackCategoryEnum, FeedbackStatusEnum } from '@lepark/data-access';

const { TextArea } = Input;
const { Option } = Select;

const FeedbackCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth<VisitorResponse>();
  const { selectedPark } = usePark();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpload = ({ fileList }: any) => {
    setFileList(fileList);
  };

  const onFinish = async (values: FeedbackData) => {
    if (!user) {
      return;
    }

    setIsSubmitting(true);
    try {
      const feedbackData: FeedbackData = {
        title: values.title,
        description: values.description,
        feedbackCategory: values.feedbackCategory,
        images: [],
        feedbackStatus: FeedbackStatusEnum.PENDING,
        visitorId: user.id,
        parkId: selectedPark?.id || 0,
      };

      // Convert fileList to File array
      const files = fileList.map((file) => file.originFileObj);

      const response = await createFeedback(feedbackData, files);
      console.log('Feedback created:', response.data);
      message.success('Feedback submitted successfully');
      navigate('/feedback'); // Adjust this route as needed
    } catch (error) {
      console.error('Error creating feedback:', error);
      message.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      <ParkHeader cardClassName="h-30 md:h-[160px]">
        <div className="flex w-full md:text-center md:mx-auto md:block md:w-auto">
          <div className="flex-1 font-medium text-2xl md:text-3xl">Submit Feedback</div>
        </div>
      </ParkHeader>

      <div className="flex-grow p-4 overflow-y-auto">
        {user ? (
          <Form
            form={form}
            name="feedback"
            onFinish={onFinish}
            layout="vertical"
            initialValues={{
              visitorId: user.id,
              parkId: selectedPark?.id,
              feedbackStatus: 'OPEN',
            }}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please input the title!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please input the description!' }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="feedbackCategory"
              label="Feedback Category"
              rules={[{ required: true, message: 'Please select a category!' }]}
            >
              <Select>
                {Object.entries(FeedbackCategoryEnum).map(([key, value]) => (
                  <Option key={key} value={value}>
                    {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="images"
              label="Images"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                  return e;
                }
                return e && e.fileList;
              }}
            >
              <Upload
                listType="picture"
                fileList={fileList}
                onChange={handleUpload}
                beforeUpload={() => false}
                accept="image/png, image/jpeg"
              >
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            </Form.Item>

            <p className="text-gray-500 italic">You are submitting feedback for {selectedPark?.name}</p>
<br/>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Submit Feedback
              </Button>
            </Form.Item>
          </Form>

        ) : (
          <Result
            status="warning"
            title="Login Required"
            subTitle="You must log in to leave feedback!"
            extra={
              <Button type="primary" onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default FeedbackCreate;
