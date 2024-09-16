import React, { useState, useEffect } from 'react';
import { Table, Button, Tooltip, TableProps, Tag, Flex, Input, Modal, Form, Select, message } from 'antd';
import { FiEdit, FiEye, FiSearch, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
  OccurrenceResponse,
  // OccurrenceStatusEnum,
  StatusLogResponse,
  getStatusLogsByOccurrenceId,
  createStatusLog,
  deleteStatusLog,
} from '@lepark/data-access';
import useUploadImages from '../../../hooks/Images/useUploadImages';
import { ImageInput } from '@lepark/common-ui';
import { useAuth } from '@lepark/common-ui';
import { StaffType, StaffResponse } from '@lepark/data-access';

const StatusLogs: React.FC<{ occurrence: OccurrenceResponse | null }> = ({ occurrence }) => {
  const navigate = useNavigate();
  const [statusLogs, setStatusLogs] = useState<StatusLogResponse[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<StatusLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [statusLogToDelete, setStatusLogToDelete] = useState<string | null>(null);
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const { user } = useAuth<StaffResponse>();

  const canAddOrDelete = user?.role === StaffType.SUPERADMIN || 
    user?.role === StaffType.MANAGER || 
    user?.role === StaffType.ARBORIST || 
    user?.role === StaffType.BOTANIST;

  useEffect(() => {
    const fetchStatusLogs = async () => {
      if (occurrence?.id) {
        try {
          const response = await getStatusLogsByOccurrenceId(occurrence.id);
          setStatusLogs(response.data);
        } catch (error) {
          console.error('Error fetching status logs:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStatusLogs();
  }, [occurrence]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = statusLogs.filter(
      (log) =>
        log.name.toLowerCase().includes(lowercasedFilter) ||
        log.id.toLowerCase().includes(lowercasedFilter) ||
        log.statusLogType.toLowerCase().includes(lowercasedFilter),
    );
    setFilteredLogs(filtered);
  }, [searchTerm, statusLogs]);

  const occurrenceStatusOptions = [
    {
      value: 'HEALTHY',
      label: 'HEALTHY',
    },
    {
      value: 'MONITOR_AFTER_TREATMENT',
      label: 'MONITOR_AFTER_TREATMENT',
    },
    {
      value: 'NEEDS_ATTENTION',
      label: 'NEEDS_ATTENTION',
    },
    {
      value: 'URGENT_ACTION_NEEDED',
      label: 'URGENT_ACTION_NEEDED',
    },
    {
      value: 'REMOVED',
      label: 'REMOVED',
    },
  ]

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    // Clear selected files and preview images
    selectedFiles.length = 0;
    previewImages.length = 0;
  };

  const handleSubmit = async (values: any) => {
    if (occurrence?.id) {
      try {
        await createStatusLog({
          ...values,
          dateCreated: new Date().toISOString(),
          occurrenceId: occurrence.id,
        }, selectedFiles);
        message.success('Status log created successfully');
        setIsModalVisible(false);
        form.resetFields();
        // Clear selected files and preview images
        selectedFiles.length = 0;
        previewImages.length = 0;
        // Refresh status logs
        const response = await getStatusLogsByOccurrenceId(occurrence.id);
        setStatusLogs(response.data);
      } catch (error) {
        console.error('Error creating status log:', error);
        message.error('Failed to create status log');
      }
    }
  };

  const showDeleteConfirm = (id: string) => {
    setStatusLogToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (statusLogToDelete) {
      try {
        await deleteStatusLog(statusLogToDelete);
        message.success('Status log deleted successfully');
        // Refresh status logs
        if (occurrence?.id) {
          const response = await getStatusLogsByOccurrenceId(occurrence.id);
          setStatusLogs(response.data);
        }
      } catch (error) {
        console.error('Error deleting status log:', error);
        message.error('Failed to delete status log');
      } finally {
        setDeleteModalVisible(false);
        setStatusLogToDelete(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setStatusLogToDelete(null);
  };

  const columns: TableProps<StatusLogResponse>['columns'] = [
    {
      title: 'Status Log ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
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
      title: 'Status Type',
      dataIndex: 'statusLogType',
      key: 'statusLogType',
      render: (statusLogType: string) => <Tag>{statusLogType}</Tag>,
      filters: occurrenceStatusOptions.map(type => ({ text: type.label, value: type.value })),
      onFilter: (value, record) => record.statusLogType === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="left" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`statuslog/${record.id}`)} />
          </Tooltip>
          {canAddOrDelete && (
            <Tooltip title="Delete Status Log">
              <Button type="link" icon={<FiTrash2 />} onClick={() => showDeleteConfirm(record.id)} style={{ color: 'red' }} />
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
          placeholder="Search in Status Logs..."
          className="bg-white"
          variant="filled"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '300px' }}
        />
        {canAddOrDelete && (
          <Button type="primary" icon={<FiPlus />} onClick={showModal}>
            Add Status Log
          </Button>
        )}
      </Flex>

      <Table<StatusLogResponse> dataSource={filteredLogs} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} loading={loading} />

      <Modal title="Add Status Log" open={isModalVisible} onCancel={handleCancel} footer={null}>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter a name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter a description' }]}>
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="statusLogType" label="Status Type" rules={[{ required: true, message: 'Please select a status type' }]}>
            <Select>
              {occurrenceStatusOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
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
        <p>Are you sure you want to delete this status log? This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default StatusLogs;
