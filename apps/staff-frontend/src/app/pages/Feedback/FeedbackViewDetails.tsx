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
  FeedbackStatusEnum,
} from '@lepark/data-access';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import { useRestrictFeedbacks } from '../../hooks/Feedback/useRestrictFeedbacks';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { MailOutlined } from '@ant-design/icons';

const getFeedbackStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'yellow';
    case 'ACCEPTED':
      return 'green';
    case 'REJECTED':
      return 'red';
    default:
      return 'default';
  }
};

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
  resolvedStaffId: null,
  visitorId: '',
  visitor: {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    isVerified: false,
  },
  resolvedStaff: undefined,
  parkId: 0,
  needResponse: false,
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
  const handleCreatePlantTask = () => {
    if (feedback?.feedbackCategory === FeedbackCategoryEnum.WILDLIFE) {
      navigate('/plant-tasks/create', {
        state: {
          title: feedback?.title,
          description: feedback?.description,
          images: feedback?.images,
          parkId: feedback?.parkId,
        },
      });
    }
  };

  const handleCreateMaintenanceTask = () => {
    navigate('/maintenance-tasks/create', {
      state: {
        title: feedback?.title,
        description: feedback?.description,
        images: feedback?.images,
        parkId: feedback?.parkId,
      },
    });
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

      // Check if the status has changed to ACCEPTED or REJECTED
      if (
        (feedback?.feedbackStatus !== FeedbackStatusEnum.ACCEPTED && editedFeedback.feedbackStatus === FeedbackStatusEnum.ACCEPTED) ||
        (feedback?.feedbackStatus !== FeedbackStatusEnum.REJECTED && editedFeedback.feedbackStatus === FeedbackStatusEnum.REJECTED)
      ) {
        updatedFeedbackDetails.resolvedStaffId = user.id;
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
      key: 'remarks',
      label: 'Remarks',
      children: inEditMode ? (
        <Input.TextArea value={editedFeedback.remarks || ''} onChange={(e) => handleInputChange('remarks', e.target.value)} />
      ) : (
        feedback?.remarks || 'No remarks'
      ),
      span: 3, // Add this line to make remarks span full width
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
      ) : (
        <Tag>{formatEnumLabel(feedback?.feedbackCategory ?? '')}</Tag>
      ),
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
      ) : (
        <Tag color={getFeedbackStatusColor(feedback?.feedbackStatus ?? '')}>{formatEnumLabel(feedback?.feedbackStatus ?? '')}</Tag>
      ),
    },
    {
      key: 'dateCreated',
      label: 'Date Created',
      children: new Date(feedback?.dateCreated || '').toLocaleString(),
    },
    {
      key: 'dateResolved',
      label: 'Date Resolved',
      children: feedback?.dateResolved ? new Date(feedback.dateResolved).toLocaleString() : 'Not resolved yet',
    },
    {
      key: 'park',
      label: 'Park',
      children: park?.name,
    },
    {
      key: 'resolvedBy',
      label: 'Resolved By',
      children: feedback?.resolvedStaff ? `${feedback.resolvedStaff.firstName} ${feedback.resolvedStaff.lastName}` : 'Not resolved',
    },
    {
      key: 'visitorName',
      label: 'Visitor Name',
      children: `${feedback?.visitor.firstName} ${feedback?.visitor.lastName}`,
    },
    {
      key: 'needResponse',
      label: 'Email Response',
      children: (
        <div className="flex items-center justify-between">
          <span>{feedback?.needResponse ? 'Required' : 'Not Required'}</span>
          {feedback?.needResponse && feedback?.visitor?.email && (
            <Tooltip title="Send email">
              <Button type="link" icon={<MailOutlined />} onClick={() => (window.location.href = `mailto:${feedback.visitor.email}`)} />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  // Find the index of the 'remarks' item
  const remarksIndex = descriptionsItems.findIndex((item) => item.key === 'remarks');

  // If 'remarks' is found, insert the images item right after it
  if (remarksIndex !== -1 && feedback?.images && feedback.images.length > 0) {
    descriptionsItems.splice(remarksIndex + 1, 0, {
      key: 'images',
      label: 'Images',
      children: (
        <div className="flex flex-wrap gap-2">
          {feedback.images.map((image, index) => (
            <Image key={index} src={image} alt={`Feedback image ${index + 1}`} width={100} height={100} style={{ objectFit: 'cover' }} />
          ))}
        </div>
      ),
      span: 3,
    });
  }

  const breadcrumbItems = [
    {
      title: 'Feedback Management',
      pathKey: '/feedback',
      isMain: true,
    },
    {
      title: feedback ? feedback.title : 'Feedback Details',
      pathKey: `/feedback/${feedbackId}`,
      isCurrent: true,
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
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Descriptions
          items={descriptionsItems}
          bordered
          column={{ xxl: 3, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
          size="middle"
          title={
            <div className="w-full flex justify-between items-center">
              {!inEditMode ? (
                <>
                  <div>{feedback?.title}</div>
                  <div className="flex items-center">
                    {!inEditMode && feedback?.feedbackStatus === FeedbackStatusEnum.ACCEPTED && (
                      <>
                        {feedback?.feedbackCategory === FeedbackCategoryEnum.WILDLIFE && (
                          <Button type="primary" onClick={handleCreatePlantTask} className="mr-2">
                            Create Plant Task
                          </Button>
                        )}
                        {['FACILITIES', 'SAFETY', 'CLEANLINESS', 'ACCESSIBILITY'].includes(feedback?.feedbackCategory) && (
                          <Button type="primary" onClick={handleCreateMaintenanceTask} className="mr-2">
                            Create Maintenance Task
                          </Button>
                        )}
                      </>
                    )}
                    {(user?.role === StaffType.PARK_RANGER || user?.role === StaffType.MANAGER || user?.role === StaffType.SUPERADMIN) && (
                      <Button icon={<RiEdit2Line className="text-lg" />} type="text" onClick={toggleEditMode} />
                    )}
                  </div>
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
