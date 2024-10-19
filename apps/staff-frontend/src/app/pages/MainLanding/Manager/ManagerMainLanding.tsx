import { ContentWrapper, ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { Anchor, Badge, Card, Col, Empty, List, Row, Statistic, Typography } from 'antd';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import React, { useEffect, useState } from 'react';
import PageHeader2 from '../../../components/main/PageHeader2';
import styled from 'styled-components';
import { useFetchAnnouncements } from '../../../hooks/Announcements/useFetchAnnouncements';
import { AnnouncementResponse, getAnnouncementsByParkId, getNParksAnnouncements, StaffResponse } from '@lepark/data-access';

const flexColsStyles = 'flex flex-col md:flex-row md:justify-between gap-4 mb-4';
const sectionStyles = 'pr-4';

const ManagerMainLanding = () => {
  const { user } = useAuth<StaffResponse>();
  const topRef = React.useRef<HTMLDivElement>(null);

  // Data
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);

  useEffect(() => {
    if (user?.parkId) {
      fetchAnnouncementsByParkId(user.parkId);
    }
  }, [user]);

  const fetchAnnouncementsByParkId = async (parkId: number) => {
    try {
      const response = await getAnnouncementsByParkId(parkId);
      setAnnouncements(response.data);
      // setError(null);
    } catch (err) {
      // setError('Failed to fetch announcements');
    } finally {
      // setLoading(false);
    }
  };

  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
    },
    stroke: {
      curve: 'smooth', // Smooth curve for the line
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Days of the week
      title: {
        text: 'Day of the Week',
      },
    },
    yaxis: {
      title: {
        text: 'Visitor Count',
      },
    },
    title: {
      text: 'Visitor Count the Past Week',
      align: 'center',
    },
    dataLabels: {
      enabled: false, // Disable data labels to keep chart clean
    },
    fill: {
      type: 'gradient', // Enable gradient fill
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
      },
    },
    colors: ['#34a853'], // Color of the line
  };

  const chartSeries = [
    {
      name: 'Visitors',
      data: [0, 0, 0, 0, 0, 0, 0], // Sample daily visitor counts
    },
  ];

  const renderSectionHeader = (title: string) => {
    return (
      <div className="sticky top-0 pt-4 z-20 bg-white">
        <LogoText className={`text-lg font-semibold pb-2 pt-0`}>
          <div className={`-z-10  px-2 rounded`}>{title}</div>
        </LogoText>
        <div className="w-full h-[1px] bg-gray-400/40 mb-4" />
      </div>
    );
  };

  return (
    <Row>
      <Col span={21}>
        <div id="part-1" className={sectionStyles}>
          {renderSectionHeader('Park Overview')}

          <div className={flexColsStyles}>
            <div className="w-full">
              <Card className="w-full bg-green-50 p-4" styles={{ body: {padding: "0" }}}>
                <LogoText className="">Live Visitor Count</LogoText>
                <div className="flex justify-center items-center h-full mt-2 opacity-50">No data</div>
              </Card>
              <Card className="w-full h-86 mt-4">
                <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={220} />
              </Card>
            </div>
            <Card className="w-full h-86 overflow-y-scroll" styles={{ body: {padding: "1rem" }}}>
              <LogoText className="text-lg">Announcements</LogoText>
              <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={announcements}
                className="mt-4"
                renderItem={(announcement: AnnouncementResponse) => (
                  <List.Item className="w-full border-b-[1px]">
                    <List.Item.Meta
                      // avatar={}
                      title={
                        <a href="https://ant.design">
                          <strong className="text-green-400 hover:text-green-200">{announcement.title}</strong>
                        </a>
                      }
                      description={
                        <Typography.Paragraph
                          ellipsis={{
                            rows: 1,
                          }}
                        >
                          {announcement.content}
                        </Typography.Paragraph>
                      }
                      className="w-full border-b-[1px] hover:bg-green-50/40"
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        </div>

        <div id="part-2" className={sectionStyles}>
          {renderSectionHeader('Plant Tasks')}
          <div className={flexColsStyles}>
            <Card className="w-full h-86" styles={{ body: {padding: "1rem" }}}>
              <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={220} />
            </Card>
            <Card className="w-full h-86" styles={{ body: {padding: "1rem" }}}>
              <LogoText className="text-lg">Latest Tasks</LogoText>
              <div className="flex justify-center items-center h-full mt-20 opacity-50">No data</div>
            </Card>
          </div>
        </div>

        <div id="part-3" className={sectionStyles}>
          {renderSectionHeader('Maintenance Tasks')}
        </div>
      </Col>
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
              title: 'Plant Tasks',
            },
            {
              key: 'part-3',
              href: '#part-3',
              title: 'Part 3',
            },
          ]}
        />
      </Col>
    </Row>
  );
};

export default ManagerMainLanding;
