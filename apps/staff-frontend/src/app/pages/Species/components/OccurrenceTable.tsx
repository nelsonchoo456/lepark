import React from 'react';
import { Table, Tag, Button, Tooltip, Flex } from 'antd';
import { FiExternalLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

interface OccurrenceTableProps {
  occurrences: any[]; // Replace 'any' with the appropriate type for your occurrences
  loading: boolean;
}

const OccurrenceTable: React.FC<OccurrenceTableProps> = ({ occurrences, loading }) => {
  const navigate = useNavigate();

  const navigateToSpecies = (speciesId: string) => {
    navigate(`/species/viewSpeciesDetails/${speciesId}`);
  };

  const columns = [
    {
      title: 'Species Name',
      dataIndex: 'speciesId',
      key: 'speciesName',
      render: (text: string) => (
        <Flex justify="space-between" align="center">
          {text}
        </Flex>
      ),
    },
    {
      title: 'Label',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => text,
    },
    {
      title: 'Occurrence Status',
      dataIndex: 'occurrenceStatus',
      key: 'occurrenceStatus',
      render: (text: string) => {
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
          default:
            return text;
        }
      },
    },
    {
      title: 'Number of Plants',
      dataIndex: 'numberOfPlants',
      key: 'numberOfPlants',
      render: (text: string) => text,
    },
    {
      title: 'Last Observed',
      dataIndex: 'dateObserved',
      key: 'dateObserved',
      render: (text: string) => moment(text).format('D MMM YY'),
    },
  ];

  return <Table dataSource={occurrences} columns={columns} rowKey="id" loading={loading} />;
};

export default OccurrenceTable;
