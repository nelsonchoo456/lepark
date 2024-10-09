import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Select, DatePicker, Table, Button, Dropdown, Menu, Input, message } from 'antd';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import {
  getAllPlantTasks,
  getAllStaffs,
  assignPlantTask,
  PlantTaskResponse,
  StaffResponse,
  PlantTaskTypeEnum,
  PlantTaskUrgencyEnum,
  PlantTaskStatusEnum,
} from '@lepark/data-access';
import moment from 'moment';
import { useAuth } from '@lepark/common-ui';
import { StaffRoleEnum } from '@prisma/client';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ManagerPlantTaskDashboard: React.FC = () => {
  const { user } = useAuth<StaffResponse>();
  const [plantTasks, setPlantTasks] = useState<PlantTaskResponse[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<PlantTaskResponse[]>([]);
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<StaffResponse | null>(null);
  const [urgencyFilter, setUrgencyFilter] = useState<PlantTaskUrgencyEnum | null>(null);
  const [typeFilter, setTypeFilter] = useState<PlantTaskTypeEnum | null>(null);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);

  useEffect(() => {
    fetchPlantTasks();
    fetchStaff();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [plantTasks, urgencyFilter, typeFilter, dateRange]);

  const fetchPlantTasks = async () => {
    try {
      const response = await getAllPlantTasks();
      setPlantTasks(response.data);
      setFilteredTasks(response.data);
    } catch (error) {
      console.error('Error fetching plant tasks:', error);
      message.error('Failed to fetch plant tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await getAllStaffs();
      const staff = response.data.filter((s: StaffResponse) => s.role === StaffRoleEnum.ARBORIST || s.role === StaffRoleEnum.BOTANIST);
      setStaff(staff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      message.error('Failed to fetch staff');
    }
  };

  const applyFilters = () => {
    let filtered = [...plantTasks];

    if (urgencyFilter) {
      filtered = filtered.filter((task) => task.taskUrgency === urgencyFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter((task) => task.taskType === typeFilter);
    }

    if (dateRange) {
      const [start, end] = dateRange;
      filtered = filtered.filter((task) => {
        const dueDate = moment(task.dueDate);
        return dueDate.isBetween(start, end, 'day', '[]');
      });
    }

    setFilteredTasks(filtered);
  };

  // Overview Dashboard
  const renderOverviewDashboard = () => (
    <Card title="Overview Dashboard">
      <Row gutter={16}>
        <Col span={6}>
          <Statistic title="Open Tasks" value={filteredTasks.filter((task) => task.taskStatus === PlantTaskStatusEnum.OPEN).length} />
        </Col>
        <Col span={6}>
          <Statistic
            title="In Progress Tasks"
            value={filteredTasks.filter((task) => task.taskStatus === PlantTaskStatusEnum.IN_PROGRESS).length}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Completed Tasks"
            value={filteredTasks.filter((task) => task.taskStatus === PlantTaskStatusEnum.COMPLETED).length}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Cancelled Tasks"
            value={filteredTasks.filter((task) => task.taskStatus === PlantTaskStatusEnum.CANCELLED).length}
          />
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: '20px' }}>
        <Col span={8}>
          <Select
            style={{ width: '100%' }}
            placeholder="Filter by Urgency"
            onChange={(value: PlantTaskUrgencyEnum | null) => setUrgencyFilter(value)}
            allowClear
          >
            {Object.values(PlantTaskUrgencyEnum).map((urgency) => (
              <Option key={urgency} value={urgency}>
                {urgency}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <Select
            style={{ width: '100%' }}
            placeholder="Filter by Type"
            onChange={(value: PlantTaskTypeEnum | null) => setTypeFilter(value)}
            allowClear
          >
            {Object.values(PlantTaskTypeEnum).map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <RangePicker style={{ width: '100%' }} onChange={(dates) => setDateRange(dates as [moment.Moment, moment.Moment] | null)} />
        </Col>
      </Row>
    </Card>
  );

  // Task Assignment Section
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Status',
      dataIndex: 'taskStatus',
      key: 'taskStatus',
    },
    {
      title: 'Urgency',
      dataIndex: 'taskUrgency',
      key: 'taskUrgency',
    },
    {
      title: 'Type',
      dataIndex: 'taskType',
      key: 'taskType',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Assigned To',
      dataIndex: ['assignedStaff', 'firstName'],
      key: 'assignedStaff',
      render: (firstName: string, record: PlantTaskResponse) =>
        record.assignedStaff ? `${firstName} ${record.assignedStaff.lastName}` : 'Unassigned',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: string, record: PlantTaskResponse) => (
        <Dropdown overlay={menu(record.id)} trigger={['click']}>
          <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
            Assign <DownOutlined />
          </a>
        </Dropdown>
      ),
    },
  ];

  const handleAssignStaff = async (taskId: string, assignerStaffId: string, staffId: string) => {
    try {
      await assignPlantTask(taskId, assignerStaffId, staffId);
      message.success('Task assigned successfully');
      fetchPlantTasks(); // Refresh the task list
    } catch (error) {
      console.error('Error assigning task:', error);
      message.error('Failed to assign task');
    }
  };

  const menu = (taskId: string) => (
    <Menu>
      {staff.map((s) => (
        <Menu.Item key={s.id} onClick={() => handleAssignStaff(taskId, user?.id || '', s.id)}>
          {s.firstName} {s.lastName}
        </Menu.Item>
      ))}
    </Menu>
  );

  const renderTaskAssignmentSection = () => (
    <Card title="Task Assignment" style={{ marginTop: '20px' }}>
      {selectedStaff && (
        <div style={{ marginBottom: '10px' }}>
          Selected Staff: {selectedStaff.firstName} {selectedStaff.lastName}
          <Button type="link" onClick={() => setSelectedStaff(null)}>
            Remove
          </Button>
        </div>
      )}
      <Table columns={columns} dataSource={filteredTasks} rowKey="id" loading={loading} />
    </Card>
  );

  return (
    <div>
      {renderOverviewDashboard()}
      {renderTaskAssignmentSection()}
      <Button type="primary" style={{ marginTop: '20px' }}>
        Create New Task
      </Button>
    </div>
  );
};

export default ManagerPlantTaskDashboard;
