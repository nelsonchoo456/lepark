import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ContentWrapperDark } from '@lepark/common-ui';
import { Card, Tabs, Spin, Empty, Typography, Row, Col, Alert } from 'antd';
import { getCameraStreamsByZoneId, SensorResponse } from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import { useRestrictZone } from '../../hooks/IoT/useRestrictZone';
import { useZoneCameraStreams } from '../../hooks/IoT/useZoneCameraStreams';

const { Title } = Typography;
const { TabPane } = Tabs;

interface CameraStream {
  sensor: SensorResponse;
  cameraStreamURL: string;
}

const ZoneCameraStreamsPage: React.FC = () => {
  const { zoneId } = useParams<{ zoneId: string }>();
  const { zone, loading: zoneLoading } = useRestrictZone(zoneId);
  const {
    loading: streamsLoading,
    cameraStreams,
    streamErrors,
    streamLoading,
    handleStreamError,
    handleStreamLoad
  } = useZoneCameraStreams(zoneId || '');

  const loading = zoneLoading || streamsLoading;

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
      title: 'Camera Streams',
      pathKey: `/iot/zones/${zoneId}/camera-streams`,
      isMain: true,
      isCurrent: true,
    },
  ];

  if (loading) {
    return (
      <ContentWrapperDark>
        <Spin size="large" />
      </ContentWrapperDark>
    );
  }

  if (cameraStreams.length === 0) {
    return (
      <ContentWrapperDark>
        <PageHeader2 breadcrumbItems={breadcrumbItems} />
        <Empty description="No camera streams available for this zone" />
      </ContentWrapperDark>
    );
  }

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
        <Title level={3}>Camera Streams</Title>
        <Tabs defaultActiveKey="all">
          <TabPane tab="All" key="all">
            <Row gutter={[16, 16]}>
              {cameraStreams.map((stream, index) => (
                <Col xs={24} sm={24} md={12} key={index}>
                  {renderCameraStream(stream, index)}
                </Col>
              ))}
            </Row>
          </TabPane>
          {cameraStreams.map((stream, index) => (
            <TabPane tab={stream.sensor.name} key={index.toString()}>
              {renderCameraStream(stream, index, '850px')}
            </TabPane>
          ))}
        </Tabs>
      </Card>
    </ContentWrapperDark>
  );
};

export default ZoneCameraStreamsPage;
