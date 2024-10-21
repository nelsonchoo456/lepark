import { useAuth } from '@lepark/common-ui';
import { deleteOccurrence, OccurrenceResponse, StaffResponse } from '@lepark/data-access';
import { Button, Flex, message, Table, TableProps, Tag, Tooltip } from 'antd';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { FiEye } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { RiEdit2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useFetchOccurrencesForSpecies } from '../../../hooks/Occurrences/useFetchOccurrencesForSpecies';
import { useFetchOccurrences } from '../../../hooks/Occurrences/useFetchOccurrences';
import { Input } from 'antd';
import { FiSearch } from 'react-icons/fi';
import { SCREEN_LG } from '../../../config/breakpoints';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

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
      title: 'Occurrence Name',
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
            return <Tag color="green" bordered={false}>{formatEnumLabelToRemoveUnderscores(text)}</Tag>;
          case 'MONITOR_AFTER_TREATMENT':
            return <Tag color="yellow" bordered={false}>{formatEnumLabelToRemoveUnderscores(text)}</Tag>;
          case 'NEEDS_ATTENTION':
            return <Tag color="orange" bordered={false}>{formatEnumLabelToRemoveUnderscores(text)}</Tag>;
          case 'URGENT_ACTION_REQUIRED':
            return <Tag color="red" bordered={false}>{formatEnumLabelToRemoveUnderscores(text)}</Tag>;
          case 'REMOVED':
            return <Tag bordered={false}>{formatEnumLabelToRemoveUnderscores(text)}</Tag>;
        }
      },
      filters: [
        { text: formatEnumLabelToRemoveUnderscores('HEALTHY'), value: 'HEALTHY' },
        { text: formatEnumLabelToRemoveUnderscores('MONITOR_AFTER_TREATMENT'), value: 'MONITOR_AFTER_TREATMENT' },
        { text: formatEnumLabelToRemoveUnderscores('NEEDS_ATTENTION'), value: 'NEEDS_ATTENTION' },
        { text: formatEnumLabelToRemoveUnderscores('URGENT_ACTION_REQUIRED'), value: 'URGENT_ACTION_REQUIRED' },
        { text: formatEnumLabelToRemoveUnderscores('REMOVED'), value: 'REMOVED' },
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
      <Table dataSource={filteredOccurrences} columns={columns} rowKey="id" loading={loading} scroll={{ x: SCREEN_LG }} />
    </>
  );
};

export default OccurrenceTable;
