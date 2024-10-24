import React, {useState, useEffect}from 'react';
import { Card, Tag, Spin } from 'antd';
import { getParkById } from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

interface FeedbackCardProps {
  date: string;
  title: string;
  onClick: () => void;
  category: string;
  parkId: number;
  status: string;
}

const getFeedbackStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return 'yellow';
    case 'ACCEPTED':
      return 'green';
    case 'REJECTED':
      return 'red';
    default:
      return 'default';
  }
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ date, title, category, parkId, onClick, status }) => {
  const [parkName, setParkName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchParkName = async () => {
      try {
        const response = await getParkById(parkId);
        setParkName(response.data.name);
      } catch (error) {
        console.error('Error fetching park name:', error);
        setParkName('Unknown Park');
      } finally {
        setLoading(false);
      }
    };

    fetchParkName();
  }, [parkId]);

  return (
    <Card
      size="small"
      className="mb-2 cursor-pointer hover:bg-gray-50 overflow-hidden"
      onClick={onClick}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <div className="truncate flex-1">{title}</div>
          <Tag color={getFeedbackStatusColor(status)}>{formatEnumLabelToRemoveUnderscores(status)}</Tag>
        </div>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <span className="mr-3">{date}</span>
          <span className="mr-3">Category: {formatEnumLabelToRemoveUnderscores(category)}</span>
          {loading ? (
            <Spin size="small" />
          ) : (
            <span>{parkName}</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FeedbackCard;
