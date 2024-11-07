import React, { useState, useMemo } from 'react';
import { ContentWrapper, Divider, LogoText, QrScanner2 } from '@lepark/common-ui';
import { usePark } from '../../park-context/ParkContext';
import MainLayout from '../../components/main/MainLayout';
import { NavButton } from '../../components/buttons/NavButton';
import { PiPlant, PiPlantFill, PiStarFill, PiTicketFill } from 'react-icons/pi';
import { BsHouseDoor } from 'react-icons/bs';
import { FaLocationDot, FaTent } from 'react-icons/fa6';
import { Badge, Button, Card, Empty, List, Space, Spin, Typography } from 'antd';
import EventCard from './components/EventCard';
import { useNavigate, Link } from 'react-router-dom';
import withParkGuard from '../../park-context/withParkGuard';
import { BsCalendar4Event } from 'react-icons/bs';
import { MdArrowForward, MdArrowOutward, MdArrowRight, MdEvent } from 'react-icons/md';
import ParkHeader from './components/ParkHeader';
import { GiTreehouse } from 'react-icons/gi';
import { useEffect } from 'react';
import { calculateHDBPoweredDays } from '../Decarb/DecarbFunctions';
import { getTotalSequestrationForParkAndYear } from '@lepark/data-access';
import { FiExternalLink } from 'react-icons/fi';
import { AiOutlinePercentage } from 'react-icons/ai';
import { BiSolidDiscount, BiSolidLandmark } from 'react-icons/bi';
import { useFetchAnnouncements } from '../../hooks/Announcements/useFetchAnnouncements';
import { AnnouncementResponse } from '@lepark/data-access';
import styled from 'styled-components';
import { IoLeafSharp } from 'react-icons/io5';

const { Title, Paragraph } = Typography;

const ListNoPadding = styled(List)`
  .ant-list-item {
    padding: 0;
  }
`;

const MainLanding = () => {
  const navigate = useNavigate();
  const { selectedPark } = usePark();
  const [totalSequestration, setTotalSequestration] = useState<number | null>(null);
  const [poweredDays, setPoweredDays] = useState<number | null>(null);
  const { announcements, loading, error } = useFetchAnnouncements(selectedPark?.id);
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSequestration = async () => {
      if (selectedPark?.id) {
        try {
          const currentYear = new Date().getFullYear().toString();
          const response = await getTotalSequestrationForParkAndYear(selectedPark.id, currentYear);
          const sequestration = response.data.totalSequestration;
          setTotalSequestration(Math.round(sequestration));
          const days = calculateHDBPoweredDays(sequestration);
          setPoweredDays(days);
        } catch (error) {
          console.error('Error fetching sequestration data:', error);
        }
      }
    };

    fetchSequestration();
  }, [selectedPark]);

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
          icon={<BiSolidLandmark className="text-mustard-400" />}
          onClick={() => {
            navigate(`/attractions/park/${selectedPark?.id}`);
          }}
          iconClassname="bg-mustard-50 hover:bg-mustard-200"
        >
          Attractions
        </NavButton>
        <NavButton
          key="facilities"
          icon={<FaTent className="text-sky-400" />}
          onClick={() => {
            navigate(`/facility/park/${selectedPark?.id}`);
          }}
          iconClassname="bg-sky-50 hover:bg-sky-200"
        >
          Facilities
        </NavButton>
        <NavButton
          key="events"
          icon={<PiStarFill className="text-highlightGreen-400" />}
          onClick={() => {
            navigate(`/event/park/${selectedPark?.id}`);
          }}
          iconClassname="bg-highlightGreen-100 hover:bg-highlightGreen-200"
        >
          Events
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
            <ListNoPadding
              dataSource={announcements.slice(0, 2)} // Show only the latest 3 announcements
              renderItem={(announcement: AnnouncementResponse) => (
                <List.Item>
                  <Card
                    title={
                      <div className="flex items-center">
                        <span
                          className={`font-medium truncate ${
                            expandedAnnouncementId === announcement.id ? 'whitespace-normal' : 'whitespace-nowrap'
                          }`}
                        >
                          {announcement.title}
                        </span>
                      </div>
                    }
                    onClick={() => toggleExpand(announcement.id)}
                    hoverable
                    className="w-full"
                    bodyStyle={{ padding: expandedAnnouncementId === announcement.id ? '0.7rem' : '0' }}
                    size="small"
                  >
                    {expandedAnnouncementId === announcement.id && (
                      <div className="">
                        <Paragraph>{announcement.content}</Paragraph>
                      </div>
                    )}
                  </Card>
                </List.Item>
              )}
              split={false}
            />
          )}
        </div>
        <br/>

        <div className="flex justify-between items-center">
          <LogoText className="text-xl">Sustainability</LogoText>
          <div className="flex flex-1 items-center md:flex-row-reverse md:ml-4">
            <div className="h-[1px] flex-1 bg-green-100/50 mx-2"></div>
            <Link to="/decarb">
              <Button
                icon={<MdArrowForward className="text-2xl" />}
                shape="circle"
                type="primary"
                size="large"
                className="md:bg-transparent md:text-green-500 md:shadow-none"
              />
            </Link>
          </div>
        </div>
        <br />
        <div className="flex justify-between items-center h-48">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <IoLeafSharp className="text-4xl mb-2 text-green-500" />
            <div className="flex flex-row items-center">
              <p className="text-green-500">
                In the past year, this park has absorbed{' '}
                <span className="font-bold text-lg ml-1 text-green-500">{totalSequestration} kg</span> of CO<sub>2</sub>
              </p>
            </div>
          </div>
          <div className="w-px h-full bg-green-500 mx-4"></div>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <BsHouseDoor className="text-4xl mb-2 text-green-500" />
            <p className="text-green-500">Equivalent to powering a 4 room HDB for</p>
            <p className="font-bold text-lg text-green-500">{poweredDays} years</p>
          </div>
        </div>


        <div className="flex items-center">
          <strong className="text-xl text-highlightGreen-500">Our Events</strong>
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
            <PiStarFill className="text-4xl" />
            <br />
            No Events here.
            <br />
            Check back soon for Events!
          </div>
        </div>
        <br />
        

        <div className="flex items-center">
          <strong className="text-xl text-mustard-500">Our Attractions</strong>
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
            No Attractions here.
            <br />
            Check back soon for Attractions!
          </div>
        </div>
        <br />



        <br />
        <div className="flex justify-between items-center">
          <LogoText className="font-bold text-lg">FAQs</LogoText>
          <div className="flex flex-1 items-center md:flex-row-reverse md:ml-4">
            <div className="h-[1px] flex-1 bg-green-100/50 mx-2"></div>
            <Link to="/faq">
              <Button
                icon={<MdArrowForward className="text-2xl" />}
                shape="circle"
                type="primary"
                size="large"
                className="md:bg-transparent md:text-green-500 md:shadow-none"
              />
            </Link>
          </div>
        </div>
        <p className="text-gray-500">Planning to visit? Find out all you need to know!</p>
        <br />
        <br />

        <div className="flex justify-between items-center">
          <LogoText className="font-bold text-lg">Feedback</LogoText>
          <div className="flex flex-1 items-center md:flex-row-reverse md:ml-4">
            <div className="h-[1px] flex-1 bg-green-100/50 mx-2"></div>
            <Link to="/feedback/create">
              <Button
                icon={<MdArrowForward className="text-2xl" />}
                shape="circle"
                type="primary"
                size="large"
                className="md:bg-transparent md:text-green-500 md:shadow-none"
              />
            </Link>
          </div>
        </div>
        <p className="text-gray-500">Have something to say? We'd love to hear from you!</p>
        <br />
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
