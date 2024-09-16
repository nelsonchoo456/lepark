import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Image, Typography, Space, Tag, message, Button, Input, Select, Empty } from 'antd';
import { ContentWrapperDark } from '@lepark/common-ui';
import PageHeader from '../../../components/main/PageHeader';
import moment from 'moment';
import { getStatusLogById, updateStatusLog, getOccurrenceById } from '@lepark/data-access';
import { StatusLogResponse, StatusLogUpdateData, OccurrenceResponse } from '@lepark/data-access';
import { RiEdit2Line, RiArrowLeftLine } from 'react-icons/ri';

const { Title } = Typography;
const { TextArea } = Input;

const StatusLogDetails: React.FC = () => {
  const { statusLogId } = useParams<{ statusLogId: string }>();
  const [statusLog, setStatusLog] = useState<StatusLogResponse | null>(null);
  const [editedStatusLog, setEditedStatusLog] = useState<StatusLogResponse | null>(null);
  const [occurrence, setOccurrence] = useState<OccurrenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [inEditMode, setInEditMode] = useState(false);

  useEffect(() => {
    const fetchStatusLogDetails = async () => {
      if (!statusLogId) return;

      try {
        setLoading(true);
        const response = await getStatusLogById(statusLogId);
        setStatusLog(response.data);
        setEditedStatusLog(response.data);

        // Fetch occurrence details
        const occurrenceResponse = await getOccurrenceById(response.data.occurrenceId);
        setOccurrence(occurrenceResponse.data);
      } catch (error) {
        console.error('Error fetching status log details:', error);
        message.error('Failed to fetch status log details');
      } finally {
        setLoading(false);
      }
    };

    fetchStatusLogDetails();
  }, [statusLogId]);

  const occurrenceStatusOptions = [
    {
      value: 'HEALTHY',
      label: 'Healthy',
    },
    {
      value: 'MONITOR_AFTER_TREATMENT',
      label: 'Monitor After Treatment',
    },
    {
      value: 'NEEDS_ATTENTION',
      label: 'Needs Attention',
    },
    {
      value: 'URGENT_ACTION_NEEDED',
      label: 'Urgent Action Needed',
    },
    {
      value: 'REMOVED',
      label: 'Removed',
    },
  ];

  const toggleEditMode = () => {
    if (inEditMode) {
      setEditedStatusLog(statusLog); // Reset changes if canceling edit
    }
    setInEditMode(!inEditMode);
  };

  const handleInputChange = (key: string, value: any) => {
    setEditedStatusLog((prev) => {
      if (prev === null) return null;
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const validateInputs = () => {
    if (editedStatusLog === null) return false;
    const { name, description, statusLogType } = editedStatusLog;
    return name && description && statusLogType;
  };

  const handleSave = async () => {
    if (validateInputs()) {
      try {
        const updatedStatusLogData: StatusLogUpdateData = {
          name: editedStatusLog?.name,
          description: editedStatusLog?.description,
          statusLogType: editedStatusLog?.statusLogType,
        };
        if (!statusLogId) {
          message.error('No status log ID provided.');
          return;
        }
        const response = await updateStatusLog(statusLogId, updatedStatusLogData);
        setStatusLog(response.data);
        setInEditMode(false);
        message.success('Status log updated successfully!');
      } catch (error) {
        console.error(error);
        message.error('Failed to update status log.');
      }
    } else {
      message.warning('All fields are required.');
    }
  };

  const getDescriptionItems = () => [
    {
      key: 'id',
      label: 'Status Log ID',
      children: statusLog?.id,
    },
    {
      key: 'occurrenceTitle',
      label: 'Occurrence',
      children: occurrence?.title || 'Loading...',
    },
    {
      key: 'name',
      label: 'Name',
      children: !inEditMode ? (
        statusLog?.name
      ) : (
        <Input value={editedStatusLog?.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
      ),
    },
    {
      key: 'description',
      label: 'Description',
      children: !inEditMode ? (
        statusLog?.description
      ) : (
        <TextArea value={editedStatusLog?.description} onChange={(e) => handleInputChange('description', e.target.value)} required />
      ),
    },
    {
      key: 'dateCreated',
      label: 'Date Created',
      children: moment(statusLog?.dateCreated).format('D MMM YY, HH:mm'),
    },
    {
      key: 'statusLogType',
      label: 'Status Type',
      children: !inEditMode ? (
        <Tag>{statusLog?.statusLogType}</Tag>
      ) : (
        <Select
          value={editedStatusLog?.statusLogType}
          onChange={(value) => handleInputChange('statusLogType', value)}
          style={{ width: '100%' }}
        >
          {/* {Object.values(OccurrenceStatusEnum).map((type) => (
            <Select.Option key={type} value={type}>
              {type}
            </Select.Option>
          ))} */}
          {occurrenceStatusOptions.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
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

    if (!statusLog) {
      return (
        <ContentWrapperDark>
          <PageHeader>Status Log Details</PageHeader>
          <Card>
            <div>No status log found or an error occurred.</div>
          </Card>
        </ContentWrapperDark>
      );
    }

    return (
      <ContentWrapperDark>
        <PageHeader>Status Log Details</PageHeader>
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
                    <div>Status Log Details</div>
                    <Button icon={<RiEdit2Line className="text-lg" />} type="text" onClick={toggleEditMode} />
                  </>
                ) : (
                  <>
                    <Button icon={<RiArrowLeftLine className="text-lg" />} type="text" onClick={toggleEditMode}>
                      Return
                    </Button>
                    <div className="text-secondary">Edit Status Log</div>
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
          {statusLog.images && statusLog.images.length > 0 ? (
            <Space size="large" wrap>
              {statusLog.images.map((image, index) => (
                <Image key={index} width={200} src={image} className="rounded-md" />
              ))}
            </Space>
          ) : (
            <div className="h-64 bg-gray-200 flex items-center justify-center rounded-lg">
              <Empty description="No Image" />
            </div>
          )}
        </Card>
      </ContentWrapperDark>
    );
  };

  return renderContent();
};

export default StatusLogDetails;
