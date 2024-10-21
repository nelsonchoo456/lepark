import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { Descriptions, Card, Button, Input, Tooltip, Tag, message, Select, Spin, Image } from 'antd';
import { RiEdit2Line, RiArrowLeftLine } from 'react-icons/ri';
import type { DescriptionsProps } from 'antd';
import { useEffect, useState } from 'react';
import {
  FeedbackResponse,
  StaffResponse,
  StaffType,
  FeedbackUpdateData,
  updateFeedback,
  FeedbackCategoryEnum,
  FeedbackStatusEnum
} from '@lepark/data-access';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import { useRestrictFeedbacks } from '../../hooks/Feedback/useRestrictFeedbacks';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

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

const initialFeedback: FeedbackResponse = {
  id: '',
  title: '',
  description: '',
  feedbackCategory: FeedbackCategoryEnum.STAFF,
  feedbackStatus: FeedbackStatusEnum.PENDING,
  images: [],
  dateCreated: '',
  dateResolved: null,
  remarks: null,
  staffId: null,
  visitorId: '',
  visitor: {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    isVerified: false
  },
  staff: undefined,
  parkId: 0,
};

const formatEnumLabel = (enumValue: string): string => {
  const withoutUnderscores = enumValue.replace(/_/g, ' ').toLowerCase();
  return withoutUnderscores.charAt(0).toUpperCase() + withoutUnderscores.slice(1);
};

const FeedbackViewDetails = () => {
  const { feedbackId = '' } = useParams();
  const { user } = useAuth<StaffResponse>();
  const { feedback, loading, park, refreshFeedback } = useRestrictFeedbacks(feedbackId);
  const [inEditMode, setInEditMode] = useState(false);
  const [editedFeedback, setEditedFeedback] = useState<FeedbackResponse>(initialFeedback);
  const navigate = useNavigate();
  const formatEnumLabel = (enumValue: string): string => {
  const withoutUnderscores = enumValue.replace(/_/g, ' ').toLowerCase();
  return withoutUnderscores.charAt(0).toUpperCase() + withoutUnderscores.slice(1);
};

  useEffect(() => {
    if (!loading && feedback) {
      setEditedFeedback(feedback);
    }
  }, [loading, feedback]);

  const toggleEditMode = () => {
    if (inEditMode && feedback) {
      setEditedFeedback(feedback); // Reset changes if canceling edit
    }
    setInEditMode(!inEditMode);
  };

  const handleInputChange = (key: string, value: any) => {
    setEditedFeedback((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (!user) {
        throw new Error('User not found.');
      }

      const updatedFeedbackDetails: FeedbackUpdateData = {
        feedbackCategory: editedFeedback.feedbackCategory,
        feedbackStatus: editedFeedback.feedbackStatus,
        remarks: editedFeedback.remarks,
      };



      // Add logic for updating staff when resolving or rejecting feedback
      if ((feedback?.feedbackStatus !== FeedbackStatusEnum.RESOLVED &&
          editedFeedback.feedbackStatus === FeedbackStatusEnum.RESOLVED) ||
          (feedback?.feedbackStatus !== FeedbackStatusEnum.REJECTED &&
          editedFeedback.feedbackStatus === FeedbackStatusEnum.REJECTED)) {
        if (!editedFeedback.remarks || editedFeedback.remarks.trim() === '') {
          throw new Error('Remarks cannot be blank when resolving or rejecting feedback.');
        }
        updatedFeedbackDetails.staffId = user.id;
        updatedFeedbackDetails.dateResolved = new Date().toISOString();
      }

      await updateFeedback(feedbackId, updatedFeedbackDetails);
      message.success('Feedback updated successfully!');
      setInEditMode(false);
      refreshFeedback();
    } catch (error: any) {
      console.error(error);
      message.error(error.message || 'Failed to update feedback.');
    }
  };

  const descriptionsItems: DescriptionsProps['items'] = [
      {
      key: 'title',
      label: 'Title',
      children: feedback?.title,
      span: 3,
    },
    {
      key: 'description',
      label: 'Description',
      children: feedback?.description,
      span: 3,
    },
   {
      key: 'category',
      label: 'Category',
      children: inEditMode ? (
        <Select
          value={editedFeedback.feedbackCategory}
          onChange={(value) => handleInputChange('feedbackCategory', value)}
          style={{ width: '100%' }}
        >
          {Object.values(FeedbackCategoryEnum).map((category) => (
            <Select.Option key={category} value={category}>
              {formatEnumLabel(category)}
            </Select.Option>
          ))}
        </Select>
      ) : <Tag>{formatEnumLabel(feedback?.feedbackCategory ?? '')}</Tag>,
      span: 1,
    },
    {
      key: 'status',
      label: 'Status',
      children: inEditMode ? (
        <Select
          value={editedFeedback.feedbackStatus}
          onChange={(value) => handleInputChange('feedbackStatus', value)}
          style={{ width: '100%' }}
        >
          {Object.values(FeedbackStatusEnum).map((status) => (
            <Select.Option key={status} value={status}>
              {formatEnumLabel(status)}
            </Select.Option>
          ))}
        </Select>
      ) :   (
        <Tag color={getFeedbackStatusColor(feedback?.feedbackStatus ?? '')}>
          {formatEnumLabel(feedback?.feedbackStatus ?? '')}
        </Tag>
      ),
      span: 1,
    },
    {
      key: 'dateCreated',
      label: 'Date Created',
      children: new Date(feedback?.dateCreated || '').toLocaleString(),
      span: 1,
    },



    {
      key: 'dateResolved',
      label: 'Date Resolved',
      children: feedback?.dateResolved ? new Date(feedback.dateResolved).toLocaleString() : 'Not resolved yet',
      span: 1,
    },
    {
      key: 'park',
      label: 'Park',
      children: park?.name,
      span: 1,
    },
    {
      key: 'resolvedBy',
      label: 'Resolved By',
      children: feedback?.staff ? `${feedback.staff.firstName} ${feedback.staff.lastName}` : 'Not resolved',
      span: 1,
    },
      {
      key: 'visitorName',
      label: 'Visitor Name',
      children: `${feedback?.visitor.firstName} ${feedback?.visitor.lastName}`,
      span: 1,
    },
    {
      key: 'visitorEmail',
      label: 'Visitor Email',
      children: `${feedback?.visitor.email}`,
      span: 2,
    },
    {
      key: 'remarks',
      label: 'Remarks',
      children: inEditMode ? (
        <Input.TextArea
          value={editedFeedback.remarks || ''}
          onChange={(e) => handleInputChange('remarks', e.target.value)}
          placeholder="This will be visible to the visitor who submitted feedback. Ensure remarks are updated before resolving or rejecting."
        />
      ) : feedback?.remarks || 'No remarks',
      span: 3,
    },
      ...(feedback?.images && feedback.images.length > 0
      ? [
          {
            key: 'images',
            label: 'Images',
            children: (
              <div className="flex flex-wrap gap-2">
                {feedback.images.map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`Feedback image ${index + 1}`}
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover' }}
                  />
                ))}
              </div>
            ),
            span: 3,
          },
        ]
      : []),
  ];

  const breadcrumbItems = [
    {
      title: "Feedback Management",
      pathKey: '/feedback',
      isMain: true,
    },
    {
      title: feedback ? feedback.title : "Feedback Details",
      pathKey: `/feedback/${feedbackId}`,
      isCurrent: true
    },
  ];

  if (loading) {
    return (
      <ContentWrapperDark>
        <Card>
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </Card>
      </ContentWrapperDark>
    );
  }

  if (!feedback) {
    return null; // This will not be rendered as the hook will redirect unauthorized access
  }

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems}/>
      <Card>
        <Descriptions
          items={descriptionsItems}
          bordered
          column={3}
          size="middle"
          title={
            <div className="w-full flex justify-between">
              {!inEditMode ? (
                <>
                  <div>{feedback.title}</div>
                  {(user?.role === StaffType.PARK_RANGER || user?.role === StaffType.MANAGER || user?.role === StaffType.SUPERADMIN) && (
                    <Button icon={<RiEdit2Line className="text-lg" />} type="text" onClick={toggleEditMode} />
                  )}
                </>
              ) : (
                <>
                  <Button icon={<RiArrowLeftLine className="text-lg" />} type="text" onClick={toggleEditMode}>
                    Return
                  </Button>
                  <div className="text-secondary">Edit Feedback</div>
                  <Button type="primary" onClick={handleSave}>
                    Save
                  </Button>
                </>
              )}
            </div>
          }
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default FeedbackViewDetails;
