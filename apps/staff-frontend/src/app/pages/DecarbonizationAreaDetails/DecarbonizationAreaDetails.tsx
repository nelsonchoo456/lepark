import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { Button, Card, Empty, message, Space, Tabs, Typography } from 'antd';
import { generateSequestrationHistory, StaffResponse, StaffType } from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';
import PageHeader2 from '../../components/main/PageHeader2';
import MapTab from './components/MapTab';
import { useRestrictDecarbonizationArea } from '../../hooks/DecarbonizationArea/useRestrictDecarbonizationArea';
import OccurrenceTable from './components/OccurrenceTable';
import SequestrationHistoryTab from './components/SequestrationHistoryTab';

const { Text } = Typography;

const DecarbonizationAreaDetails = () => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const { decarbonizationAreaId } = useParams();
  const { decarbonizationArea, loading } = useRestrictDecarbonizationArea(decarbonizationAreaId);
  const [messageApi, contextHolder] = message.useMessage();
  const [generating, setGenerating] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!decarbonizationArea) {
    return null; // This will handle cases where the decarbonization area is not found or user doesn't have access
  }

  const handleGenerateSequestrationHistory = async () => {
    setGenerating(true);
    try {
      await generateSequestrationHistory(decarbonizationArea.id);
      messageApi.success('Sequestration report generated successfully.');
      window.location.reload(); // Refresh the page
    } catch (error) {
      messageApi.error('Error generating sequestration report.');
    } finally {
      setGenerating(false);
    }
  };

  const tabsItems = [
    {
      key: 'sequestration-history',
      label: 'Sequestration History',
      children: <SequestrationHistoryTab areaId={decarbonizationArea.id} />,
    },
    {
      key: 'map',
      label: 'Map',
      children: decarbonizationArea ? (
        <MapTab decarbonizationArea={decarbonizationArea} />
      ) : (
        <Empty description={'No Map data for this Area'}></Empty>
      ),
    },
    {
      key: 'occurrences',
      label: 'Occurrences',
      children: <OccurrenceTable decarbonizationAreaId={decarbonizationArea.id} />,
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Decarbonization Areas Management',
      pathKey: '/decarbonization-area',
      isMain: true,
    },
    {
      title: decarbonizationArea.name,
      pathKey: `/decarbonization-area/${decarbonizationArea.id}`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <div className="md:flex w-full gap-4">
          <div className="flex-1 flex-col flex">
            <div className="w-full flex justify-between items-center">
              <Space>
                <LogoText className="text-2xl py-2 m-0 ml-4">{decarbonizationArea.name}</LogoText>
                <Typography.Paragraph
                  ellipsis={{
                    rows: 1,
                  }}
                  className="ml-4"
                >
                  {decarbonizationArea.description}
                </Typography.Paragraph>
              </Space>
              <Space>
                {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) && (
                  <Button
                    icon={<RiEdit2Line className="text-lg ml-auto mr-0 r-0" />}
                    type="text"
                    onClick={() => navigate(`/decarbonization-area/${decarbonizationArea.id}/edit`)}
                  />
                )}
                <Button type="primary" loading={generating} onClick={handleGenerateSequestrationHistory}>
                  Generate Sequestration Report
                </Button>
              </Space>
            </div>
            <Typography.Paragraph
              ellipsis={{
                rows: 3,
              }}
            >
              {decarbonizationArea.description}
            </Typography.Paragraph>
          </div>
        </div>

        <Tabs
          centered
          defaultActiveKey="about"
          items={tabsItems}
          renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="border-b-[1px] border-gray-400" />}
          className="mt-4"
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default DecarbonizationAreaDetails;
