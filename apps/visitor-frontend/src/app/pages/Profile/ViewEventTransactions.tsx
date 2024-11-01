import React, { useEffect, useState } from 'react';
import { LogoText } from '@lepark/common-ui';
import { EventTicketTransactionResponse, VisitorResponse } from '@lepark/data-access';
import DetailedEventTransactionCard from './components/DetailedEventTransactionCard';
import { getEventTicketTransactionsByVisitorId } from '@lepark/data-access';
import { useAuth } from '@lepark/common-ui';
import { Input, Empty, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Option } = Select;

const ViewEventTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<EventTicketTransactionResponse[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<EventTicketTransactionResponse[]>([]);
  const [sortCriteria, setSortCriteria] = useState<string>('all');
  const { user } = useAuth<VisitorResponse>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user?.id) {
        try {
          const response = await getEventTicketTransactionsByVisitorId(user.id);
          setTransactions(response.data);
          sortAndFilterTransactions(response.data, sortCriteria, '');
        } catch (error) {
          console.error('Error fetching transactions:', error);
        }
      }
    };

    fetchTransactions();
  }, [user]);

  const sortAndFilterTransactions = (transactionsToSort: EventTicketTransactionResponse[], sort: string, searchValue: string) => {
    let sorted = [...transactionsToSort];

    // Always sort by closest date first
    sorted = sorted.sort((a, b) => dayjs(a.eventDate).diff(dayjs(b.eventDate)));

    switch (sort) {
      case 'upcoming':
        sorted = sorted.filter((t) => dayjs(t.eventDate).isSame(dayjs(), 'day') || dayjs(t.eventDate).isAfter(dayjs()));
        break;
      case 'past':
        sorted = sorted.filter((t) => dayjs(t.eventDate).isBefore(dayjs()));
        break;
      case 'all':
      default:
        // No additional filtering needed for 'all'
        break;
    }

    if (searchValue) {
      sorted = sorted.filter((transaction) => transaction.event?.title.toLowerCase().includes(searchValue.toLowerCase()));
    }

    setFilteredTransactions(sorted);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    sortAndFilterTransactions(transactions, sortCriteria, value);
  };

  const handleSort = (value: string) => {
    setSortCriteria(value);
    sortAndFilterTransactions(transactions, value, '');
  };

  const handleCardClick = (transactionId: string) => {
    navigate(`/event-transaction/${transactionId}`);
  };

  return (
    <>
      <div className="flex flex-col h-full m-4">
        <div className="sticky top-0 bg-white z-10 shadow-md">
          <div className="pb-4 pl-4 pr-4">
            <LogoText className="text-2xl font-semibold mb-3">My Event Bookings</LogoText>
            <Space className="w-full">
              <Input placeholder="Search events" onChange={handleSearch} className="flex-grow" prefix={<SearchOutlined />} />
              <Select defaultValue="all" onChange={handleSort} style={{ width: 120 }}>
                <Option value="all">All</Option>
                <Option value="upcoming">Upcoming</Option>
                <Option value="past">Past</Option>
              </Select>
            </Space>
          </div>
        </div>
        <div className="flex-grow overflow-auto pl-4 pr-4 mt-4 mb-4">
          <div>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <DetailedEventTransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onClick={() => handleCardClick(transaction.id)}
                />
              ))
            ) : (
              <Empty description="No transactions found" />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewEventTransactions;
