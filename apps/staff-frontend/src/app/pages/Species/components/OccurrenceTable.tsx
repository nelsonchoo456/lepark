import { useAuth } from '@lepark/common-ui';
import { deleteOccurrence, OccurrenceResponse, StaffResponse } from '@lepark/data-access';
import { Button, Flex, Input, message, Table, TableProps, Tag, Tooltip } from 'antd';
import moment from 'moment';
import React, { useEffect, useState, useMemo } from 'react';
import { FiEye, FiSearch } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { RiEdit2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useFetchOccurrencesForSpecies } from '../../../hooks/Occurrences/useFetchOccurrencesForSpecies';
import { useFetchOccurrences } from '../../../hooks/Occurrences/useFetchOccurrences';

interface OccurrenceTableProps {
  speciesId: string;
  loading: boolean;
}

const OccurrenceTable: React.FC<OccurrenceTableProps> = ({ speciesId }) => {
  const { occurrences, loading, triggerFetch } = useFetchOccurrences();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [occurrenceToBeDeleted, setOccurrenceToBeDeleted] = useState<OccurrenceResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOccurrences = useMemo(() => {
    return occurrences
      .filter((occurrence) => occurrence.speciesId === speciesId)
      .filter((occurrence) =>
        Object.values(occurrence).some((value) => 
          value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
  }, [searchQuery, occurrences, speciesId]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };



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
      width: '25%',
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
      width: '25%',
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
      width: '25%',
    },
    {
      title: 'Last Observed',
      dataIndex: 'dateObserved',
      key: 'dateObserved',
      render: (text) => moment(text).format('D MMM YY'),
      sorter: (a, b) => {
        return moment(a.dateObserved).valueOf() - moment(b.dateObserved).valueOf();
      },
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="left" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigateToDetails(record.id)} />
          </Tooltip>
          {/* <Tooltip title="Archive Occurrence">
            <Button
              type="link"
              icon={<FiArchive />}
              // onClick={() => navigateToSpecies(record.speciesId)}
            />
          </Tooltip> */}
        </Flex>
      ),
      width: '10%',
    },
  ];

  return (
    <>
      {contextHolder}
      <Input 
        suffix={<FiSearch />} 
        placeholder="Search in Occurrences..." 
        className="mb-4 bg-white" 
        variant="filled" 
        onChange={handleSearch}
      />
      <Table dataSource={filteredOccurrences} columns={columns} rowKey="id" loading={loading} />
    </>
  );
};

export default OccurrenceTable;
