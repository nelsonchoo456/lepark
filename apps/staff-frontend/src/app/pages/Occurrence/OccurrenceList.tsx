import { ContentWrapperDark } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Table, TableProps, Tag, Flex, Tooltip, message } from 'antd';
import moment from 'moment';
import { FiArchive, FiExternalLink, FiEye, FiSearch } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { getAllOccurrences, OccurrenceResponse, getSpeciesById, deleteOccurrence } from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';
import PageHeader2 from '../../components/main/PageHeader2';
import { MdDeleteOutline } from 'react-icons/md';
import { useFetchOccurrences } from '../../hooks/Occurrences/useFetchOccurrences';

const OccurrenceList: React.FC = () => {
  const { occurrences, loading, triggerFetch } = useFetchOccurrences();
  // const [occurrences, setOccurrences] = useState<(OccurrenceResponse & { speciesName: string })[]>([]);
  // const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [occurrenceToBeDeleted, setOccurrenceToBeDeleted] = useState<OccurrenceResponse | null>(null);

  // useEffect(() => {
  //   fetchOccurrences();
  // }, []);

  // const fetchOccurrences = async () => {
  //   try {
  //     const response = await getAllOccurrences();
  //     setOccurrences(response.data);
  //   } catch (error) {
  //     message.error('Failed to fetch occurrences');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const navigateToDetails = (occurrenceId: string) => {
    navigate(`/occurrences/${occurrenceId}`);
  };

  const navigateToSpecies = (speciesId: string) => {
    navigate(`/species/${speciesId}`);
  };

  const columns: TableProps<OccurrenceResponse & { speciesName: string }>['columns'] = [
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
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => text,
      sorter: (a, b) => {
        return a.title.localeCompare(b.title);
      },
      width: '67%',
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
    // {
    //   title: 'Number of Plants',
    //   dataIndex: 'numberOfPlants',
    //   key: 'numberOfPlants',
    //   render: (text) => text,
    //   sorter: (a, b) => {
    //     return a.numberOfPlants - b.numberOfPlants;
    //   },
    // },
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
    // {
    //   title: 'Date of Birth',
    //   dataIndex: 'dateOfBirth',
    //   key: 'dateOfBirth',
    //   render: (text) => moment(text).format('D MMM YY'),
    //   sorter: (a, b) => {
    //     return a.name.localeCompare(b.name);
    //   },
    // },
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
          <Button danger type="link" icon={<MdDeleteOutline className='text-error'/>} onClick={() => showDeleteModal(record as OccurrenceResponse)}  />
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
  }

  const showDeleteModal = (occurrence: OccurrenceResponse) => {
    setDeleteModalOpen(true);
    setOccurrenceToBeDeleted(occurrence);
  }
  
  const deleteOccurrenceToBeDeleted= async () => {
    try {
      if (!occurrenceToBeDeleted) {
        throw new Error("Unable to delete Occurrence at this time");
      }
      await deleteOccurrence(occurrenceToBeDeleted.id);
      // triggerFetch();
      setOccurrenceToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.open({
        type: 'success',
        content: `Deleted Occurrence: ${occurrenceToBeDeleted.title}.`,
      });
    } catch (error) {
      console.log(error)
      setOccurrenceToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.open({
        type: 'error',
        content: `Unable to delete Occurrence at this time. Please try again later.`,
      });
    }
  } 

  const breadcrumbItems = [
    {
      title: "Occurrence Management",
      pathKey: '/occurrences',
      isMain: true,
      isCurrent: true
    },
  ]

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems}/>
      <Flex justify="end" gap={10}>
        <Input suffix={<FiSearch />} placeholder="Search in Occurrences..." className="mb-4 bg-white" variant="filled" />
        <Button
          type="primary"
          onClick={() => {
            navigate('/occurrences/create');
          }}
        >
          Create Occurrence
        </Button>
      </Flex>

      <Card>
        <Table dataSource={occurrences} columns={columns} rowKey="id" loading={loading} />
      </Card>
    </ContentWrapperDark>
  );
};

export default OccurrenceList;
