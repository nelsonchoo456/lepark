import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@lepark/common-ui';
import { Form, Input, Select, Button, Upload, message, Result, Spin, Modal, Image, Checkbox } from 'antd';
import { UploadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { usePark } from '../../park-context/ParkContext';
import { VisitorResponse, FeedbackData, updateFeedback, FeedbackCategoryEnum, FeedbackStatusEnum, getFeedbackById, FeedbackResponse } from '@lepark/data-access';
import withParkGuard from '../../park-context/withParkGuard';
const { TextArea } = Input;
const { Option } = Select;

const uploadStyles = {
  '.ant-upload-list-picture-card': {
    display: 'flex',
    flexWrap: 'wrap',
  },
  '.ant-upload-list-picture-card-container': {
    width: '48%',
    margin: '1%',
  },
  '.ant-upload-select': {
    width: '48%',
    margin: '1%',
  },
};

const FeedbackEdit = () => {
  const navigate = useNavigate();
  const { feedbackId } = useParams<{ feedbackId: string }>();
  const { user } = useAuth<VisitorResponse>();
  const { selectedPark } = usePark();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [isAccessDeniedModalVisible, setIsAccessDeniedModalVisible] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    const fetchFeedback = async () => {
      if (feedbackId) {
        try {
          const response = await getFeedbackById(feedbackId);
          setFeedback(response.data);

          if (user && (response.data.visitorId !== user.id || response.data.feedbackStatus !== FeedbackStatusEnum.PENDING)) {
            setIsAccessDeniedModalVisible(true);
            return;
          }

          form.setFieldsValue({
            title: response.data.title,
            description: response.data.description,
            feedbackCategory: response.data.feedbackCategory,
            needResponse: response.data.needResponse,
          });
          if (response.data.images) {
            setFileList(response.data.images.map((url, index) => ({
              uid: `-${index}`,
              name: `image-${index}`,
              status: 'done',
              url: url,
            })));
          }
        } catch (error) {
          console.error('Error fetching feedback:', error);
          message.error('Failed to load feedback data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFeedback();
  }, [feedbackId, form, user]);

  const handleChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  const handlePreview = async (file: any) => {
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  const handleCancel = () => setPreviewVisible(false);

  const onFinish = async (values: FeedbackData) => {
    if (!user || !feedback) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedFeedbackData: FeedbackData = {
        ...feedback,
        title: values.title,
        description: values.description,
        feedbackCategory: values.feedbackCategory,
        needResponse: values.needResponse,
        images: fileList.filter(file => file.url).map(file => file.url),
      };

      const newFiles = fileList.filter(file => file.originFileObj).map(file => file.originFileObj);

      const response = await updateFeedback(feedbackId!, updatedFeedbackData, newFiles);
      console.log('Feedback updated:', response.data);
      message.success('Feedback updated successfully');
      navigate(`/feedback/${feedbackId}`);
    } catch (error) {
      console.error('Error updating feedback:', error);
      message.error('Failed to update feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccessDeniedOk = () => {
    setIsAccessDeniedModalVisible(false);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      <ParkHeader cardClassName="h-30 md:h-[160px]">
        <div className="flex w-full md:text-center md:mx-auto md:block md:w-auto">
          <div className="flex-1 font-medium text-2xl md:text-3xl">Edit Feedback</div>
        </div>
      </ParkHeader>

      <div className="flex-grow p-4 overflow-y-auto">
        {user && feedback && feedback.visitorId === user.id && feedback.feedbackStatus === FeedbackStatusEnum.PENDING ? (
          <Form
            form={form}
            name="feedback"
            onFinish={onFinish}
            layout="vertical"
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
              name="needResponse"
              valuePropName="checked"
            >
              <Checkbox>I would like a response to my feedback</Checkbox>
            </Form.Item>

            <Form.Item label="Images">
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleChange}
                onPreview={handlePreview}
                beforeUpload={() => false}
              >
                {fileList.length >= 8 ? null : (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <p className="text-gray-500 italic">You are editing feedback for {selectedPark?.name}</p>
            <br/>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Update Feedback
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Result
            status="warning"
            title="Access Denied"
            subTitle="You do not have permission to edit this feedback."
            extra={
              <Button type="primary" onClick={() => navigate('/')}>
                Go to Home
              </Button>
            }
          />
        )}
      </div>

      <Modal
        title="Access Denied"
        visible={isAccessDeniedModalVisible}
        onOk={handleAccessDeniedOk}
        onCancel={handleAccessDeniedOk}
        footer={[
          <Button key="ok" type="primary" onClick={handleAccessDeniedOk}>
            OK
          </Button>,
        ]}
      >
        <p>You do not have permission to edit this feedback.</p>
      </Modal>

      <Image
        style={{ display: 'none' }}
        src={previewImage}
        preview={{
          visible: previewVisible,
          onVisibleChange: (visible) => {
            setPreviewVisible(visible);
          },
        }}
      />
    </div>
  );
};

export default FeedbackEdit;
