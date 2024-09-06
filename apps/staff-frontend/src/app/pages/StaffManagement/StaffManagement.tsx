import React, { useRef, useState, useEffect, useMemo } from 'react';
import { SearchOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import type { InputRef, TableColumnsType, TableColumnType } from 'antd';
import {
  Button,
  Input,
  Space,
  Table,
  Layout,
  Row,
  Col,
  Dropdown,
  Modal,
  Flex,
  Tag,
} from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import EditStaffDetailsModal from './EditStaffDetailsModal';
import PageHeader from '../../components/main/PageHeader';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import EditStaffActiveStatusModal from './EditStaffActiveStatusModal';

const { Header, Content } = Layout;

interface DataType {
  key: string;
  name: string;
  role: string;
  email: string;
  contactNumber: string;
  status: boolean;
}

type DataIndex = keyof DataType;

const roles = [
  'Manager',
  'Botanist',
  'Arborist',
  'Landscaper',
  'Maintenance Worker',
  'Cleaner',
  'Landscape Architect',
  'Park Ranger',
];

const mockData: DataType[] = [
  //to replace with db data
  {
    key: '1',
    name: 'John Doe',
    role: 'Manager',
    email: 'john.doe@example.com',
    contactNumber: '123-456-7890',
    status: true,
  },
  {
    key: '2',
    name: 'Jane Smith',
    role: 'Botanist',
    email: 'jane.smith@example.com',
    contactNumber: '234-567-8901',
    status: false,
  },
  {
    key: '3',
    name: 'Alice Johnson',
    role: 'Arborist',
    email: 'alice.johnson@example.com',
    contactNumber: '345-678-9012',
    status: true,
  },
  {
    key: '4',
    name: 'Bob Brown',
    role: 'Landscaper',
    email: 'bob.brown@example.com',
    contactNumber: '456-789-0123',
    status: false,
  },
  {
    key: '5',
    name: 'Charlie Davis',
    role: 'Maintenance Worker',
    email: 'charlie.davis@example.com',
    contactNumber: '567-890-1234',
    status: true,
  },
  {
    key: '6',
    name: 'Diana Evans',
    role: 'Cleaner',
    email: 'diana.evans@example.com',
    contactNumber: '678-901-2345',
    status: true,
  },
  {
    key: '7',
    name: 'Evan Foster',
    role: 'Landscape Architect',
    email: 'evan.foster@example.com',
    contactNumber: '789-012-3456',
    status: false,
  },
  {
    key: '8',
    name: 'Fiona Green',
    role: 'Park Ranger',
    email: 'fiona.green@example.com',
    contactNumber: '890-123-4567',
    status: true,
  },
];

const StaffManagementPage: React.FC = () => {
  const [staff, setStaff] = useState<DataType[]>(mockData);
  // const [staff, setStaff] = useState<DataType[]>([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<DataType | null>(null);
  const [statusStaff, setStatusStaff] = useState<DataType | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch staff data from an API or service
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    // Replace with actual data fetching logic
    const data = await fetch('/api/staff').then((res) => res.json());
    setStaff(data);
  };

  const handleEdit = (record: DataType) => {
    setEditingStaff(record);
    setIsEditModalVisible(true);
  };

  const handleChangeActiveStatus = (record: DataType) => {
    setStatusStaff(record);
    setIsStatusModalVisible(true);
  };

  const handleStatusModalOk = (updatedStaff: DataType[]) => {
    setStaff(updatedStaff);
    setIsStatusModalVisible(false);
  };

  const handleStatusModalCancel = () => {
    setIsStatusModalVisible(false);
  };

  const { Search } = Input;
  const [searchQuery, setSearchQuery] = useState('');
  const filteredStaff = useMemo(() => {
    return staff.filter((staffMember) =>
      Object.values(staffMember).some((value) =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    );
  }, [searchQuery]);

  const handleSearchBar = (value: string) => {
    setSearchQuery(value);
  };

  const columns: TableColumnsType<DataType> = [
    {
      title: 'ID',
      dataIndex: 'key',
      key: 'key',
      width: '5%',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: '20%',
      filters: roles.map((role) => ({ text: role, value: role })),
      onFilter: (value, record) => record.role.includes(value as string),
    },
    {
      title: 'Contact',
      dataIndex: 'contact',
      key: 'contact',
      width: '30%',
      render: (_, record) => (
        <div>
          <div>{record.contactNumber}</div>
          <div style={{ color: 'grey' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={status ? 'green' : ''} bordered={false}>
          {status ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '5%',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: '1', label: 'Edit', onClick: () => handleEdit(record) },
              { key: '2', label: 'Change Status', onClick: () => handleChangeActiveStatus(record) },
            ],
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<MoreOutlined style={{ color: 'grey' }} />}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <ContentWrapperDark>
      {/* <Header className="bg-green-300"></Header> */}
      {/* <Content className="p-10"> */}
      {/* <Row className="flex justify-between items-center mb-4"> */}
      {/* <Col>
            <LogoText className="text-xl font-bold">Staff Management</LogoText>
          </Col> */}
      <PageHeader>Staff Management</PageHeader>
      <Flex justify="end" gap={10}>
        <Search
          placeholder="Search for Staff..."
          allowClear
          enterButton="Search"
          onSearch={handleSearchBar}
          style={{ marginBottom: 20 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('create-staff')}
        >
          Add Staff
        </Button>
      </Flex>
      <Row>
        <Col span={24}>
          <div className="p-5 bg-white shadow-lg rounded-lg">
            <Table
              columns={columns}
              dataSource={filteredStaff}
              rowKey="key"
              pagination={{ pageSize: 10 }}
            />
          </div>
        </Col>
      </Row>

      <Modal
        title="Edit Staff Details"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        {editingStaff && <EditStaffDetailsModal staff={editingStaff} />}
      </Modal>
      <EditStaffActiveStatusModal
        visible={isStatusModalVisible}
        onOk={handleStatusModalOk}
        onCancel={handleStatusModalCancel}
        record={statusStaff}
        staff={staff}
      />
      {/* </Content> */}
    </ContentWrapperDark>
  );
};

export default StaffManagementPage;
