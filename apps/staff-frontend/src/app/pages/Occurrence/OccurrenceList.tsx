import { ContentWrapperDark } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Table, TableProps, Tag, Row, Col, Flex, Collapse, Tooltip } from 'antd';
import { occurrences } from './occurrences';
import moment from 'moment';
import PageHeader from '../../components/main/PageHeader';
import { FiArchive, FiExternalLink, FiEye, FiSearch } from 'react-icons/fi';

const OccurrenceList = () => {
  const navigate = useNavigate();

  const columns: TableProps['columns'] = [
    {
      title: 'Species Name',
      dataIndex: 'speciesName',
      key: 'speciesName',
      render: (text) => (
        <Flex justify="space-between" align="center">
          {text}
          <Tooltip title="Go to Species">
            <Button type="link" icon={<FiExternalLink />} />
          </Tooltip>
        </Flex>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => text,
    },
    {
      title: 'Status',
      dataIndex: 'occurrenceStatus',
      key: 'occurrenceStatus',
      render: (text) => {
        switch (text) {
          case 'ACTIVE':
            return (
              <Tag color="green" bordered={false}>
                Active
              </Tag>
            );
          case 'INACTIVE':
            return <Tag bordered={false}>Inactive</Tag>;
          default:
            return 'Status Unknown';
        }
      },
    },
    {
      title: 'Number',
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
      render: () => (
        <Flex justify="center">
          <Button type="link" icon={<FiArchive />} />
          <Button type="link" icon={<FiEye />} onClick={() => navigateTo('orchidID1')} />
        </Flex>
      ),
      width: '1%',
    },
  ];

  const navigateTo = (occurrenceId: string) => {
    navigate(`/occurrence/${occurrenceId}`);
  };

  return (
    <ContentWrapperDark>
      <PageHeader>Occurrence Management</PageHeader>
      <Flex justify="end" gap={10}>
        <Input suffix={<FiSearch />} placeholder="Search in Occurrences..." className="mb-4 bg-white" variant="filled" />
        <Button
          type="primary"
          onClick={() => {
            navigate('/occurrence/create');
          }}
        >
          Create Occurrence
        </Button>
      </Flex>

      <Card>
        <Table dataSource={occurrences} columns={columns} rowKey="id" />
      </Card>
    </ContentWrapperDark>
  );
};

export default OccurrenceList;
