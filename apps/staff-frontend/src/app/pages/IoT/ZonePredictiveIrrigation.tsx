import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ContentWrapperDark } from '@lepark/common-ui';
import { Card, Tabs, Spin, Empty, Typography, Row, Flex, Tag, Statistic } from 'antd';
import {
  getHubsByZoneId,
  getPredictionsForZone,
  HubResponse,
  HubStatusEnum,
  PredictiveIrrigation,
  SensorTypeEnum,
} from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import HubPredictiveIrrigationTab from './components/HubPredictiveIrrigationTab';
import dayjs from 'dayjs';
import { getSensorIcon } from './ZoneIoTDetailsPage';
import { useRestrictZone } from '../../hooks/IoT/useRestrictZone';
import { useZonePredictiveIrrigation } from '../../hooks/IoT/useZonePredictiveIrrigation';

const { Title } = Typography;
const { TabPane } = Tabs;

const ZonePredictiveIrrigation: React.FC = () => {
  const { zoneId } = useParams<{ zoneId: string }>();
  const { zone, loading: zoneLoading } = useRestrictZone(zoneId);
  const { 
    hubs, 
    predictives, 
    loading: dataLoading, 
    getSensorUnit 
  } = useZonePredictiveIrrigation(zoneId || '');

  const loading = zoneLoading || dataLoading;

  const breadcrumbItems = [
    {
      title: 'IoT Dashboard',
      pathKey: '/iot/zones',
    },
    {
      title: 'Zone Details',
      pathKey: `/iot/zones/${zoneId}`,
    },
    {
      title: 'Predictive Irrigation',
      pathKey: `/iot/zones/${zoneId}/predictive-irrigation`,
      isMain: true,
      isCurrent: true,
    },
  ];

  if (hubs.length === 0) {
    return (
      <ContentWrapperDark>
        <PageHeader2 breadcrumbItems={breadcrumbItems} />
        <Empty description="No active hubs for this zone" />
      </ContentWrapperDark>
    );
  }

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Title level={3}>Predictive Irrigation</Title>
        <Tabs defaultActiveKey="all">
          <TabPane tab="All" key="all">
            {loading ? (
              <Flex justify="center">
                <Spin />
              </Flex>
            ) : predictives && predictives.length > 0 ? (
              <>
                <div className="w-full flex items-center gap-2 border-b-[1px] bg-green-50 py-4 font-semibold rounded-t-lg px-4" key="title">
                  <div className="flex-[1]">Hub Name</div>
                  <div className="flex-[1]">Average Temperature</div>
                  <div className="flex-[1]">Average Humidity</div>
                  <div className="flex-[1]">Average Light</div>
                  <div className="flex-[1]">Rainfall Expectation Today</div>
                  <div className="flex-[1]">Irrigation Need Today</div>
                </div>
                {predictives.map((predictive) => (
                  <div className="w-full flex gap-2 border-b-[1px] px-4 hover:bg-gray-50" key={predictive.hubId}>
                    <div className="flex-[1] py-1 flex items-center">{predictive.hubName}</div>
                    <div className="flex-[1] py-1">
                      <Statistic
                        // title="Average Temperature"
                        value={predictive.sensorData.temperature.toFixed(2)}
                        prefix={getSensorIcon(SensorTypeEnum.TEMPERATURE)}
                        suffix={getSensorUnit(SensorTypeEnum.TEMPERATURE)}
                      />
                      <span className="text-secondary italic">in past 1h</span>
                    </div>
                    <div className="flex-[1] py-1">
                      <Statistic
                        // title="Average Humidity"
                        value={predictive.sensorData.humidity.toFixed(2)}
                        prefix={getSensorIcon(SensorTypeEnum.HUMIDITY)}
                        suffix={getSensorUnit(SensorTypeEnum.HUMIDITY)}
                      />
                      <span className="text-secondary italic">in past 1h</span>
                    </div>
                    <div className="flex-[1] py-1">
                      <Statistic
                        // title="Average Light"
                        value={predictive.sensorData.light.toFixed(2)}
                        prefix={getSensorIcon(SensorTypeEnum.LIGHT)}
                        suffix={getSensorUnit(SensorTypeEnum.LIGHT)}
                      />
                      <span className="text-secondary italic">in past 1h</span>
                    </div>
                    {predictive.rainfall > 90 ? (
                      <>
                        <div className="flex-[1] bg-sky-50/60 text-center flex flex-col items-center justify-center">
                          {/* <strong className="text-sky-500">Rainfall Expectation Today</strong> 
                        <br />*/}
                          <Tag bordered={false} color="blue">
                            <strong className="text-sky-600 text-lg">Yes</strong>
                          </Tag>
                          {predictive.rainfall < 130 ? (
                            <div className="text-xs italic mt-1 text-gray-500/50">Low Confidence Level</div>
                          ) : predictive.rainfall < 300 ? (
                            <div className="text-xs italic mt-1 text-mustard-400">Moderate Confidence Level</div>
                          ) : (
                            <div className="text-xs italic mt-1 text-green-400">High Confidence Level</div>
                          )}
                        </div>
                        <div className="flex-[1] bg-gray-50 text-center flex flex-col items-center justify-center">
                          {/* <strong className="text-gray-500">Irrigation Need</strong> 
                        <br />*/}
                          <Tag bordered={false} className="bg-gray-400">
                            <strong className="text-gray-600 text-lg">No</strong>
                          </Tag>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-[1] bg-gray-50 text-center flex flex-col items-center justify-center">
                          {/* <strong className="text-gray-500">Rainfall Expectation Today</strong>
                        <br /> */}
                          <Tag bordered={false} className="bg-gray-200">
                            <strong className="text-lg text-gray-700">No</strong>
                          </Tag>
                        </div>
                        <div className="flex-[1] bg-green-50/60 text-center flex flex-col items-center justify-center">
                          {/* <strong className="text-green-500">Irrigation Need</strong>
                        <br /> */}
                          <Tag bordered={false} color="green">
                            <strong className="text-green-600 text-lg">Yes</strong>
                          </Tag>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <Empty description="No Predictions for this Zone today" />
            )}
          </TabPane>
          {hubs.map((hub, index) => (
            <TabPane tab={hub.name} key={index.toString()}>
              <HubPredictiveIrrigationTab hub={hub} />
            </TabPane>
          ))}
        </Tabs>
      </Card>
    </ContentWrapperDark>
  );
};

export default ZonePredictiveIrrigation;
