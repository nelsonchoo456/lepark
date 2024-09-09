import React, { useState, useEffect } from 'react';
import { Table, Button, Tooltip, TableProps, Tag, Flex, Input, Modal, Form, Select, message } from 'antd';
import { FiEdit, FiEye, FiSearch, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { OccurrenceResponse, ActivityLogResponse, getActivityLogsByOccurrenceId, createActivityLog, ActivityLogTypeEnum } from '@lepark/data-access';

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
          dateCreated: new Date().toISOString(), // Use current date and time
          occurrenceId: occurrence.id,
        });
        message.success('Activity log created successfully');
        setIsModalVisible(false);
        form.resetFields();
        // Refresh activity logs
        const response = await getActivityLogsByOccurrenceId(occurrence.id);
        setActivityLogs(response.data);
      } catch (error) {
        console.error('Error creating activity log:', error);
        message.error('Failed to create activity log');
      }
    }
  };

  const columns: TableProps<ActivityLog>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Date Created',
      dataIndex: 'dateCreated',
      key: 'dateCreated',
      render: (dateCreated: string) => moment(dateCreated).format('D MMM YY, HH:mm'),
    },
    {
      title: 'Activity Type',
      dataIndex: 'activityLogType',
      key: 'activityLogType',
      render: (activityLogType: string) => <Tag>{activityLogType}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="left" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`activitylog/${record.id}`)} />
          </Tooltip>
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
        <Button type="primary" icon={<FiPlus />} onClick={showModal}>
          Add Activity Log
        </Button>
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
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ActivityLogs;
