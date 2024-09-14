import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Tooltip, Flex, TableProps } from 'antd';
import { FiExternalLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { getOccurrencesBySpeciesId, getOccurrencesBySpeciesIdByParkId, OccurrenceResponse, StaffResponse } from '@lepark/data-access';
import { useAuth } from '@lepark/common-ui';

interface OccurrenceTableProps {
  speciesId: string;
  loading: boolean;
}

const OccurrenceTable: React.FC<OccurrenceTableProps> = ({ speciesId, loading }) => {
  const { user, updateUser } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [occurrences, setOccurrences] = useState<OccurrenceResponse[]>([]); // Replace 'any' with the appropriate type for your occurrences

  useEffect(() => {
    const fetchOccurrences = async () => {
      try {
        let fetchedOccurrences;
        if (user?.parkId) {
          fetchedOccurrences = await getOccurrencesBySpeciesIdByParkId(speciesId, user.parkId);
        } else {
          fetchedOccurrences = await getOccurrencesBySpeciesId(speciesId);
        }
        setOccurrences(fetchedOccurrences.data);
      } catch (error) {
        console.error('Error fetching occurrences:', error);
      }
    };
    fetchOccurrences();
  }, [speciesId]);

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
  ];

  return <Table dataSource={occurrences} columns={columns} rowKey="id" loading={loading} />;
};

export default OccurrenceTable;
