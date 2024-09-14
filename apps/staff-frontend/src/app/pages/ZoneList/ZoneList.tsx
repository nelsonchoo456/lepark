import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Table, TableProps, Tag, Flex, Tooltip, Typography } from 'antd';
import moment from 'moment';
import PageHeader from '../../components/main/PageHeader';
import { FiEye, FiSearch } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { StaffResponse, StaffType } from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';
import { useFetchZones } from '../../hooks/Zones/useFetchZones';

const ZoneList: React.FC = () => {
  const { zones, loading } = useFetchZones();
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();

  const navigateToDetails = (occurrenceId: string) => {
    navigate(`/zones/${occurrenceId}`);
  };

  const navigateToSpecies = (speciesId: string) => {
    navigate(`/species/viewSpeciesDetails/${speciesId}`);
  };

  const columns: TableProps['columns'] = [
    {
      title: 'Zone Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Flex justify="space-between" align="center" className="font-semibold">
          {text}
        </Flex>
      ),
      sorter: (a, b) => {
        return a.name.localeCompare(b.name);
      },
      width: '50%',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <Typography.Paragraph
          ellipsis={{
            rows: 2,
          }}
        >
          {text}
        </Typography.Paragraph>
      ),
      sorter: (a, b) => {
        return a.description.localeCompare(b.description);
      },
      width: '50%',
    },
    {
      title: 'Status',
      dataIndex: 'zoneStatus',
      key: 'zoneStatus',
      render: (text) => {
        switch (text) {
          case 'OPEN':
            return (
              <Tag color="green" bordered={false}>
                Open
              </Tag>
            );
          case 'UNDER_CONSTRUCTION':
            return (
              <Tag color="red" bordered={false}>
                Under Construction
              </Tag>
            );
          default:
            return (
              <Tag color="red" bordered={false}>
                Limited Access
              </Tag>
            );
        }
      },
      filters: [
        { text: 'Open', value: 'OPEN' },
        { text: 'Under Construction', value: 'UNDER_CONSTRUCTION' },
        { text: 'Limited Access', value: 'LIMITED_ACCESS' },
        { text: 'Closed', value: 'CLOSED' },
      ],
      onFilter: (value, record) => record.parkStatus === value,
      width: '1%',
    },
    {
      title: 'Actions',
      key: 'actions',
      dataIndex: 'id',
      render: (id) => (
        <Flex justify="center">
          <Tooltip title="Details Page coming soon">
            <Button type="link" icon={<FiEye />} onClick={() => navigateTo(id)} disabled />
          </Tooltip>
          <Tooltip title="Edit Page coming soon">
            <Button type="link" icon={<RiEdit2Line />} onClick={() => navigateTo(`${id}/edit`)} disabled />
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  const columnsForSuperadmin: TableProps['columns'] = [
    {
      title: 'Park',
      dataIndex: 'parkName',
      key: 'parkName',
      render: (text) => (
        <Flex justify="space-between" align="center">
          {text}
        </Flex>
      ),
      sorter: (a, b) => {
        return a.name.localeCompare(b.name);
      },
      width: '33%',
    },
    {
      title: 'Zone Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Flex justify="space-between" align="center" className="font-semibold">
          {text}
        </Flex>
      ),
      sorter: (a, b) => {
        return a.name.localeCompare(b.name);
      },
      width: '33%',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <Typography.Paragraph
          ellipsis={{
            rows: 2,
          }}
        >
          {text}
        </Typography.Paragraph>
      ),
      sorter: (a, b) => {
        return a.description.localeCompare(b.description);
      },
      width: '33%',
    },
    {
      title: 'Status',
      dataIndex: 'zoneStatus',
      key: 'zoneStatus',
      render: (text) => {
        switch (text) {
          case 'OPEN':
            return (
              <Tag color="green" bordered={false}>
                Open
              </Tag>
            );
          case 'UNDER_CONSTRUCTION':
            return (
              <Tag color="red" bordered={false}>
                Under Construction
              </Tag>
            );
          default:
            return (
              <Tag color="red" bordered={false}>
                Limited Access
              </Tag>
            );
        }
      },
      filters: [
        { text: 'Open', value: 'OPEN' },
        { text: 'Under Construction', value: 'UNDER_CONSTRUCTION' },
        { text: 'Limited Access', value: 'LIMITED_ACCESS' },
        { text: 'Closed', value: 'CLOSED' },
      ],
      onFilter: (value, record) => record.parkStatus === value,
      width: '1%',
    },
    {
      title: 'Actions',
      key: 'actions',
      dataIndex: 'id',
      render: (id) => (
        <Flex justify="center">
          <Tooltip title="Details Page coming soon">
            <Button type="link" icon={<FiEye />} onClick={() => navigateTo(id)} disabled />
          </Tooltip>
          <Tooltip title="Edit Page coming soon">
            <Button type="link" icon={<RiEdit2Line />} onClick={() => navigateTo(`${id}/edit`)} disabled />
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  const navigateTo = (occurenceId: string) => {
    navigate(`/zone/${occurenceId}`);
  };

  return (
    <ContentWrapperDark>
      <PageHeader>Zones Management</PageHeader>
      <Flex justify="end" gap={10}>
        <Input suffix={<FiSearch />} placeholder="Search in Zones..." className="mb-4 bg-white" variant="filled" />
        <Button
          type="primary"
          onClick={() => {
            navigate('/zone/create');
          }}
        >
          Create Zone
        </Button>
      </Flex>

      <Card>
        {user?.role === StaffType.SUPERADMIN ? (
          <Table dataSource={zones} columns={columnsForSuperadmin} rowKey="id" loading={loading} />
        ) : (
          <Table dataSource={zones} columns={columns} rowKey="id" loading={loading} />
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default ZoneList;
