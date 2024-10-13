import React, { useState, useMemo } from 'react';
import { Input, Card, Collapse, Row, Col, Button } from 'antd';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { FiSearch } from 'react-icons/fi';
import { usePark } from '../../park-context/ParkContext';
import { useFetchFAQs } from '../../hooks/FAQ/useFetchFAQs';
import { FAQResponse, FAQCategoryEnum, StaffResponse } from '@lepark/data-access';
import styled from 'styled-components';
import { RiEyeLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

const { Panel } = Collapse;

const ScrollableContentWrapper = styled(ContentWrapperDark)`
  overflow-y: auto;
  height: calc(100vh - 160px);
  margin-top: 0;
  padding-top: 16px;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const FAQList: React.FC = () => {
  const { selectedPark } = usePark();
  const { faqs } = useFetchFAQs(selectedPark?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const filteredFAQs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [faqs, searchQuery]);

  const groupedFAQs = useMemo(() => {
    const grouped: { [key in FAQCategoryEnum]: FAQResponse[] } = {} as { [key in FAQCategoryEnum]: FAQResponse[] };
    Object.values(FAQCategoryEnum).forEach(category => {
      grouped[category] = filteredFAQs.filter(faq => faq.category === category);
    });
    return grouped;
  }, [filteredFAQs]);

  const formatCategoryName = (category: string) => {
    return category
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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

  const renderFAQCard = (faq: FAQResponse) => (
    <Collapse key={faq.id} items={[{
      key: faq.id,
      label: faq.question,
      children: (
        <>
          <p>{faq.answer}</p>
          <Button
            type="link"
            icon={<RiEyeLine />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/faq/${faq.id}`);
            }}
          >
            Tap to view
          </Button>
        </>
      )
    }]} />
  );

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      <ParkHeader cardClassName="h-30 md:h-[160px]">
        <div className="flex w-full md:text-center md:mx-auto md:block md:w-auto">
          <div className="flex-1 font-medium text-2xl md:text-3xl">
            {selectedPark ? `${selectedPark.name} FAQs` : 'Frequently Asked Questions'}
          </div>
        </div>
      </ParkHeader>
      <div className="p-2 items-center bg-green-50 mt-[-1rem] backdrop-blur bg-white/10 mx-4 rounded-2xl px-4 md:flex-row md:-mt-[3rem] md:gap-2 md:backdrop-blur md:bg-white/10 md:mx-4 md:px-4">
        <Input
          suffix={<FiSearch />}
          placeholder="Search FAQs..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full md:mb-0 md:flex-[3]"
        />
      </div>
      <ScrollableContentWrapper>
        <Row gutter={[16, 16]}>
          {Object.entries(groupedFAQs).map(([category, categoryFaqs]) => (
            categoryFaqs.length > 0 && (
              <Col xs={24} key={category}>
                <Card
                  title={formatCategoryName(category)}
                  bordered={false}
                  styles={{
                    header: {
                      backgroundColor: categoryColors[category as FAQCategoryEnum],
                      color: 'white'
                    }
                  }}
                >
                  {categoryFaqs.map(renderFAQCard)}
                </Card>
              </Col>
            )
          ))}
        </Row>
      </ScrollableContentWrapper>
    </div>
  );
};

export default FAQList;
