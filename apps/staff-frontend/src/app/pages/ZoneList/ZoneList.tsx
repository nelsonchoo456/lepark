import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Table, TableProps, Tag, Flex, Tooltip, message } from 'antd';
import moment from 'moment';
import PageHeader from '../../components/main/PageHeader';
import { FiArchive, FiExternalLink, FiEye, FiSearch } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { getAllZones, getZonesByParkId, StaffResponse, StaffType, ZoneResponse } from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';

const ZoneList: React.FC = () => {
  const [zones, setZones] = useState<ZoneResponse[]>([]);
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(user);
    if (!user || !user.parkId) return;
    if (user?.role === StaffType.SUPERADMIN) {
      fetchAllZones();
    } else {
      fetchZonesByParkId(user?.parkId);
    }
  }, [user]);

  const fetchAllZones = async () => {
    try {
      setLoading(true);
      const response = await getAllZones();
      setZones(response.data);
    } catch (error) {
      message.error('Failed to fetch Zones');
    } finally {
      setLoading(false);
    }
  };

  const fetchZonesByParkId = async (parkId: number) => {
    try {
      setLoading(true);
      const response = await getZonesByParkId(parkId);
      setZones(response.data);
    } catch (error) {
      message.error('Failed to fetch Zones');
    } finally {
      setLoading(false);
    }
  };

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
