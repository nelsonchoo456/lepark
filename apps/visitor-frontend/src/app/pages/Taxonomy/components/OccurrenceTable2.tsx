import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Tooltip, Flex, TableProps, message } from 'antd';
import { FiArchive, FiExternalLink, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
  deleteOccurrence,
  getOccurrencesBySpeciesId,
  getOccurrencesBySpeciesIdByParkId,
  OccurrenceResponse,
  StaffResponse,
} from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';
import { useAuth } from '@lepark/common-ui';
import { useFetchOccurrences } from '../../../hooks/Occurrences/useFetchOccurrences';
import { MdDeleteOutline } from 'react-icons/md';

interface OccurrenceTableProps {
  speciesId: string;
  loading: boolean;
}

const OccurrenceTable2: React.FC<OccurrenceTableProps> = ({ speciesId }) => {
  const { occurrences, loading, triggerFetch } = useFetchOccurrences();
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();

  const navigateToDetails = (occurrenceId: string) => {
    navigate(`/occurrences/${occurrenceId}`);
  };

  const navigateToSpecies = (speciesId: string) => {
    navigate(`/species/${speciesId}`);
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
      sorter: (a, b) => {
        return a.speciesName.localeCompare(b.speciesName);
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
    {
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
          </Tooltip> */}
        </Flex>
      ),
      width: '1%',
    },
  ];

  const columnsForSuperadmin: TableProps<OccurrenceResponse & { speciesName: string }>['columns'] = [
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
      sorter: (a, b) => {
        return a.speciesName.localeCompare(b.speciesName);
      },
      width: '33%',
    },
    {
      title: 'Park, Zone',
      render: (_, record) => (
        <div>
          <p className="font-semibold">{record.parkName}</p>
          <div className="flex">
            <p className="opacity-50 mr-2">Zone:</p>
            {record.zoneName}
          </div>
        </div>
      ),
      sorter: (a, b) => {
        if (a.parkName && b.parkName) {
          return a.parkName.localeCompare(b.parkName);
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
  ];

  return <Table dataSource={occurrences} columns={columns} rowKey="id" loading={loading} />;
};

export default OccurrenceTable2;
