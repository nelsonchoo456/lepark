import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { StaffResponse, StaffType } from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import styled from 'styled-components';
import PromotionByTypeTab from './components/PromotionByTypeTab';
import { useFetchPromotions } from '../../hooks/Promotions/useFetchPromotions';

const TabsNoBottomMargin = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 0px;
  }
`;

const PromotionList = () => {
  const { user } = useAuth<StaffResponse>();
  const { promotions, parksPromotions, nParksPromotions, triggerFetch } = useFetchPromotions(false);

  const promotionTabs = [
    {
      key: 'all',
      label: <LogoText>All</LogoText>,
      children: <PromotionByTypeTab promotions={promotions} triggerFetch={triggerFetch} tableShowParks />,
    },
    {
      key: 'nparks',
      label: <LogoText>NParks-Wide</LogoText>,
      children: <PromotionByTypeTab promotions={nParksPromotions} triggerFetch={triggerFetch} />,
    },
    {
      key: 'park',
      label: <LogoText>Parks</LogoText>,
      children: <PromotionByTypeTab promotions={parksPromotions} triggerFetch={triggerFetch} tableShowParks/>,
    },
  ];

  const breadcrumbItems = [{ title: 'Promotions Management', pathKey: '/promotion', isMain: true, isCurrent: true }];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      {user?.role === StaffType.SUPERADMIN ? (
        <TabsNoBottomMargin items={promotionTabs} type="card" />
      ) : (
        <PromotionByTypeTab promotions={promotions} triggerFetch={triggerFetch} tableShowParks/>
      )}
    </ContentWrapperDark>
  );
};

export default PromotionList;
