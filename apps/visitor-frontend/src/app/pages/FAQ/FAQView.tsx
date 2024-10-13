import React, { useState, useEffect } from 'react';
import { ContentWrapperDark, Header } from '@lepark/common-ui';
import { FAQCategoryEnum, FAQResponse, getFAQById } from '@lepark/data-access';
import { Card, Tag, Spin, Button } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { usePark } from '../../park-context/ParkContext';
import styled from 'styled-components';
import { ArrowLeftOutlined } from '@ant-design/icons';

const formatEnumLabel = formatEnumLabelToRemoveUnderscores;


const FAQView: React.FC = () => {
  const { faqId = '' } = useParams();
  const [faq, setFaq] = useState<FAQResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { selectedPark } = usePark();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFAQ = async () => {
      setLoading(true);
      try {
        const response = await getFAQById(faqId);
        setFaq(response.data);
      } catch (error) {
        console.error('Error fetching FAQ:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQ();
  }, [faqId]);

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

  if (loading) {
    return (
      <ContentWrapperDark>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </ContentWrapperDark>
    );
  }

  if (!faq) {
    return <div>FAQ not found</div>;
  }

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      <ParkHeader cardClassName="h-30 md:h-[160px]">
        <div className="flex w-full md:text-center md:mx-auto md:block md:w-auto">
          <div className="flex-1 font-medium text-2xl md:text-3xl">
            {selectedPark ? `${selectedPark.name} FAQ` : 'FAQ Details'}
          </div>
        </div>
      </ParkHeader>
      <div className="flex-grow overflow-y-auto p-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: '1rem' }}
        >
          Back
        </Button>
        <Card>
          <h1 className="text-xl font-semibold text-green-500">{faq.question}</h1>

          <p><strong>Answer:</strong> {faq.answer}</p>
          <div style={{ marginTop: '1rem' }}>
            <Tag color={categoryColors[faq.category as FAQCategoryEnum]}>
              {formatEnumLabel(faq.category)}
            </Tag>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FAQView;
