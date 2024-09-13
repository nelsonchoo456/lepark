import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Table, TableProps, Tag, Flex, Tooltip } from 'antd';
import moment from 'moment';
import PageHeader from '../../components/main/PageHeader';
import { FiEye, FiSearch } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { StaffResponse, StaffType, } from '@lepark/data-access';
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
        <Flex justify="space-between" align="center">
          {text}
        </Flex>
      ),
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
            return <Tag color="red" bordered={false}>Under Construction</Tag>;
          default:
            return <Tag color="red" bordered={false}>Limited Access</Tag>;
        }
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      dataIndex: 'id',
      render: (id) => (
        <Flex justify="center">
          <Tooltip title="View details">
            <Button type="link" icon={<FiEye />} onClick={() => navigateTo(id)} />
          </Tooltip>
          <Tooltip title="Edit details">
            <Button type="link" icon={<RiEdit2Line />} onClick={() => navigateTo(`${id}/edit`)}/>
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  const navigateTo = (occurenceId: string) =>{
    navigate(`/zone/${occurenceId}`)
  }
  

  return (
    <ContentWrapperDark>
      <PageHeader>Zones Management</PageHeader>
      <Flex justify="end" gap={10}>
        <Input suffix={<FiSearch />} placeholder="Search in Zones..." className="mb-4 bg-white" variant="filled" />
        <Tooltip title={user?.role !== StaffType.SUPERADMIN 
          && user?.role !== StaffType.MANAGER 
          && user?.role !== StaffType.LANDSCAPE_ARCHITECT ? "Not allowed to create zone!" : ""}>
          <Button
            type="primary"
            onClick={() => { navigate('/zone/create'); }}
            disabled={user?.role !== StaffType.SUPERADMIN 
              && user?.role !== StaffType.MANAGER 
              && user?.role !== StaffType.LANDSCAPE_ARCHITECT}
          >
            Create Zone
          </Button>
        </Tooltip>
      </Flex>

      <Card>
        <Table
          dataSource={zones}
          columns={columns}
          rowKey="id"
          loading={loading}
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default ZoneList;
