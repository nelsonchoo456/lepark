import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Image, Typography, Space, Tag, message, Button, Input, Select } from 'antd';
import { ContentWrapperDark } from '@lepark/common-ui';
import PageHeader from '../../../components/main/PageHeader';
import moment from 'moment';
import { getActivityLogById, updateActivityLog } from '@lepark/data-access';
import { ActivityLogResponse, ActivityLogTypeEnum, ActivityLogUpdateData } from '@lepark/data-access';
import { RiEdit2Line, RiArrowLeftLine } from 'react-icons/ri';

const { Title } = Typography;
const { TextArea } = Input;

const ActivityLogDetails: React.FC = () => {
  const { activityLogId } = useParams<{ activityLogId: string }>();
  const [activityLog, setActivityLog] = useState<ActivityLogResponse | null>(null);
  const [editedActivityLog, setEditedActivityLog] = useState<ActivityLogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [inEditMode, setInEditMode] = useState(false);

  useEffect(() => {
    const fetchActivityLogDetails = async () => {
      if (!activityLogId) return;

      try {
        setLoading(true);
        const response = await getActivityLogById(activityLogId);
        setActivityLog(response.data);
        setEditedActivityLog(response.data);
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
    {
      key: 'id',
      label: 'ID',
      children: activityLog?.id,
    },
    {
      key: 'occurrenceId',
      label: 'Occurrence ID',
      children: activityLog?.occurrenceId,
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
        <Tag>{activityLog?.activityLogType ? ActivityLogTypeEnum[activityLog.activityLogType] : ''}</Tag>
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

  const renderContent = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!activityLog) {
      return (
        <ContentWrapperDark>
          <PageHeader>Activity Log Details</PageHeader>
          <Card>
            <div>No activity log found or an error occurred.</div>
          </Card>
        </ContentWrapperDark>
      );
    }

    return (
      <ContentWrapperDark>
        <PageHeader>Activity Log Details</PageHeader>
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
                    <Button icon={<RiEdit2Line className="text-lg" />} type="text" onClick={toggleEditMode} />
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
          <Space size="large" wrap>
            {activityLog.images && activityLog.images.length > 0 ? (
              activityLog.images.map((image, index) => <Image key={index} width={200} src={image} />)
            ) : (
              <div>No images available</div>
            )}
          </Space>
        </Card>
      </ContentWrapperDark>
    );
  };

  return renderContent();
};

export default ActivityLogDetails;
