import React from 'react';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { FAQCategoryEnum, FAQStatusEnum, StaffResponse } from '@lepark/data-access';
import { Card, Descriptions, Tag, Spin } from 'antd';
import { useParams } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { useRestrictFAQs } from '../../hooks/FAQ/useRestrictFAQs';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';

const formatEnumLabel = formatEnumLabelToRemoveUnderscores;

const FAQView: React.FC = () => {
  const { faqId = '' } = useParams();
  const { user } = useAuth<StaffResponse>();
  const { faq, loading: faqLoading } = useRestrictFAQs(faqId);
  const { parks, loading: parksLoading } = useFetchParks();

  const categoryColors: { [key in FAQCategoryEnum]: string } = {
    GENERAL: '#4a90e2',
    PARK_RULES: '#7ed321',
    FACILITIES: '#f8e71c',
    EVENTS: '#bd10e0',
    SAFETY: '#d0021b',
    ACCESSIBILITY: '#50e3c2',
    SERVICES: '#9013fe',
    TICKETING: '#4a90e2',
    PARK_HISTORY: '#f5a623',
    OTHER: '#b8e986',
  };

  const statusColors: { [key in FAQStatusEnum]: string } = {
    ACTIVE: 'green',
    INACTIVE: 'red',
    DRAFT: 'orange',
    ARCHIVED: 'gray',
  };

  const breadcrumbItems = [
    { title: 'FAQ Management', pathKey: '/faq', isMain: false },
    { title: 'View FAQ', pathKey: `/faq/${faqId}`, isMain: true, isCurrent: true },
  ];

  if (faqLoading || parksLoading) {
    return (
      <ContentWrapperDark>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </ContentWrapperDark>
    );
  }

  if (!faq) {
    return null; // This will not be rendered as the hook will redirect unauthorized access
  }

  const getParkName = (parkId?: number) => {
    if (parkId === undefined) return 'All Parks';
    const park = parks.find(p => p.id === parkId);
    return park ? park.name : 'All Parks';
  };

  const descriptionsItems = [
    {
      key: 'question',
      label: 'Question',
      children: faq.question,
      span: 2,
    },
    {
      key: 'answer',
      label: 'Answer',
      children: faq.answer,
      span: 2,
    },
    {
      key: 'category',
      label: 'Category',
      children: (
        <Tag color={categoryColors[faq.category as FAQCategoryEnum]}>
          {formatEnumLabel(faq.category)}
        </Tag>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      children: (
        <Tag color={statusColors[faq.status as FAQStatusEnum]}>
          {formatEnumLabel(faq.status)}
        </Tag>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      children: faq.priority,
    },
    {
      key: 'park',
      label: 'Park',
      children: getParkName(faq.parkId),
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Descriptions
          title="FAQ Details"
          items={descriptionsItems}
          column={2}
          bordered
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default FAQView;
