import React, { useState, useEffect } from 'react';
import { Table, Button, Tooltip, TableProps, Tag, Flex, Input, Modal, Form, Select, message } from 'antd';
import { FiEdit, FiEye, FiSearch, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { OccurrenceResponse, ActivityLogResponse, getActivityLogsByOccurrenceId, createActivityLog, deleteActivityLog, ActivityLogTypeEnum } from '@lepark/data-access';
import useUploadImages from '../../../hooks/Images/useUploadImages';
import { ImageInput } from '@lepark/common-ui';
import { useAuth } from '@lepark/common-ui';
import { StaffType, StaffResponse } from '@lepark/data-access';

interface ActivityLog {
  id: string;
  name: string;
  dateCreated: string;
  activityLogType: string;
}

const ActivityLogs: React.FC<{ occurrence: OccurrenceResponse | null }> = ({ occurrence }) => {
  const navigate = useNavigate();
  const [activityLogs, setActivityLogs] = useState<ActivityLogResponse[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [activityLogToDelete, setActivityLogToDelete] = useState<string | null>(null);
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const { user } = useAuth<StaffResponse>();

  const canAddOrDelete = user?.role === StaffType.SUPERADMIN || 
    user?.role === StaffType.MANAGER || 
    user?.role === StaffType.ARBORIST || 
    user?.role === StaffType.BOTANIST;

  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (occurrence?.id) {
        try {
          const response = await getActivityLogsByOccurrenceId(occurrence.id);
          setActivityLogs(response.data);
        } catch (error) {
          console.error('Error fetching activity logs:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchActivityLogs();
  }, [occurrence]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = activityLogs.filter(log => 
      log.name.toLowerCase().includes(lowercasedFilter) ||
      log.id.toLowerCase().includes(lowercasedFilter) ||
      log.activityLogType.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredLogs(filtered);
  }, [searchTerm, activityLogs]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    if (occurrence?.id) {
      try {
        await createActivityLog({
          ...values,
          dateCreated: new Date().toISOString(),
          occurrenceId: occurrence.id,
        }, selectedFiles);
        message.success('Activity log created successfully');
        setIsModalVisible(false);
        form.resetFields();
        // Clear selected files and preview images
        selectedFiles.length = 0;
        previewImages.length = 0;
        // Refresh activity logs
        const response = await getActivityLogsByOccurrenceId(occurrence.id);
        setActivityLogs(response.data);
      } catch (error) {
        console.error('Error creating activity log:', error);
        message.error('Failed to create activity log');
      }
    }
  };

  const showDeleteConfirm = (id: string) => {
    setActivityLogToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (activityLogToDelete) {
      try {
        await deleteActivityLog(activityLogToDelete);
        message.success('Activity log deleted successfully');
        // Refresh activity logs
        if (occurrence?.id) {
          const response = await getActivityLogsByOccurrenceId(occurrence.id);
          setActivityLogs(response.data);
        }
      } catch (error) {
        console.error('Error deleting activity log:', error);
        message.error('Failed to delete activity log');
      } finally {
        setDeleteModalVisible(false);
        setActivityLogToDelete(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setActivityLogToDelete(null);
  };

  const handleDelete = async (id: string) => {
    showDeleteConfirm(id);
  };

  const columns: TableProps<ActivityLog>['columns'] = [
    // {
    //   title: 'Activity Log ID',
    //   dataIndex: 'id',
    //   key: 'id',
    //   sorter: (a, b) => a.id.localeCompare(b.id),
    // },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Date Created',
      dataIndex: 'dateCreated',
      key: 'dateCreated',
      render: (dateCreated: string) => moment(dateCreated).format('D MMM YY, HH:mm'),
      sorter: (a, b) => moment(a.dateCreated).valueOf() - moment(b.dateCreated).valueOf(),
    },
    {
      title: 'Activity Type',
      dataIndex: 'activityLogType',
      key: 'activityLogType',
      render: (activityLogType: string) => <Tag>{activityLogType}</Tag>,
      filters: Object.values(ActivityLogTypeEnum).map(type => ({ text: type, value: type })),
      onFilter: (value, record) => record.activityLogType === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="left" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`activitylog/${record.id}`)} />
          </Tooltip>
          {canAddOrDelete && (
            <Tooltip title="Delete Activity Log">
              <Button
                type="link"
                icon={<FiTrash2 />}
                onClick={() => showDeleteConfirm(record.id)}
                style={{ color: 'red' }}
              />
            </Tooltip>
          )}
        </Flex>
      ),
    },
  ];

  return (
    <>
      <Flex justify="space-between" align="center" className="mb-4">
        <Input
          suffix={<FiSearch />}
          placeholder="Search in Activity Logs..."
          className="bg-white"
          variant="filled"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '300px' }}
        />
        {canAddOrDelete && (
          <Button type="primary" icon={<FiPlus />} onClick={showModal}>
            Add Activity Log
          </Button>
        )}
      </Flex>

      <Table<ActivityLog>
        dataSource={filteredLogs}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={loading}
      />

      <Modal
        title="Add Activity Log"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="activityLogType"
            label="Activity Type"
            rules={[{ required: true, message: 'Please select an activity type' }]}
          >
            <Select>
              {Object.values(ActivityLogTypeEnum).map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Image">
            <ImageInput
              type="file"
              multiple
              onChange={handleFileChange}
              accept="image/png, image/jpeg"
              onClick={onInputClick}
            />
          </Form.Item>
          {previewImages?.length > 0 && (
            <Form.Item label="Image Previews">
              <div className="flex flex-wrap gap-2">
                {previewImages.map((imgSrc, index) => (
                  <img
                    key={index}
                    src={imgSrc}
                    alt={`Preview ${index}`}
                    className="w-20 h-20 object-cover rounded border-[1px] border-green-100"
                    onClick={() => removeImage(index)}
                  />
                ))}
              </div>
            </Form.Item>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Confirm Deletion"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this activity log? This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default ActivityLogs;
