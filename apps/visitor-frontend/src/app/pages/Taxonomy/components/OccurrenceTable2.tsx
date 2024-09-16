import { useAuth } from '@lepark/common-ui';
import {
  OccurrenceResponse,
  StaffResponse
} from '@lepark/data-access';
import { Flex, Table, TableProps, Tag } from 'antd';
import moment from 'moment';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchOccurrences } from '../../../hooks/Occurrences/useFetchOccurrences';
import { useFetchOccurrencesForSpecies } from '../../../hooks/Occurrences/useFetchOccurrencesForSpecies';

interface OccurrenceTableProps {
  speciesId: string;
  loading: boolean;
}

const OccurrenceTable2: React.FC<OccurrenceTableProps> = ({ speciesId }) => {
  const { occurrences, loading, triggerFetch } = useFetchOccurrencesForSpecies(speciesId);
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();

  const navigateToDetails = (occurrenceId: string) => {
    navigate(`/occurrences/${occurrenceId}`);
  };

  const columns: TableProps<OccurrenceResponse>['columns'] = [
    {
      title: 'Label',
      dataIndex: 'title',
      key: 'title',
      render: (text) => text,
      sorter: (a, b) => {
        return a.title.localeCompare(b.title);
      },
      width: '33%',
    },
    {
      title: 'Zone',
      dataIndex: 'zoneName',
      key: 'zoneName',
      render: (text, record) => (
        <Flex justify="space-between" align="center">
          {text}
        </Flex>
      ),
      sorter: (a, b) => {
        if (a.zoneName && b.zoneName) {
          return a.zoneName.localeCompare(b.zoneName);
        }
        return a.zoneId - b.zoneId;
      },
      width: '33%',
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
      filters: [
        { text: 'Healthy', value: 'HEALTHY' },
        { text: 'Monitor After Treatment', value: 'MONITOR_AFTER_TREATMENT' },
        { text: 'Needs Attention', value: 'NEEDS_ATTENTION' },
        { text: 'Urgent Action Required', value: 'URGENT_ACTION_REQUIRED' },
        { text: 'Removed', value: 'REMOVED' },
      ],
      onFilter: (value, record) => record.occurrenceStatus === value,
      width: '1%',
    },
    {
      title: 'Last Observed',
      dataIndex: 'dateObserved',
      key: 'dateObserved',
      render: (text) => moment(text).format('D MMM YY'),
      sorter: (a, b) => {
        return moment(a.dateObserved).valueOf() - moment(b.dateObserved).valueOf();
      },
      width: '1%',
    },
    /*{
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigateToDetails(record.id)} />
          </Tooltip>
          {/* <Tooltip title="Archive Occurrence">
            <Button
              type="link"
              icon={<FiArchive />}
              // onClick={() => navigateToSpecies(record.speciesId)}
            />
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    }, */
  ];

  return <Table dataSource={occurrences} columns={columns} rowKey="id" loading={loading} />;
};

export default OccurrenceTable2;
