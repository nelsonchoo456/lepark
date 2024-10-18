import React, { useState, useEffect } from 'react';
import { ContentWrapperDark } from '@lepark/common-ui';
import { FeedbackResponse, getFeedbackById, viewStaffDetails, getParkById, ParkResponse } from '@lepark/data-access';
import { Card, Tag, Spin, Button, Image } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { usePark } from '../../park-context/ParkContext';
import { ArrowLeftOutlined } from '@ant-design/icons';

const formatEnumLabel = formatEnumLabelToRemoveUnderscores;

const getFeedbackStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return 'yellow';
    case 'RESOLVED':
      return 'green';
    case 'REJECTED':
      return 'red';
    default:
      return 'default';
  }
}

const FeedbackView: React.FC = () => {
  const { feedbackId = '' } = useParams();
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedByStaff, setResolvedByStaff] = useState<string>('');
  const [parkName, setParkName] = useState<string>('');
  const { selectedPark } = usePark();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const feedbackResponse = await getFeedbackById(feedbackId);
        setFeedback(feedbackResponse.data);

        if (feedbackResponse.data.staffId) {
          const staffResponse = await viewStaffDetails(feedbackResponse.data.staffId);
          setResolvedByStaff(`${staffResponse.data.firstName} ${staffResponse.data.lastName}`);
        }

        if (feedbackResponse.data.parkId) {
          const parkResponse = await getParkById(feedbackResponse.data.parkId);
          setParkName(parkResponse.data.name);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [feedbackId]);

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
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: '1rem' }}
        >
          Back
        </Button>
        <Card>
          <h1 className="text-xl font-semibold text-green-500">{feedback.title}</h1>


 <div className="mt-4">
            <p><strong>Status:</strong> <Tag color={getFeedbackStatusColor(feedback.feedbackStatus)}>{formatEnumLabel(feedback.feedbackStatus)}</Tag></p>
            <p><strong>Category:</strong> {formatEnumLabel(feedback.feedbackCategory)}</p>
            <p><strong>Date Created:</strong> {new Date(feedback.dateCreated).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</p>
            <p><strong>Park:</strong> {parkName || 'Unknown'}</p>

            {feedback.dateResolved && (
              <p><strong>Date Resolved:</strong> {new Date(feedback.dateResolved).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</p>
            )}

            {resolvedByStaff && (
              <p><strong>Resolved By:</strong> {resolvedByStaff}</p>
            )}

            {feedback.remarks && (
              <p><strong>Remarks:</strong> {feedback.remarks}</p>
            )}
          </div>
          {feedback.images && feedback.images.length > 0 && (
            <div className="mt-4">
              <p><strong>Images:</strong></p>
              <Image.PreviewGroup>
                {feedback.images.map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`Feedback image ${index + 1}`}
                    style={{ width: 200, height: 200, objectFit: 'cover', marginRight: 8, marginBottom: 8 }}
                  />
                ))}
              </Image.PreviewGroup>
            </div>
          )}

<p><strong>Description:</strong> {feedback.description}</p>

        </Card>
      </div>
    </div>
  );
};

export default FeedbackView;
