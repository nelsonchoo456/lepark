import { ContentWrapper, ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { Anchor, Badge, Card, Col, Empty, List, Row, Statistic, Table, Tag, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeamOutlined } from '@ant-design/icons';
import { MdCheck, MdFeedback } from 'react-icons/md';
import { SCREEN_LG } from '../../../config/breakpoints';
import { renderSectionHeader, sectionHeader, sectionHeaderIconStyles } from '../Manager/ManagerMainLanding';
import AnnouncementsCard from '../components/AnnouncementsCard';
import PlantTasksTable from '../components/PlantTasksTable';
import { useCrowdCounts } from '../../../hooks/CrowdInsights/useCrowdCounts';
import { CrowdAlert, useCrowdAlerts } from '../../../hooks/CrowdInsights/useCrowdAlerts';
import { LiveVisitorCard } from '../components/LiveVisitorCard';
import { WeeklyVisitorCard } from '../components/WeeklyVisitorCard';
import { CrowdAlertsCard } from '../components/CrowdAlertsCard';

import {
  AnnouncementResponse,
  FeedbackResponse,
  FeedbackStatusEnum,
  getAllAssignedPlantTasks,
  getAllParks,
  getAnnouncementsByParkId,
  getFeedbackByParkId,
  ParkResponse,
  PlantTaskResponse,
  PlantTaskStatusEnum,
  StaffResponse,
  StaffType,
} from '@lepark/data-access';
import FeedbackTable from '../components/FeedbackTable';

export const flexColsStyles = 'flex flex-col md:flex-row md:justify-between gap-4';
export const sectionStyles = 'pr-4';

const ParkrangerMainLanding = () => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [desktop, setDesktop] = useState<boolean>(window.innerWidth >= SCREEN_LG);

  // Data states
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [plantTasks, setPlantTasks] = useState<PlantTaskResponse[]>([]);
  const [feedback, setFeedback] = useState<FeedbackResponse[]>([]);

  // Crowd monitoring
  const { total, parks: parkCrowds, loading } = useCrowdCounts(user?.parkId);
  const { alerts, isLoading: alertsLoading } = useCrowdAlerts({
    parkId: user?.parkId,
    parks,
    days: 7,
  });

  useEffect(() => {
    const handleResize = () => {
      setDesktop(window.innerWidth >= SCREEN_LG);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (user?.parkId) {
      fetchAnnouncementsByParkId(user.parkId);
      fetchPlantTasks();
      fetchParks();
      fetchFeedback(user.parkId);
    }
  }, [user]);

  const fetchFeedback = async (parkId: number) => {
    try {
      const response = await getFeedbackByParkId(parkId);
      setFeedback(response.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const fetchParks = async () => {
    try {
      const response = await getAllParks();
      if (response.status === 200) {
        setParks(response.data);
      }
    } catch (error) {
      console.error('Error fetching parks:', error);
    }
  };

  const fetchAnnouncementsByParkId = async (parkId: number) => {
    try {
      const response = await getAnnouncementsByParkId(parkId);
      const filteredAnnouncements = response.data.filter((announcement) => announcement.status === 'ACTIVE');
      setAnnouncements(filteredAnnouncements);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    }
  };

  const fetchPlantTasks = async () => {
    try {
      const response = await getAllAssignedPlantTasks(user?.id || '');
      setPlantTasks(response.data);
    } catch (error) {
      console.error('Error fetching plant tasks:', error);
    }
  };

  const pendingFeedback = useMemo(() => {
    return feedback.filter((item) => item.feedbackStatus === FeedbackStatusEnum.PENDING);
  }, [feedback]);

  return (
    <Row>
      <Col span={desktop ? 21 : 24}>
        {/* Park Overview Section */}
        <div id="part-1" className={sectionStyles}>
          {renderSectionHeader('Park Overview')}
          <div className={flexColsStyles}>
            <div className="w-full h-86 flex-[2] flex flex-col gap-4">
              <Card 
                className="h-full" 
                styles={{ body: { padding: '1rem' } }} 
                onClick={() => navigate('/feedback')}
              >
                <div className={sectionHeader}>
                  <div className={`${sectionHeaderIconStyles} bg-blue-400 text-white`}>
                    <MdFeedback />
                  </div>
                  <LogoText className="text-lg mb-2">Pending Feedback</LogoText>
                </div>
                <div className="h-full flex flex-col gap-2 pl-4 ml-3 border-l-[2px]">
                  {pendingFeedback.length > 0 ? (
                    <div className="text-mustard-400 font-semibold mr-2">
                      {pendingFeedback.length} Pending Feedback
                    </div>
                  ) : (
                    <div className="text-mustard-400 gap-3 flex items-center">
                      <MdCheck className="text-lg" /> No Pending Feedback
                    </div>
                  )}
                </div>
              </Card>

              <Card className="h-full " styles={{ body: { padding: '1rem' } }} onClick={() => navigate('/crowdInsights')}>
                <div className={sectionHeader}>
                  <div className={`${sectionHeaderIconStyles} bg-green-400 text-white`}>
                    <TeamOutlined />
                  </div>
                  <LogoText className="text-lg mb-2">Current Visitors</LogoText>
                </div>
                <div className="h-full flex flex-col gap-2 pl-4 ml-3 border-l-[2px]">
                  {parkCrowds[0] && (
                    <div className={`text-lg font-bold ${
                      parkCrowds[0].isOverThreshold ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {parkCrowds[0].liveCount} visitors today
                    </div>
                  )}
                </div>
              </Card>
            </div>
            <AnnouncementsCard announcements={announcements} />
          </div>
        </div>

        {/* Feedback Section */}
        <div id="part-2" className={sectionStyles}>
          {renderSectionHeader('Feedback', () => navigate('feedback'))}
          {user && (
            <FeedbackTable 
              userRole={user?.role as StaffType} 
              feedback={feedback}
              loading={loading}
              className="w-full" 
            />
          )}
        </div>

        {/* Visitors Section */}
        <div id="part-4" className={sectionStyles}>
          {renderSectionHeader('Visitors')}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col flex-[2] gap-4">
              <LiveVisitorCard loading={loading} parkData={parkCrowds[0]} />
              <WeeklyVisitorCard loading={loading} parkData={parkCrowds[0]} />
            </div>
            <div className="flex-[1]">
              <CrowdAlertsCard alerts={alerts} loading={alertsLoading} />
            </div>
          </div>
        </div>
      </Col>

      {desktop && (
        <Col span={3}>
          <Anchor
            offsetTop={90}
            items={[
              {
                key: 'part-1',
                href: '#part-1',
                title: 'Park Overview',
              },
              {
                key: 'part-2',
                href: '#part-2',
                title: 'Feedback',
              },
              {
                key: 'part-4',
                href: '#part-4',
                title: 'Visitors',
              },
            ]}
          />
        </Col>
      )}
    </Row>
  );
};

export default ParkrangerMainLanding;