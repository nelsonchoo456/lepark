import React, { useRef, useState, useEffect, useMemo } from 'react';
import { SearchOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import type { InputRef, TableColumnsType, TableColumnType } from 'antd';
import { Button, Input, Space, Table, Layout, Row, Col, Dropdown, Modal, Flex, Tag } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import PageHeader from '../../components/main/PageHeader';
import { FiEye, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getAllStaffs, StaffResponse, StaffType } from '@lepark/data-access';

const StaffManagementPage: React.FC = () => {
  const { user, updateUser } = useAuth<StaffResponse>();
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      const response = await getAllStaffs();
      console.log('Staff table successfully populated!');
      const data = await response.data;
      console.log('Fetched staff data:', data);
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff data:', error);
    }
  };

  const handleViewDetailsClick = (staffRecord: StaffResponse) => {
    navigate(`${staffRecord.id}`);
  };

  const { Search } = Input;
  const [searchQuery, setSearchQuery] = useState('');
  const filteredStaff = useMemo(() => {
    return staff.filter((staffMember) =>
      Object.values(staffMember).some((value) => value.toString().toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [staff, searchQuery]);

  const handleSearchBar = (value: string) => {
    setSearchQuery(value);
  };

  const columns: TableColumnsType<StaffResponse> = [
    {
      title: 'Name',
      key: 'name',
      width: '30%',
      sorter: (a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`;
        const nameB = `${b.firstName} ${b.lastName}`;
        return nameA.localeCompare(nameB);
      },
      sortDirections: ['ascend', 'descend'],
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Role',
      key: 'role',
      width: '20%',
      dataIndex: 'role',
      filters: Object.values(StaffType).map((role) => ({ text: role, value: role })),
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Contact',
      key: 'contact',
      width: '25%',
      render: (_, record) => (
        <div>
          <div>{record.contactNumber}</div>
          <div style={{ color: 'grey' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: '20%',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (_, record) => {
        return (
          <Tag key={record.id} color={record.isActive ? 'green' : 'red'} bordered={false}>
            {record.isActive ? 'Active' : 'Inactive'}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_, record) => (
        <Flex key={record.id} justify="center">
          {record.id !== user?.id && <Button type="link" icon={<FiEye />} onClick={() => handleViewDetailsClick(record)} />}
        </Flex>
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
        <Search placeholder="Search for Staff..." allowClear enterButton="Search" onSearch={handleSearchBar} style={{ marginBottom: 20 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('create-staff')}>
          Add Staff
        </Button>
      </Flex>
      <Row>
        <Col span={24}>
          <div className="p-5 bg-white shadow-lg rounded-lg">
            <Table columns={columns} dataSource={filteredStaff} rowKey="key" pagination={{ pageSize: 10 }} />
          </div>
        </Col>
      </Row>

      {/* </Content> */}
    </ContentWrapperDark>
  );
};

export default StaffManagementPage;
