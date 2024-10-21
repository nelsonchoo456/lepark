import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Card, List, Spin, Typography, Pagination } from 'antd';
import { AnnouncementResponse } from '@lepark/data-access';
import { useFetchAnnouncements } from '../../hooks/Announcements/useFetchAnnouncements';
import { ContentWrapper, LogoText } from '@lepark/common-ui';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { FiSearch } from 'react-icons/fi';
import { usePark } from '../../park-context/ParkContext';

const { Search } = Input;
const { Title, Paragraph } = Typography;

const AnnouncementsList: React.FC = () => {
  const { selectedPark } = usePark();
  const { announcements, loading, error } = useFetchAnnouncements(selectedPark?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => announcement.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, announcements]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const toggleExpand = (announcementId: string) => {
    setExpandedAnnouncementId(expandedAnnouncementId === announcementId ? null : announcementId);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const paginatedAnnouncements = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAnnouncements.slice(startIndex, endIndex);
  }, [currentPage, pageSize, filteredAnnouncements]);

  if (loading) {
    return (
      <ContentWrapper>
        <Spin size="large" />
      </ContentWrapper>
    );
  }

  if (error) {
    return (
      <ContentWrapper>
        <div>Error loading announcements: {error}</div>
      </ContentWrapper>
    );
  }

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      <ParkHeader cardClassName="h-24 md:h-[160px]">
        <div className="md:text-center md:mx-auto">
          <p className="font-light">Announcements in</p>
          <p className="font-medium text-2xl -mt-1 md:text-3xl truncate overflow-hidden whitespace-nowrap">{selectedPark?.name}</p>
        </div>
      </ParkHeader>
      <div
        className="p-2 items-center bg-green-50 mt-[-2.5rem]
        backdrop-blur bg-white/10 mx-4 rounded-2xl px-4
        md:flex-row md:-mt-[5.5rem] md:gap-2 md:backdrop-blur md:bg-white/10 md:mx-4 md:px-4"
      >
        <Input
          suffix={<FiSearch />}
          placeholder="Search Announcements..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full mb-2 md:flex-[3] "
        />
      </div>
      <div
        className="flex-1 overflow-y-auto mx-4
        md:mt-6 md:bg-white md:mb-4 md:rounded-xl md:p-4"
      >
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={paginatedAnnouncements}
          className="mt-6"
          renderItem={(announcement: AnnouncementResponse) => (
            <List.Item className="w-full">
              <Card
                title={
                  <div className="flex items-center">
                    <span className={`truncate ${expandedAnnouncementId === announcement.id ? 'whitespace-normal' : 'whitespace-nowrap'}`}>
                      {expandedAnnouncementId === announcement.id ? announcement.title : announcement.title}
                    </span>
                  </div>
                }
                onClick={() => toggleExpand(announcement.id)}
                hoverable
                className="w-full"
                bodyStyle={{ padding: expandedAnnouncementId === announcement.id ? '16px' : '0' }}
              >
                {expandedAnnouncementId === announcement.id && (
                  <div className="mt-4">
                    <Paragraph>{announcement.content}</Paragraph>
                  </div>
                )}
              </Card>
            </List.Item>
          )}
        />
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredAnnouncements.length}
          onChange={handlePageChange}
          className="mt-4 text-center"
        />
      </div>
    </div>
  );
};

export default AnnouncementsList;
