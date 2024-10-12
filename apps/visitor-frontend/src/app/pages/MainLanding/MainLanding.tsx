import React, { useState, useMemo } from 'react';
import { ContentWrapper, Divider, LogoText } from '@lepark/common-ui';
import { usePark } from '../../park-context/ParkContext';
import MainLayout from '../../components/main/MainLayout';
import { NavButton } from '../../components/buttons/NavButton';
import { PiPlant, PiPlantFill, PiStarFill, PiTicketFill } from 'react-icons/pi';
import { FaLocationDot, FaTent } from 'react-icons/fa6';
import { Badge, Button, Card, Empty, List, Space, Spin, Typography } from 'antd';
import EventCard from './components/EventCard';
import { useNavigate, Link } from 'react-router-dom';
import withParkGuard from '../../park-context/withParkGuard';
import { BsCalendar4Event } from 'react-icons/bs';
import { MdArrowForward, MdArrowOutward, MdArrowRight } from 'react-icons/md';
import ParkHeader from './components/ParkHeader';
import { AnnouncementResponse } from '@lepark/data-access';
import { useFetchAnnouncements } from '../../hooks/Announcements/useFetchAnnouncements';

const { Title, Paragraph } = Typography;

const MainLanding = () => {
  const navigate = useNavigate();
  const { selectedPark } = usePark();
  const { announcements, loading, error } = useFetchAnnouncements(selectedPark?.id);
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<string | null>(null);

  const toggleExpand = (announcementId: string) => {
    setExpandedAnnouncementId(expandedAnnouncementId === announcementId ? null : announcementId);
  };

  return (
    <div>
      <ParkHeader>
        <FaLocationDot className="text-highlightGreen-200 text-4xl mt-2 md:hidden" />
        <div className="md:text-center md:mx-auto">
          <p className="font-light">Exploring</p>
          <p className="font-medium text-2xl -mt-1 md:text-3xl">{selectedPark?.name}</p>
        </div>
      </ParkHeader>

      <div
        className="flex items-start justify-between py-2 mx-4 bg-white rounded-2xl mt-[-2rem] shadow overflow-hidden relative z-10
            md:p-0"
      >
        <NavButton
          key="discover"
          icon={<PiPlantFill />}
          onClick={() => {
            navigate(`/discover/park/${selectedPark?.id}`);
          }}
        >
          Species
        </NavButton>
        <NavButton
          key="attractions"
          icon={<PiStarFill />}
          onClick={() => {
            navigate(`/attractions/park/${selectedPark?.id}`);
          }}
        >
          Attractions
        </NavButton>
        <NavButton key="venues" icon={<FaTent />}>
          Venues
        </NavButton>
        <NavButton key="tickets" icon={<PiTicketFill />}>
          Tickets
        </NavButton>
      </div>

      <ContentWrapper>
        {/* Announcements Section */}
        <div>
          <div className="flex items-center justify-between">
            <LogoText className="text-xl">Announcements</LogoText>
            <div className="flex flex-1 items-center md:flex-row-reverse md:ml-4">
              <div className="h-[1px] flex-1 bg-green-100/50 mx-2"></div>
              <Button
                icon={<MdArrowForward className="text-2xl" />}
                shape="circle"
                type="primary"
                size="large"
                className="md:bg-transparent md:text-green-500 md:shadow-none"
                onClick={() => navigate('/announcement')}
              />
            </div>
          </div>
          {loading ? (
            <Spin size="large" />
          ) : error ? (
            <div>Error loading announcements: {error}</div>
          ) : (
            <List
              dataSource={announcements.slice(0, 2)} // Show only the latest 3 announcements
              renderItem={(announcement: AnnouncementResponse) => (
                <List.Item>
                  <Card
                    title={
                      <div className="flex items-center">
                        <span
                          className={`truncate ${expandedAnnouncementId === announcement.id ? 'whitespace-normal' : 'whitespace-nowrap'}`}
                        >
                          {announcement.title}
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
          )}
        </div>
        <div className="flex items-center">
          <LogoText className="text-xl">Our Events</LogoText>
          <div className="flex flex-1 items-center md:flex-row-reverse md:ml-4">
            <div className="h-[1px] flex-1 bg-green-100/50 mx-2"></div>
            <Button
              icon={<MdArrowForward className="text-2xl" />}
              shape="circle"
              type="primary"
              size="large"
              className="md:bg-transparent md:text-green-500 md:shadow-none"
            />
          </div>
        </div>
        <div className="w-full overflow-scroll flex gap-2 py-2 min-h-[13rem]">
          <div className="opacity-40 flex flex-col justify-center items-center text-center w-full">
            <BsCalendar4Event className="text-4xl" />
            <br />
            No Events here.
            <br />
            Check back soon for Events!
          </div>
        </div>
        <br />
        <LogoText className="font-bold text-lg">Plant of the Day</LogoText>
        <Badge.Ribbon text={<LogoText className="font-bold text-lg text-white">#PoTD</LogoText>}>
          <Card size="small" title="" extra={<a href="#">More</a>} className="my-2 w-full">
            <div className="opacity-40 flex flex-col justify-center items-center text-center w-full h-48">
              <PiPlant className="text-4xl" />
              <br />
              No Plant of the Day yet.
              <br />
              Check back soon for Plant of the Day!
            </div>
          </Card>
        </Badge.Ribbon>
      </ContentWrapper>
    </div>
  );
};

export default withParkGuard(MainLanding);
