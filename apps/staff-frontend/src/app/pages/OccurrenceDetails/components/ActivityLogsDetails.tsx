import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Image, Typography, Space, Tag, message, Button, Input, Select, Empty } from 'antd';
import { ContentWrapperDark } from '@lepark/common-ui';
import moment from 'moment';
import { getActivityLogById, updateActivityLog, getOccurrenceById } from '@lepark/data-access';
import { ActivityLogResponse, ActivityLogTypeEnum, ActivityLogUpdateData, OccurrenceResponse } from '@lepark/data-access';
import { RiEdit2Line, RiArrowLeftLine } from 'react-icons/ri';
import { useAuth } from '@lepark/common-ui';
import { StaffType, StaffResponse } from '@lepark/data-access';
import { useNavigate } from 'react-router-dom';
import PageHeader2 from '../../../components/main/PageHeader2';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const { Title } = Typography;
const { TextArea } = Input;

const ActivityLogDetails: React.FC = () => {
  const { activityLogId } = useParams<{ activityLogId: string }>();
  const [activityLog, setActivityLog] = useState<ActivityLogResponse | null>(null);
  const [editedActivityLog, setEditedActivityLog] = useState<ActivityLogResponse | null>(null);
  const [occurrence, setOccurrence] = useState<OccurrenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [inEditMode, setInEditMode] = useState(false);
  const navigate = useNavigate();

  const { user } = useAuth<StaffResponse>();

  const canEdit = user?.role === StaffType.SUPERADMIN || 
    user?.role === StaffType.MANAGER || 
    user?.role === StaffType.ARBORIST || 
    user?.role === StaffType.BOTANIST;

  useEffect(() => {
    const fetchActivityLogDetails = async () => {
      if (!activityLogId) return;

      try {
        setLoading(true);
        const response = await getActivityLogById(activityLogId);
        setActivityLog(response.data);
        setEditedActivityLog(response.data);

        // Fetch occurrence details
        const occurrenceResponse = await getOccurrenceById(response.data.occurrenceId);
        setOccurrence(occurrenceResponse.data);
      } catch (error) {
        console.error('Error fetching activity log details:', error);
        message.error('Failed to fetch activity log details');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLogDetails();
  }, [activityLogId]);

  const toggleEditMode = () => {
    if (inEditMode) {
      setEditedActivityLog(activityLog); // Reset changes if canceling edit
    }
    setInEditMode(!inEditMode);
  };
  const handleInputChange = (key: string, value: any) => {
    setEditedActivityLog((prev) => {
      if (prev === null) return null;
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const validateInputs = () => {
    if (editedActivityLog === null) return false;
    const { name, description, activityLogType } = editedActivityLog;
    return name && description && activityLogType;
  };

  const handleSave = async () => {
    if (validateInputs()) {
      try {
        const updatedActivityLogData: ActivityLogUpdateData = {
          name: editedActivityLog?.name,
          description: editedActivityLog?.description,
          activityLogType: editedActivityLog?.activityLogType,
        };
        if (!activityLogId) {
          message.error('No activity log ID provided.');
          return;
        }
        const response = await updateActivityLog(activityLogId, updatedActivityLogData);
        setActivityLog(response.data);
        setInEditMode(false);
        message.success('Activity log updated successfully!');
      } catch (error) {
        console.error(error);
        message.error('Failed to update activity log.');
      }
    } else {
      message.warning('All fields are required.');
    }
  };

  const getDescriptionItems = () => [
    // {
    //   key: 'id',
    //   label: 'Activity Log ID',
    //   children: activityLog?.id,
    // },
    {
      key: 'occurrenceTitle',
      label: 'Occurrence',
      children: occurrence?.title || 'Loading...',
    },
    {
      key: 'name',
      label: 'Name',
      children: !inEditMode ? (
        activityLog?.name
      ) : (
        <Input value={editedActivityLog?.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
      ),
    },
    {
      key: 'description',
      label: 'Description',
      children: !inEditMode ? (
        activityLog?.description
      ) : (
        <TextArea value={editedActivityLog?.description} onChange={(e) => handleInputChange('description', e.target.value)} required />
      ),
    },
    {
      key: 'dateCreated',
      label: 'Date Created',
      children: moment(activityLog?.dateCreated).format('D MMM YY, HH:mm'),
    },
    {
      key: 'activityLogType',
      label: 'Activity Type',
      children: !inEditMode ? (
        <Tag>{activityLog?.activityLogType ? formatEnumLabelToRemoveUnderscores(activityLog.activityLogType) : ''}</Tag>
      ) : (
        <Select
          value={editedActivityLog?.activityLogType}
          onChange={(value) => handleInputChange('activityLogType', value)}
          style={{ width: '100%' }}
        >
          {Object.values(ActivityLogTypeEnum).map((type) => (
            <Select.Option key={type} value={type}>
              {type}
            </Select.Option>
          ))}
        </Select>
      ),
    },
  ];

  const breadcrumbItems = [
    {
      title: "Occurrence Management",
      pathKey: '/occurrences',
      isMain: true,
    },
    {
      title: occurrence?.title || "Occurrence Details",
      pathKey: `/occurrences/${occurrence?.id}`,
    },
    {
      title: "Activity Log Details",
      pathKey: `/occurrences/${occurrence?.id}/activitylog/${activityLog?.id}`,
      isCurrent: true,
    },
  ];

  const renderContent = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!activityLog) {
      return (
        <ContentWrapperDark>
          <PageHeader2 breadcrumbItems={breadcrumbItems} />
          <Card>
            <div>No activity log found or an error occurred.</div>
          </Card>
        </ContentWrapperDark>
      );
    }

    return (
      <ContentWrapperDark>
        <PageHeader2 breadcrumbItems={breadcrumbItems} />
        <Card>
          <Descriptions
            bordered
            column={1}
            size="middle"
            items={getDescriptionItems()}
            title={
              <div className="w-full flex justify-between">
                {!inEditMode ? (
                  <>
                    <div>Activity Log Details</div>
                    {canEdit && (
                      <Button icon={<RiEdit2Line className="text-lg" />} type="text" onClick={toggleEditMode} />
                    )}
                  </>
                ) : (
                  <>
                    <Button icon={<RiArrowLeftLine className="text-lg" />} type="text" onClick={toggleEditMode}>
                      Return
                    </Button>
                    <div className="text-secondary">Edit Activity Log</div>
                    <Button type="primary" onClick={handleSave}>
                      Save
                    </Button>
                  </>
                )}
              </div>
            }
          />

          <Title level={4} className="mt-4 mb-2">
            Images
          </Title>
          {activityLog.images && activityLog.images.length > 0 ? (
            <Space size="large" wrap>
              {activityLog.images.map((image, index) => (
                <Image key={index} width={200} src={image} className="rounded-md" />
              ))}
            </Space>
          ) : (
            <div className='h-64 bg-gray-200 flex items-center justify-center rounded-lg'>
              <Empty description="No Image"/>
            </div>
          )}
        </Card>
      </ContentWrapperDark>
    );
  };

  return renderContent();
};

export default ActivityLogDetails;
