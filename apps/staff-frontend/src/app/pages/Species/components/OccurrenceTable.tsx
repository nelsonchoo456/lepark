import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Tooltip, Flex, TableProps } from 'antd';
import { FiArchive, FiExternalLink, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { getOccurrencesBySpeciesId, OccurrenceResponse } from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';

interface OccurrenceTableProps {
  speciesId: string;
  loading: boolean;
}

const OccurrenceTable: React.FC<OccurrenceTableProps> = ({ speciesId }) => {
  const [occurrences, setOccurrences] = useState<(OccurrenceResponse & { speciesName: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOccurrences = async () => {
      try {
        const fetchedOccurrences = await getOccurrencesBySpeciesId(speciesId);
        setOccurrences(fetchedOccurrences.data);
      } catch (error) {
        console.error('Error fetching occurrences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOccurrences();
  }, [speciesId]);

  const navigateToDetails = (occurrenceId: string) => {
    navigate(`/occurrences/${occurrenceId}`);
  };

  const columns: TableProps<OccurrenceResponse & { speciesName: string }>['columns'] = [
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

  return <Table dataSource={occurrences} columns={columns} rowKey="id" loading={loading} />;
};

export default OccurrenceTable;
