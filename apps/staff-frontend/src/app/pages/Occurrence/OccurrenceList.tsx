import { ContentWrapperDark } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Table, TableProps, Tag, Flex, Tooltip, message } from 'antd';
import moment from 'moment';
import PageHeader from '../../components/main/PageHeader';
import { FiArchive, FiExternalLink, FiEye, FiSearch } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { getAllOccurrences, OccurrenceResponse, getSpeciesById } from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';

const OccurrenceList: React.FC = () => {
  const [occurrences, setOccurrences] = useState<(OccurrenceResponse & { speciesName: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOccurrences();
  }, []);

  const fetchOccurrences = async () => {
    try {
      const response = await getAllOccurrences();
      const occurrencesWithSpeciesNames = await Promise.all(
        response.data.map(async (occurrence) => {
          const speciesResponse = await getSpeciesById(occurrence.speciesId);
          return { ...occurrence, speciesName: speciesResponse.data.speciesName };
        })
      );
      setOccurrences(occurrencesWithSpeciesNames);
    } catch (error) {
      message.error('Failed to fetch occurrences');
    } finally {
      setLoading(false);
    }
  };

  const navigateToDetails = (occurrenceId: string) => {
    navigate(`/occurrences/${occurrenceId}`);
  };

  const navigateToSpecies = (speciesId: string) => {
    navigate(`/species/${speciesId}`);
  };

  const columns: TableProps<OccurrenceResponse & { speciesName: string }>['columns'] = [
    {
      title: 'Species Name',
      dataIndex: 'speciesName',
      key: 'speciesName',
      render: (text, record) => (
        <Flex justify="space-between" align="center">
          {text}
          <Tooltip title="Go to Species">
            <Button type="link" icon={<FiExternalLink />} onClick={() => navigateToSpecies(record.speciesId)} />
          </Tooltip>
        </Flex>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => text,
    },
    {
      title: 'Occurrence Status',
      dataIndex: 'occurrenceStatus',
      key: 'occurrenceStatus',
      render: (text) => {
        switch (text) {
          case 'HEALTHY':
            return <Tag color="green">HEALTHY</Tag>;
          case 'MONITOR_AFTER_TREATMENT':
            return <Tag color="yellow">MONITOR_AFTER_TREATMENT</Tag>;
          case 'NEEDS_ATTENTION':
            return <Tag color="orange">NEEDS_ATTENTION</Tag>;
          case 'URGENT_ACTION_REQUIRED':
            return <Tag color="red">URGENT_ACTION_REQUIRED</Tag>;
          case 'REMOVED':
            return <Tag>REMOVED</Tag>;
        }
      },
    },
    {
      title: 'Number of Plants',
      dataIndex: 'numberOfPlants',
      key: 'numberOfPlants',
      render: (text) => text,
    },
    {
      title: 'Last Observed',
      dataIndex: 'dateObserved',
      key: 'dateObserved',
      render: (text) => moment(text).format('D MMM YY'),
    },
    {
      title: 'Date of Birth',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (text) => moment(text).format('D MMM YY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigateToDetails(record.id)} />
          </Tooltip>
          <Tooltip title="Edit Details">
            <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/occurrences/${record.id}/edit`)} />
          </Tooltip>
          <Tooltip title="Archive Occurrence">
            <Button
              type="link"
              icon={<FiArchive />}
              // onClick={() => navigateToSpecies(record.speciesId)}
            />
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader>Occurrence Management</PageHeader>
      <Flex justify="end" gap={10}>
        <Input suffix={<FiSearch />} placeholder="Search in Occurrences..." className="mb-4 bg-white" variant="filled" />
        <Button
          type="primary"
          onClick={() => {
            navigate('/occurrences/create');
          }}
        >
          Create Occurrence
        </Button>
      </Flex>

      <Card>
        <Table dataSource={occurrences} columns={columns} rowKey="id" loading={loading} />
      </Card>
    </ContentWrapperDark>
  );
};

export default OccurrenceList;
