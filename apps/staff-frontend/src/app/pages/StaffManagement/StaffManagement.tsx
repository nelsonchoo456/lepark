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
import PageHeader2 from '../../components/main/PageHeader2';
import { SCREEN_LG } from '../../config/breakpoints';

const StaffManagementPage: React.FC = () => {
  const { user, updateUser } = useAuth<StaffResponse>();
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const navigate = useNavigate();
  const notificationShown = useRef(false);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        if (user?.role === StaffType.SUPERADMIN) {
          const response = await getAllStaffs();
          const data = await response.data;
          setStaff(data);
        } else {
          const response = await getAllStaffsByParkId(user?.parkId);
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
      }
    };

    fetchStaffData();
    fetchParksData();
  }, [user]);

  const getParkName = (parkId?: number) => {
    if (!parkId) {
      return 'NParks';
    }
    const park = parks.find((park) => park.id === parkId);
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
      const roleName = staffMember.role.replace(/_/g, ' ').toLowerCase();
      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        parkName.includes(searchQuery.toLowerCase()) ||
        roleName.includes(searchQuery.toLowerCase()) ||
        Object.values(staffMember).some((value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [staff, searchQuery]);

  const dataSource = filteredStaff.map((staff) => ({
    ...staff,
    key: staff.id, // to fix the warning about missing key prop
  }));

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
      fixed: 'left',
    },
    {
      title: 'Role',
      key: 'role',
      width: '20%',
      dataIndex: 'role',
      filters: Object.values(StaffType).map((role) => ({ text: role.replace(/_/g, ' '), value: role })),
      onFilter: (value, record) => record.role === value,
      render: (role) => role.replace(/_/g, ' '),
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
      render: (_, record) => getParkName(record.parkId),
      filters: user?.role === StaffType.SUPERADMIN ? parks.map((park) => ({ text: park.name, value: park.id })) : undefined,
      onFilter:
        user?.role === StaffType.SUPERADMIN
          ? (value, record) => parseInt((record.parkId || '').toString()) === parseInt(value.toString())
          : undefined,
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
      width: '90px',
      render: (_, record) => (
        <Flex key={record.id} justify="center">
          {record.id !== user?.id && <Button type="link" icon={<FiEye />} onClick={() => handleViewDetailsClick(record)} />}
        </Flex>
      ),
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Staff Management',
      pathKey: '/staff-management',
      isMain: true,
      isCurrent: true,
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
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Flex justify="end" gap={10}>
        <Search
          placeholder="Search for Staff..."
          allowClear
          enterButton="Search"
          onChange={(e) => handleSearchBar(e.target.value)}
          style={{ marginBottom: 20 }}
        />
        <Button type="primary" onClick={() => navigate('create-staff')}>
          Create Staff
        </Button>
      </Flex>
      <Row>
        <Col span={24}>
          <div className="p-5 bg-white">
            <Table columns={columns} dataSource={dataSource} rowKey="key" pagination={{ pageSize: 10 }} scroll={{ x: SCREEN_LG }} />
          </div>
        </Col>
      </Row>

      {/* </Content> */}
    </ContentWrapperDark>
  );
};

export default StaffManagementPage;
