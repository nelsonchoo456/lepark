import React, { useState, useEffect } from 'react';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import {
  FeedbackResponse,
  getFeedbackById,
  viewStaffDetails,
  getParkById,
  deleteFeedback,
  VisitorResponse
} from '@lepark/data-access';
import { Card, Tag, Spin, Button, Image, Popconfirm, message, Modal } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { usePark } from '../../park-context/ParkContext';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import withParkGuard from '../../park-context/withParkGuard';

const formatEnumLabel = formatEnumLabelToRemoveUnderscores;

const getFeedbackStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return 'yellow';
    case 'ACCEPTED':
    case 'REJECTED':
      return 'green';
    default:
      return 'default';
  }
}

const getDisplayStatus = (status: string) => {
  if (status === 'ACCEPTED' || status === 'REJECTED') {
    return 'RESOLVED';
  }
  return status;
}

const FeedbackView: React.FC = () => {
  const { feedbackId = '' } = useParams();
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [parkName, setParkName] = useState<string>('');
  const { selectedPark } = usePark();
  const navigate = useNavigate();
  const { user } = useAuth<VisitorResponse>();
  const [isAccessDeniedModalVisible, setIsAccessDeniedModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState<any[]>([]);

  const fetchFeedbackDetails = async () => {
    try {
      const response = await getFeedbackById(feedbackId);
      setFeedback(response.data);

      // Check user permission
      if (user && response.data.visitorId !== user.id) {
        setIsAccessDeniedModalVisible(true);
        return null;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      message.error('Failed to fetch feedback details');
      return null;
    }
  };


  const fetchParkDetails = async (parkId: number) => {
    try {
      const response = await getParkById(parkId);
      if (response.data && response.data.name) {
        setParkName(response.data.name);
      }
    } catch (error) {
      console.error('Error fetching park details:', error);
      // Don't show error message as park name will fallback to 'Unknown'
    }
  };

  const processImages = (images: string[]) => {
    setFileList(images.map((url, index) => ({
      uid: `-${index}`,
      name: `image-${index}`,
      status: 'done',
      url: url,
    })));
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const feedbackData = await fetchFeedbackDetails();

        if (feedbackData) {
          // Parallel fetch for staff and park details
          const promises = [];

          if (feedbackData.parkId) {
            promises.push(fetchParkDetails(feedbackData.parkId));
          }

          if (feedbackData.images) {
            processImages(feedbackData.images);
          }

          await Promise.allSettled(promises);
        }
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [feedbackId]);

  const handleDelete = async () => {
    try {
      await deleteFeedback(feedbackId);
      message.success('Feedback deleted successfully');
      navigate(-1);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      message.error('Failed to delete feedback');
    }
  };

  const handleAccessDeniedOk = () => {
    setIsAccessDeniedModalVisible(false);
    navigate('/');
  };

  if (loading) {
    return (
      <ContentWrapperDark>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </ContentWrapperDark>
    );
  }

  if (!feedback) {
    return <div>Feedback not found</div>;
  }


  if (!feedback) {
    return <div>Feedback not found</div>;
  }

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      <ParkHeader cardClassName="h-30 md:h-[160px]">
        <div className="flex w-full md:text-center md:mx-auto md:block md:w-auto">
          <div className="flex-1 font-medium text-2xl md:text-3xl">
            {'Feedback Details'}
          </div>
        </div>
      </ParkHeader>
      <div className="flex-grow overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/feedback')}
          >
            Back
          </Button>
          <div>
            {feedback.feedbackStatus === 'PENDING' && (
              <>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  style={{ marginRight: '8px' }}
                  onClick={() => navigate(`/feedback/edit/${feedbackId}`)}
                >

                </Button>
                <Popconfirm
                  title="Are you sure you want to delete this feedback?"
                  onConfirm={handleDelete}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                  >

                  </Button>
                </Popconfirm>
              </>
            )}
          </div>
        </div>
        <Card>
          <h1 className="text-xl font-semibold text-green-500">{feedback.title}</h1>

          <div className="mt-4">
  <p><strong>Status:</strong> <Tag color={getFeedbackStatusColor(feedback.feedbackStatus)}>
    {formatEnumLabel(getDisplayStatus(feedback.feedbackStatus))}
  </Tag></p>

  {feedback.dateResolved && (
    <p><strong>Date Resolved:</strong> {new Date(feedback.dateResolved).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</p>
  )}
  <p><strong>Category:</strong> {formatEnumLabel(feedback.feedbackCategory)}</p>
  {feedback.needResponse && (
    <p className="italic text-green-500">You have requested for a response. NParks will get back to you soon via email.</p>
  )}
  <br/>
  <p><strong>Date Created:</strong> {new Date(feedback.dateCreated).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</p>
  <p><strong>Park:</strong> {parkName || 'Unknown'}</p>
</div>

          {fileList.length > 0 && (
            <div className="mt-4">
              <p><strong>Images:</strong></p>
              <div className="grid grid-cols-2 gap-2">
                {fileList.map((file, index) => (
                  <div key={file.uid} className="aspect-square relative group">
                    <img
                      src={file.url}
                      alt={`Feedback image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50">
                      <EyeOutlined
                        className="text-white text-2xl cursor-pointer"
                        onClick={() => {
                          setPreviewImage(file.url);
                          setPreviewVisible(true);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p><strong>Description:</strong> {feedback.description}</p>
        </Card>
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
        <p>You do not have permission to view this feedback.</p>
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

export default withParkGuard(FeedbackView);
