import React from 'react';
import { Tabs } from 'antd';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import PageHeader2 from '../../components/main/PageHeader2';
import styled from 'styled-components';
import FAQTab from './FAQTab';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import { useFetchFAQs } from '../../hooks/FAQ/useFetchFAQs';
import { StaffResponse, StaffType } from '@lepark/data-access';

const TabsNoBottomMargin = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 0px;
  }
`;

const FAQList: React.FC = () => {
  const { parks } = useFetchParks();
  const { faqs, triggerFetch } = useFetchFAQs();
  const { user } = useAuth<StaffResponse>();

  const faqTabItems = [
    ...(user?.role === StaffType.SUPERADMIN ? [{
      key: "all",
      label: <LogoText>All FAQs</LogoText>,
      children: <FAQTab faqs={faqs} triggerFetch={triggerFetch} showParkColumn parks={parks} />
    }] : []),
    ...parks.map((park) => ({
      key: park.id.toString(),
      label: park.name,
      children: <FAQTab faqs={faqs.filter(faq => faq.parkId === park.id)} triggerFetch={triggerFetch} parks={parks} />
    }))
  ];

  const breadcrumbItems = [
    { title: 'FAQ Management', pathKey: '/faq', isMain: true, isCurrent: true },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <TabsNoBottomMargin
        items={faqTabItems}
        type="card"
      />
    </ContentWrapperDark>
  );
};

export default FAQList;
