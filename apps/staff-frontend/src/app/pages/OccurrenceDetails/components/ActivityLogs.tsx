import React from 'react';
import { Table, Button, Tooltip, TableProps, Tag, Flex } from 'antd';
import { FiEdit, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { OccurrenceResponse } from '@lepark/data-access';

interface ActivityLog {
  id: string;
  name: string;
  dateCreated: string;
  activityLogType: string;
}

const ActivityLogs: React.FC<{ activityLogs: ActivityLog[]; occurrence: OccurrenceResponse | null }> = ({ activityLogs, occurrence }) => {
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
      render: (activityLogType: string) => <Tag>{activityLogType}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="left" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`activitylog/${record.id}`)} />
          </Tooltip>
          <Tooltip title="Edit Activity Log">
            <Button type="link" icon={<FiEdit />} onClick={() => navigate(`activitylog/${record.id}/edit`)} />
          </Tooltip>
        </Flex>
      ),
    },
  ];

  return <Table<ActivityLog> dataSource={activityLogs} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />;
};

export default ActivityLogs;
