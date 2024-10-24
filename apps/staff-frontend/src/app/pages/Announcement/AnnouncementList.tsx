import React from 'react';
import { Tabs } from 'antd';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { StaffResponse, StaffType } from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import styled from 'styled-components';
import AnnouncementByTypeTab from './AnnouncementByTypeTab';
import { useFetchAnnouncements } from '../../hooks/Announcements/useFetchAnnouncements';

const TabsNoBottomMargin = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 0px;
  }
`;

const AnnouncementList: React.FC = () => {
  const { user } = useAuth<StaffResponse>();
  const { announcements, loading, triggerFetch } = useFetchAnnouncements();

  const nParksAnnouncements = announcements.filter(a => a.parkId === null);
  const parksAnnouncements = announcements.filter(a => a.parkId !== null);

  const announcementTabs = [
    {
      key: 'all',
      label: <LogoText>All</LogoText>,
      children: <AnnouncementByTypeTab announcements={announcements} triggerFetch={triggerFetch} tableShowParks />,
    },
    {
      key: 'nparks',
      label: <LogoText>NParks-Wide</LogoText>,
      children: <AnnouncementByTypeTab announcements={nParksAnnouncements} triggerFetch={triggerFetch} />,
    },
    {
      key: 'park',
      label: <LogoText>Parks</LogoText>,
      children: <AnnouncementByTypeTab announcements={parksAnnouncements} triggerFetch={triggerFetch} tableShowParks/>,
    },
  ];

  const breadcrumbItems = [{ title: 'Announcement Management', pathKey: '/announcement', isMain: true, isCurrent: true }];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      {user?.role === StaffType.SUPERADMIN ? (
        <TabsNoBottomMargin items={announcementTabs} type="card" />
      ) : (
        <AnnouncementByTypeTab announcements={announcements} triggerFetch={triggerFetch} tableShowParks/>
      )}
    </ContentWrapperDark>
  );
};

export default AnnouncementList;