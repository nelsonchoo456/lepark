import React, { useRef, useState, useEffect, useMemo } from 'react';
import { SearchOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import type { InputRef, TableColumnsType, TableColumnType } from 'antd';
import { Button, Input, Space, Table, Layout, Row, Col, Dropdown, Modal, Flex, Tag, notification } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import PageHeader from '../../components/main/PageHeader';
import { FiEye, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getAllStaffs, StaffResponse, StaffType, getParkById, ParkResponse, getAllParks, getAllStaffsByParkId } from '@lepark/data-access';

const StaffManagementPage: React.FC = () => {
  const { user, updateUser } = useAuth<StaffResponse>();
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const navigate = useNavigate();
  const notificationShown = useRef(false);

  
  useEffect(() => {
    if (user?.role !== StaffType.MANAGER && user?.role !== StaffType.SUPERADMIN) {
      if (!notificationShown.current) {
        notification.error({
          message: 'Access Denied',
          description: 'You are not allowed to access the Staff Management page!',
        });
        notificationShown.current = true;
      }
      navigate('/');
    } else {
      fetchStaffData();
      fetchParksData();
    }
  }, [user]);

  const fetchStaffData = async () => {
    try {
      if (user?.role === StaffType.SUPERADMIN) {
        const response = await getAllStaffs();
        const data = await response.data;
        setStaff(data);
      } else {
        const response = await getAllStaffsByParkId(user?.parkId || '');
        const data = await response.data;
        setStaff(data);
      } 
    } catch (error) {
      console.error('Error fetching staff data:', error);
    }
  };

  const fetchParksData = async () => {
    try {
      const response = await getAllParks();
      const data = await response.data;
      setParks(data);
    } catch (error) {
      console.error('Error fetching parks data:', error);
    };
  };

  const getParkName = (parkId?: string) => {
    if (!parkId) {
      return 'NParks';
    }
    const park = parks.find((park) => park.id == parkId);
    return park ? park.name : 'NParks';
  };

  const handleViewDetailsClick = (staffRecord: StaffResponse) => {
    navigate(`${staffRecord.id}`);
  };

  const { Search } = Input;
  const [searchQuery, setSearchQuery] = useState('');
  const filteredStaff = useMemo(() => {
    return staff.filter((staffMember) => {
      const fullName = `${staffMember.firstName} ${staffMember.lastName}`.toLowerCase();
      const parkName = getParkName(staffMember.parkId).toLowerCase();
      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        parkName.includes(searchQuery.toLowerCase()) ||
        Object.values(staffMember).some((value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
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
      title: 'Park',
      key: 'park',
      width: '15%',
      render: (_, record) => getParkName(record.parkId ?? ''),
      filters: user?.role === StaffType.SUPERADMIN ? parks.map((park) => ({ text: park.name, value: park.id })) : undefined,
      onFilter: user?.role === StaffType.SUPERADMIN ? (value, record) => parseInt((record.parkId || '').toString()) === parseInt(value.toString()) : undefined,
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
        <Search placeholder="Search for Staff..." allowClear enterButton="Search" onChange={(e) => handleSearchBar(e.target.value)} style={{ marginBottom: 20 }} />
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
