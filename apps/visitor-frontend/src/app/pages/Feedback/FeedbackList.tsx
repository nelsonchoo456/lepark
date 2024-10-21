import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, message, Result, Button, Select, Space, Spin } from 'antd';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '@lepark/common-ui';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { usePark } from '../../park-context/ParkContext';
import { VisitorResponse, FeedbackResponse, getAllFeedback, FeedbackStatusEnum, FeedbackCategoryEnum, getAllParks, ParkResponse } from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import FeedbackCard from '../Profile/components/FeedbackCard';

const { Option } = Select;

const FeedbackList = () => {
  const navigate = useNavigate();
  const { user } = useAuth<VisitorResponse>();
  const { selectedPark } = usePark();
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [parkFilter, setParkFilter] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [feedbacksResponse, parksResponse] = await Promise.all([
          getAllFeedback(user.id),
          getAllParks()
        ]);
        setFeedbacks(feedbacksResponse.data);
        setParks(parksResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSearch = (value: string) => {
    setSearchQuery(value.toLowerCase());
  };

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(feedback =>
      (feedback.title.toLowerCase().includes(searchQuery) ||
      feedback.description.toLowerCase().includes(searchQuery) ||
      feedback.feedbackCategory.toLowerCase().includes(searchQuery)) &&
      (statusFilter.length === 0 || statusFilter.includes(feedback.feedbackStatus)) &&
      (categoryFilter.length === 0 || categoryFilter.includes(feedback.feedbackCategory)) &&
      (parkFilter.length === 0 || parkFilter.includes(feedback.parkId))
    );
  }, [feedbacks, searchQuery, statusFilter, categoryFilter, parkFilter]);

  if (!user) {
    return (
      <Result
        status="warning"
        title="Login Required"
        subTitle="You must log in to view your feedbacks!"
        extra={
          <Button type="primary" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        }
      />
    );
  }

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
    <ParkHeader cardClassName="h-30 md:h-[160px]">
      <div className="flex w-full md:text-center md:mx-auto md:block md:w-auto">
        <div className="flex-1 font-medium text-2xl md:text-3xl">My Feedback</div>
      </div>
    </ParkHeader>

    <div className="p-2 items-center bg-green-50 mt-[-1rem] backdrop-blur bg-white/10 mx-4 rounded-2xl px-4 md:flex-row md:-mt-[3rem] md:gap-2 md:backdrop-blur md:bg-white/10 md:mx-4 md:px-4">
      <Input
        suffix={<FiSearch />}
        placeholder="Search Feedbacks..."
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full md:mb-0 md:flex-[3] mb-2"
      />
      <div className="flex flex-col w-full gap-2 mt-2">
        <Select
          mode="multiple"
          style={{ width: '100%', marginBottom: '8px' }}
          placeholder="Filter by Park"
          onChange={(value) => setParkFilter(value)}
          allowClear
        >
          {parks.map((park) => (
            <Option key={park.id} value={park.id}>{park.name}</Option>
          ))}
        </Select>
        <div className="flex gap-2">
          <Select
            mode="multiple"
            style={{ width: '50%' }}
            placeholder="Filter by Status"
            onChange={(value) => setStatusFilter(value)}
            allowClear
          >
            {Object.values(FeedbackStatusEnum).map((status) => (
              <Option key={status} value={status}>{formatEnumLabelToRemoveUnderscores(status)}</Option>
            ))}
          </Select>
          <Select
            mode="multiple"
            style={{ width: '50%' }}
            placeholder="Filter by Category"
            onChange={(value) => setCategoryFilter(value)}
            allowClear
          >
            {Object.values(FeedbackCategoryEnum).map((category) => (
              <Option key={category} value={category}>{formatEnumLabelToRemoveUnderscores(category)}</Option>
            ))}
          </Select>
        </div>
      </div>
    </div>

      <div className="flex-grow p-4 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spin size="large" />
          </div>
        ) : filteredFeedbacks.length > 0 ? (
          filteredFeedbacks.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              date={new Date(feedback.dateCreated).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
              title={feedback.title}
              category={feedback.feedbackCategory}
              parkId={feedback.parkId}
              status={feedback.feedbackStatus}
              onClick={() => navigate(`/feedback/${feedback.id}`)}
            />
          ))
        ) : (
          <div className="text-center mt-8">
            <p>No feedbacks found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackList;
