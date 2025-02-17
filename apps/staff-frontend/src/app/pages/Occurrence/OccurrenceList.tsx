import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Table, TableProps, Tag, Flex, Tooltip, message } from 'antd';
import moment from 'moment';
import { FiArchive, FiExternalLink, FiEye, FiSearch } from 'react-icons/fi';
import { useEffect, useState, useMemo } from 'react';
import { getAllOccurrences, OccurrenceResponse, getSpeciesById, deleteOccurrence, StaffType, StaffResponse } from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';
import PageHeader2 from '../../components/main/PageHeader2';
import { MdDeleteOutline } from 'react-icons/md';
import { useFetchOccurrences } from '../../hooks/Occurrences/useFetchOccurrences';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { SCREEN_LG } from '../../config/breakpoints';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const OccurrenceList: React.FC = () => {
  const { occurrences, loading, triggerFetch } = useFetchOccurrences();
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [occurrenceToBeDeleted, setOccurrenceToBeDeleted] = useState<OccurrenceResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOccurrences = useMemo(() => {
    return occurrences.filter((occurrence) =>
      Object.values(occurrence).some((value) => value?.toString().toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [searchQuery, occurrences]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navigateToDetails = (occurrenceId: string) => {
    navigate(`/occurrences/${occurrenceId}`);
  };

  const navigateToSpecies = (speciesId: string) => {
    navigate(`/species/${speciesId}`);
  };

  const columns: TableProps<OccurrenceResponse>['columns'] = [
    {
      title: 'Occurrence Name',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => {
        return a.title.localeCompare(b.title);
      },
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
    },
    {
      title: 'Occurrence Status',
      dataIndex: 'occurrenceStatus',
      key: 'occurrenceStatus',
      render: (text) => {
        switch (text) {
          case 'HEALTHY':
            return (
              <Tag color="green" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'MONITOR_AFTER_TREATMENT':
            return (
              <Tag color="yellow" className="text-wrap max-w-48" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'NEEDS_ATTENTION':
            return (
              <Tag color="orange" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'URGENT_ACTION_REQUIRED':
            return (
              <Tag color="red" className="text-wrap max-w-48" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'REMOVED':
            return <Tag bordered={false}>REMOVED</Tag>;
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
    },
    {
      title: 'Last Observed',
      dataIndex: 'dateObserved',
      key: 'dateObserved',
      render: (text) => moment(text).format('D MMM YY'),
      sorter: (a, b) => {
        return moment(a.dateObserved).valueOf() - moment(b.dateObserved).valueOf();
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Occurrence">
            <Button type="link" icon={<FiEye />} onClick={() => navigateToDetails(record.id)} />
          </Tooltip>
          {user?.role === StaffType.SUPERADMIN ||
            ((user?.role === StaffType.MANAGER || user?.role === StaffType.ARBORIST || user?.role === StaffType.BOTANIST) && (
              <>
                <Tooltip title="Edit Occurrence">
                  <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/occurrences/${record.id}/edit`)} />
                </Tooltip>
                <Tooltip title="Delete Occurrence">
                  <Button
                    danger
                    type="link"
                    icon={<MdDeleteOutline className="text-error" />}
                    onClick={() => showDeleteModal(record as OccurrenceResponse)}
                  />
                </Tooltip>
              </>
            ))}

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
      title: 'Occurrence Name',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => {
        return a.title.localeCompare(b.title);
      },
      // width: '33%',
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
      // width: '33%',
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
      // width: '33%',
    },
    {
      title: 'Occurrence Status',
      dataIndex: 'occurrenceStatus',
      key: 'occurrenceStatus',
      render: (text) => {
        switch (text) {
          case 'HEALTHY':
            return (
              <Tag color="green" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'MONITOR_AFTER_TREATMENT':
            return (
              <Tag color="yellow" className="text-wrap max-w-48" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'NEEDS_ATTENTION':
            return (
              <Tag color="orange" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'URGENT_ACTION_REQUIRED':
            return (
              <Tag color="red" className="text-wrap max-w-48" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'REMOVED':
            return <Tag bordered={false}>REMOVED</Tag>;
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
      //width: '20%',
    },
    {
      title: 'Last Observed',
      dataIndex: 'dateObserved',
      key: 'dateObserved',
      render: (text) => moment(text).format('D MMM YY'),
      sorter: (a, b) => {
        return moment(a.dateObserved).valueOf() - moment(b.dateObserved).valueOf();
      },
      // width: '1%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Occurrence">
            <Button type="link" icon={<FiEye />} onClick={() => navigateToDetails(record.id)} />
          </Tooltip>
          <Tooltip title="Edit Occurrence">
            <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/occurrences/${record.id}/edit`)} />
          </Tooltip>
          <Tooltip title="Delete Occurrence">
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
      width: '120px',
      // width: '1%',
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
      if (!occurrenceToBeDeleted || !user) {
        throw new Error('Unable to delete Occurrence at this time');
      }
      await deleteOccurrence(occurrenceToBeDeleted.id, user.id);
      triggerFetch();
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

  const breadcrumbItems = [
    {
      title: 'Occurrence Management',
      pathKey: '/occurrences',
      isMain: true,
      isCurrent: true,
    },
  ];

  const canCreateOccurrence =
    user?.role === StaffType.SUPERADMIN ||
    user?.role === StaffType.MANAGER ||
    user?.role === StaffType.BOTANIST ||
    user?.role === StaffType.ARBORIST;

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <ConfirmDeleteModal
        onConfirm={deleteOccurrenceToBeDeleted}
        open={deleteModalOpen}
        onCancel={cancelDelete}
        description="Deleting an Occurrence will delete all of its Logs."
      ></ConfirmDeleteModal>
      <Flex justify="end" gap={10}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search in Occurrences..."
          className="mb-4 bg-white"
          variant="filled"
          onChange={handleSearch}
        />
        {canCreateOccurrence && (
          <Button
            type="primary"
            onClick={() => {
              navigate('/occurrences/create');
            }}
          >
            Create Occurrence
          </Button>
        )}
      </Flex>

      <Card>
        {user?.role === StaffType.SUPERADMIN ? (
          <Table dataSource={filteredOccurrences} columns={columnsForSuperadmin} rowKey="id" loading={loading} scroll={{ x: SCREEN_LG }} />
        ) : (
          <Table dataSource={filteredOccurrences} columns={columns} rowKey="id" loading={loading} scroll={{ x: SCREEN_LG }} />
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default OccurrenceList;
