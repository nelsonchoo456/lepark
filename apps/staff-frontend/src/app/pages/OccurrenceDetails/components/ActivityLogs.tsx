import React from 'react';
import { Table, Button, Tooltip, TableProps } from 'antd';
import { FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

interface ActivityLog {
  id: string;
  name: string;
  dateCreated: string;
  activityLogType: string;
}

const ActivityLogs: React.FC<{ activityLogs: ActivityLog[]; occurrenceId?: string }> = ({ activityLogs, occurrenceId }) => {
  const navigate = useNavigate();

  const columns: TableProps<ActivityLog>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Date Created',
      dataIndex: 'dateCreated',
      key: 'dateCreated',
      render: (dateCreated: string) => moment(dateCreated).format('D MMM YY, HH:mm'),
    },
    {
      title: 'Activity Type',
      dataIndex: 'activityLogType',
      key: 'activityLogType',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button type="link" icon={<FiEye />} onClick={() => navigate(`activitylog/${record.id}`)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <Table<ActivityLog>
      dataSource={activityLogs}
      columns={columns}
      rowKey="id"
      pagination={{ pageSize: 10 }}
    />
  );
};

export default ActivityLogs;
