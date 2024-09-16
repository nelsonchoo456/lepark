import { useAuth } from '@lepark/common-ui';
import { deleteOccurrence, OccurrenceResponse, StaffResponse } from '@lepark/data-access';
import { Button, Flex, message, Table, TableProps, Tag, Tooltip } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FiEye } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { RiEdit2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useFetchOccurrencesForSpecies } from '../../../hooks/Occurrences/useFetchOccurrencesForSpecies';
import { useFetchOccurrences } from '../../../hooks/Occurrences/useFetchOccurrences';

interface OccurrenceTableProps {
  speciesId: string;
  loading: boolean;
}

const OccurrenceTable2: React.FC<OccurrenceTableProps> = ({ speciesId }) => {
  const { occurrences, loading, triggerFetch } = useFetchOccurrences();
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [occurrenceToBeDeleted, setOccurrenceToBeDeleted] = useState<OccurrenceResponse | null>(null);
  const [filteredOccurrences, setFilteredOccurrences] = useState<OccurrenceResponse[]>([]);

  useEffect(() => {
    // Filter occurrences based on speciesId
    const filtered = occurrences.filter((occurrence) => occurrence.speciesId === speciesId);
    setFilteredOccurrences(filtered);
  }, [occurrences, speciesId]);

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

  const columnsForAccess: TableProps<OccurrenceResponse & { speciesName: string }>['columns'] = [
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
          <Tooltip title="Delete">
            <Button
              danger
              type="link"
              icon={<MdDeleteOutline className="text-error" />}
              onClick={() => showDeleteModal(record as OccurrenceResponse)}
            />
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

  // Confirm Delete Modal utility
  const cancelDelete = () => {
    setOccurrenceToBeDeleted(null);
    setDeleteModalOpen(false);
  };

  const showDeleteModal = (occurrence: OccurrenceResponse) => {
    setDeleteModalOpen(true);
    setOccurrenceToBeDeleted(occurrence);
  };

  const deleteOccurrenceToBeDeleted = async () => {
    try {
      if (!occurrenceToBeDeleted) {
        throw new Error('Unable to delete Occurrence at this time');
      }
      await deleteOccurrence(occurrenceToBeDeleted.id, user?.id as string);
      // triggerFetch();
      setOccurrenceToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.open({
        type: 'success',
        content: `Deleted Occurrence: ${occurrenceToBeDeleted.title}.`,
      });
    } catch (error) {
      console.log(error);
      setOccurrenceToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.open({
        type: 'error',
        content: `Unable to delete Occurrence at this time. Please try again later.`,
      });
    }
  };

  return (
    <>
      {user && ['MANAGER', 'SUPERADMIN', 'BOTANIST', 'ARBORIST'].includes(user.role) ? (
        <Table dataSource={filteredOccurrences} columns={columnsForAccess} rowKey="id" loading={loading} />
      ) : (
        <Table dataSource={filteredOccurrences} columns={columns} rowKey="id" loading={loading} />
      )}
    </>
  );
};

export default OccurrenceTable2;