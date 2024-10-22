import { useEffect, useMemo, useState } from 'react';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { deleteFeedback, getAllFeedback, FeedbackResponse, StaffResponse, StaffType, getParkById } from '@lepark/data-access';
import { Button, Card, Flex, Input, message, Modal, Table, TableProps, Tag, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiSearch } from 'react-icons/fi';
import { RiEdit2Line } from 'react-icons/ri';
import { MdDeleteOutline } from 'react-icons/md';
import PageHeader2 from '../../components/main/PageHeader2';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { useFetchFeedbacks } from '../../hooks/Feedback/useFetchFeedbacks';
import { SCREEN_LG } from '../../config/breakpoints';
import MainLayout from '../../components/main/MainLayout';

const getFeedbackStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return 'yellow';
    case 'RESOLVED':
      return 'green';
    case 'REJECTED':
      return 'red';
    default:
      return 'default';
  }
}

const FeedbackList = () => {
  const { feedbacks, loading, triggerFetch } = useFetchFeedbacks();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const [categoryFilters, setCategoryFilters] = useState<{ text: string; value: string }[]>([]);
  const [statusFilters, setStatusFilters] = useState<{ text: string; value: string }[]>([]);

  useEffect(() => {
    if (feedbacks.length > 0) {
      const uniqueCategories = Array.from(new Set(feedbacks.map((item) => item.feedbackCategory)));
      const uniqueStatuses = Array.from(new Set(feedbacks.map((item) => item.feedbackStatus)));

      setCategoryFilters(uniqueCategories.map((category) => ({
        text: formatEnumLabelToRemoveUnderscores(category),
        value: category
      })));
      setStatusFilters(uniqueStatuses.map((status) => ({
        text: formatEnumLabelToRemoveUnderscores(status),
        value: status
      })));
    }
  }, [feedbacks]);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((feedback) =>
      Object.values(feedback).some((value) =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, feedbacks]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // const handleDelete = async (id: string) => {
  //   try {
  //     const confirmed = await new Promise((resolve) => {
  //       Modal.confirm({
  //         title: 'Confirm Deletion?',
  //         content: 'Are you sure you want to delete this feedback? This action cannot be undone.',
  //         onOk: () => resolve(true),
  //         onCancel: () => resolve(false),
  //         okText: "Confirm Delete",
  //         okButtonProps: { danger: true }
  //       });
  //     });

  //     if (!confirmed) return;

  //     await deleteFeedback(id);
  //     triggerFetch();
  //     message.success('Feedback deleted successfully');
  //   } catch (error) {
  //     console.error('Error deleting feedback:', error);
  //     message.error('Failed to delete feedback. Please try again.');
  //   }
  // };

  const columns: TableProps<FeedbackResponse>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <Tooltip title={text}>
          <div className="font-semibold truncate max-w-[350px]">{text}</div>
        </Tooltip>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
      width: '35%',
    },
    {
      title: 'Category',
      dataIndex: 'feedbackCategory',
      key: 'feedbackCategory',
      render: (category) => formatEnumLabelToRemoveUnderscores(category),
      filters: categoryFilters,
      onFilter: (value, record) => record.feedbackCategory === value,
      width: '10%',
    },
    {
      title: 'Status',
      dataIndex: 'feedbackStatus',
      key: 'feedbackStatus',
      render: (status) => (
        <Tag color={getFeedbackStatusColor(status)} bordered={false}>
          {formatEnumLabelToRemoveUnderscores(status)}
        </Tag>
      ),
      filters: statusFilters,
      onFilter: (value, record) => record.feedbackStatus === value,
      width: '10%',
    },
    {
      title: 'Date Created',
      dataIndex: 'dateCreated',
      key: 'dateCreated',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime(),
      width: '15%',
    },
    ...(user?.role === StaffType.SUPERADMIN ? [{
      title: 'Park',
      dataIndex: 'parkId',
      key: 'parkId',
      render: (parkId: number) => <ParkName parkId={parkId} />,
      width: '15%',
    }] : []),
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Feedback">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`/feedback/${record.id}`)} />
          </Tooltip>
          {/* <Tooltip title="Delete Feedback">
            <Button danger type="link" icon={<MdDeleteOutline className="text-error" />} onClick={() => handleDelete(record.id)} />
          </Tooltip> */}
        </Flex>
      ),
      width: '10%',
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Feedback Management',
      pathKey: '/feedback',
      isMain: true,
      isCurrent: true,
    },
  ];
  return (
      <ContentWrapperDark>
        <PageHeader2 breadcrumbItems={breadcrumbItems} />
        <Flex justify="end" gap={10}>
          <Input
            suffix={<FiSearch />}
            placeholder="Search in Feedbacks..."
            onChange={handleSearch}
            className="mb-4 bg-white"
            variant="filled"
          />
        </Flex>

        <Card>
          <Table dataSource={filteredFeedbacks} columns={columns} rowKey="id" loading={loading} scroll={{ x: SCREEN_LG }}/>
        </Card>
      </ContentWrapperDark>
  );
};

const ParkName: React.FC<{ parkId: number }> = ({ parkId }) => {
  const [parkName, setParkName] = useState<string>('');

  useEffect(() => {
    const fetchParkName = async () => {
      try {
        const response = await getParkById(parkId);
        setParkName(response.data.name);
      } catch (error) {
        console.error('Error fetching park name:', error);
        setParkName('Unknown Park');
      }
    };

    fetchParkName();
  }, [parkId]);

  return <span>{parkName}</span>;
};

export default FeedbackList;
