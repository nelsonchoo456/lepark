import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ContentWrapperDark } from '@lepark/common-ui';
import { Card, Tabs, Spin, Empty, Typography, Row, Col, Alert } from 'antd';
import { getCameraStreamsByZoneId, getHubsByZoneId, HubResponse, HubStatusEnum, SensorResponse } from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import HubPredictiveIrrigationTab from './components/HubPredictiveIrrigationTab';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TabPane } = Tabs;

interface CameraStream {
  sensor: SensorResponse;
  cameraStreamURL: string;
}

const ZonePredictiveIrrigation: React.FC = () => {
  const { zoneId } = useParams<{ zoneId: string }>();
  const [hubs, setHubs] = useState<HubResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cameraStreams, setCameraStreams] = useState<CameraStream[]>([]);
  const [streamErrors, setStreamErrors] = useState<{ [key: number]: boolean }>({});
  const [streamLoading, setStreamLoading] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (zoneId) {
      fetchHubs(parseInt(zoneId))
    }
  }, [zoneId])

  const fetchHubs = async (zoneId: number) => {
    try {
      const response = await getHubsByZoneId(zoneId);
      setHubs(response.data.filter((h) => h.hubStatus === HubStatusEnum.ACTIVE));
    } catch (error) {
      console.error('Error fetching camera streams:', error);
      setLoading(false);
    }
  }

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

  const handleStreamError = (index: number) => {
    setStreamErrors(prev => ({ ...prev, [index]: true }));
    setStreamLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleStreamLoad = (index: number) => {
    setStreamLoading(prev => ({ ...prev, [index]: false }));
  };

  const renderCameraStream = (stream: CameraStream, index: number, height = '750px') => (
    <div className="stream-wrapper" style={{ aspectRatio: '16 / 9', width: '100%', height, marginBottom: '16px', position: 'relative' }}>
      {streamLoading[index] && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
          <Spin size="large" tip="Loading stream..." />
        </div>
      )}
      {streamErrors[index] ? (
        <Alert
          message="Uh oh! The stream is not working, please check if the camera is working!"
          type="error"
          style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      ) : (
        <iframe
          src={stream.cameraStreamURL}
          title={`Camera Stream - ${stream.sensor.name}`}
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px', display: streamLoading[index] ? 'none' : 'block' }}
          onError={() => handleStreamError(index)}
          onLoad={() => handleStreamLoad(index)}
        />
      )}
    </div>
  );

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Title level={3}>Predictive Irrigation</Title>
        <Tabs defaultActiveKey="all">
          <TabPane tab="All" key="all">
            <Row gutter={[16, 16]}>
              {/* {cameraStreams.map((stream, index) => (
                <Col xs={24} sm={24} md={12} key={index}>
                  {renderCameraStream(stream, index)}
                </Col>
              ))} */}
            </Row>
          </TabPane>
          {hubs.map((hub, index) => (
            <TabPane tab={hub.name} key={index.toString()}>
              <HubPredictiveIrrigationTab hub={hub}/>
            </TabPane>
          ))}
        </Tabs>
      </Card>
    </ContentWrapperDark>
  );
};

export default ZonePredictiveIrrigation;
