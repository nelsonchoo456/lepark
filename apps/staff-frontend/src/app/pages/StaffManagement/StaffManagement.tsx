import React, { useRef, useState, useEffect } from 'react';
import { SearchOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import type { InputRef, TableColumnsType, TableColumnType } from 'antd';
import { Button, Input, Space, Table, Layout, Row, Col, Dropdown, Menu } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { LogoText } from '@lepark/common-ui';

const { Header, Content } = Layout;

interface DataType {
  key: string;
  name: string;
  role: string;
  email: string;
  contactNumber: string;
  active: boolean;
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
    active: true,
  },
  {
    key: '2',
    name: 'Jane Smith',
    role: 'Botanist',
    email: 'jane.smith@example.com',
    contactNumber: '234-567-8901',
    active: false,
  },
  {
    key: '3',
    name: 'Alice Johnson',
    role: 'Arborist',
    email: 'alice.johnson@example.com',
    contactNumber: '345-678-9012',
    active: true,
  },
  {
    key: '4',
    name: 'Bob Brown',
    role: 'Landscaper',
    email: 'bob.brown@example.com',
    contactNumber: '456-789-0123',
    active: false,
  },
  {
    key: '5',
    name: 'Charlie Davis',
    role: 'Maintenance Worker',
    email: 'charlie.davis@example.com',
    contactNumber: '567-890-1234',
    active: true,
  },
  {
    key: '6',
    name: 'Diana Evans',
    role: 'Cleaner',
    email: 'diana.evans@example.com',
    contactNumber: '678-901-2345',
    active: true,
  },
  {
    key: '7',
    name: 'Evan Foster',
    role: 'Landscape Architect',
    email: 'evan.foster@example.com',
    contactNumber: '789-012-3456',
    active: false,
  },
  {
    key: '8',
    name: 'Fiona Green',
    role: 'Park Ranger',
    email: 'fiona.green@example.com',
    contactNumber: '890-123-4567',
    active: true,
  },
];

const StaffManagementPage: React.FC = () => {
  const [staff, setStaff] = useState<DataType[]>(mockData);
  // const [staff, setStaff] = useState<DataType[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState<DataIndex | ''>('');
  const searchInput = useRef<InputRef>(null);

  useEffect(() => {
    // Fetch staff data from an API or service
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    // Replace with actual data fetching logic
    const data = await fetch('/api/staff').then((res) => res.json());
    setStaff(data);
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps['confirm'],
    dataIndex: DataIndex,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex,
  ): TableColumnType<DataType> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div className="p-2" onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          className="mb-2 block"
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            className="w-24"
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            className="w-24"
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        <span className="text-green-500">{text}</span>
      ),
  });

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
      ...getColumnSearchProps('name'),
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
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      width: '10%',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.active === value,
      render: (active) => (active ? 'Active' : 'Inactive'),
    },
    {
        title: 'Actions',
        key: 'actions',
        width: '5%',
        render: () => (
            <Dropdown
            menu={{
              items: [
                { key: '1', label: 'Edit' },
                { key: '2', label: 'Delete' },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined style={{ color: 'grey' }} />} />
          </Dropdown>
        ),
      },
  ];

  return (
    <Layout>
      <Header className="bg-green-300"></Header>
      <Content className="p-10">
        <Row className="flex justify-between items-center mb-4">
          <Col>
            <LogoText className="text-xl font-bold">Staff Management</LogoText>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                /* Add staff logic */
              }}
            >
              Add Staff
            </Button>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div className="p-5 bg-white shadow-lg rounded-lg">
              <Table
                columns={columns}
                dataSource={staff}
                rowKey="key"
                pagination={{ pageSize: 10 }}
              />
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default StaffManagementPage;
