import { Table, Tag, Typography, Button, Flex } from 'antd';
import { FeedbackResponse, FeedbackStatusEnum, StaffType } from '@lepark/data-access';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { MdCheck } from 'react-icons/md';
import { flexColsStyles, sectionHeaderIconStyles } from '../Manager/ManagerMainLanding';
import { SCREEN_LG } from '../../../config/breakpoints';

interface FeedbackTableProps {
  userRole: StaffType;
  feedback: FeedbackResponse[];
  loading?: boolean;
  className?: string;
}

const FeedbackTable = ({ userRole, feedback, loading, className }: FeedbackTableProps) => {
  const navigate = useNavigate();

  const pendingFeedback = feedback.filter(
    (item) => item.feedbackStatus === FeedbackStatusEnum.PENDING
  );

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: FeedbackResponse) => (
        <Typography.Link
          onClick={() => navigate(`/feedback/${record.id}`)}
          style={{ color: 'rgba(0, 0, 0, 0.88)' }}
          className="hover:text-gray-500"
        >
          {text}
        </Typography.Link>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'feedbackStatus',
      key: 'feedbackStatus',
      width: '15%',
      render: (status: FeedbackStatusEnum) => {
        let color = 'default';
        switch (status) {
          case FeedbackStatusEnum.PENDING:
            color = 'warning';
            break;
          case FeedbackStatusEnum.ACCEPTED:
            color = 'success';
            break;
          case FeedbackStatusEnum.REJECTED:
            color = 'error';
            break;
        }
        return <Tag color={color}>{status.replace(/_/g, ' ')}</Tag>;
      },
    },
    {
      title: 'Date Created',
      dataIndex: 'dateCreated',
      key: 'dateCreated',
      width: '20%',
      render: (dateCreated: string) => moment(dateCreated).format('DD/MM/YYYY'),
    },
  ];

  return (
    <>
      <div className={`${flexColsStyles} mb-4 overflow-x-scroll`}>
        {pendingFeedback.length > 0 ? (
          <div className="w-full flex-[2] flex flex-col">
            <div className="flex items-center font-semibold text-mustard-500">
              <div className={`bg-mustard-400 text-white h-6 w-6 flex justify-center items-center rounded-full mr-2`}>
                {pendingFeedback.length}
              </div>
              Pending Feedback
            </div>
            <Table
              dataSource={pendingFeedback.slice(0, 3)}
              columns={columns}
              rowKey="id"
              size="small"
              pagination={false}
              loading={loading}
              className={className}
              scroll={{ x: SCREEN_LG }}
            />
            {pendingFeedback.length > 3 && (
              <Button 
                type="dashed" 
                className="-mt-[1px] rounded-0 text-secondary" 
                onClick={() => navigate('feedback')}
              >
                View all pending feedback
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center font-semibold text-mustard-500">
            <div className={`${sectionHeaderIconStyles} bg-mustard-400 text-white h-6 w-6`}>
              <MdCheck />
            </div>
            No Pending Feedback
          </div>
        )}
      </div>
    </>
  );
};

export default FeedbackTable;