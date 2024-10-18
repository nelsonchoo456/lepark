import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ContentWrapperDark } from '@lepark/common-ui';
import { Card, Tabs, Spin, Empty, Typography, Row, Col } from 'antd';
import { getCameraStreamsByZoneId, SensorResponse } from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';

const { Title } = Typography;
const { TabPane } = Tabs;

interface CameraStream {
  sensor: SensorResponse;
  cameraStreamURL: string;
}

const ZoneCameraStreamsPage: React.FC = () => {
  const { zoneId } = useParams<{ zoneId: string }>();
  const [loading, setLoading] = useState(true);
  const [cameraStreams, setCameraStreams] = useState<CameraStream[]>([]);

  useEffect(() => {
    const fetchCameraStreams = async () => {
      try {
        const response = await getCameraStreamsByZoneId(Number(zoneId));
        setCameraStreams(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching camera streams:', error);
        setLoading(false);
      }
    };

    fetchCameraStreams();
  }, [zoneId]);

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

  const renderCameraStream = (stream: CameraStream, height = '750px') => (
    <div className="stream-wrapper" style={{ aspectRatio: '16 / 9', width: '100%', height, marginBottom: '16px' }}>
      <iframe
        src={stream.cameraStreamURL}
        title={`Camera Stream - ${stream.sensor.name}`}
        allowFullScreen
        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
      />
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
                  {renderCameraStream(stream)}
                </Col>
              ))}
            </Row>
          </TabPane>
          {cameraStreams.map((stream, index) => (
            <TabPane tab={stream.sensor.name} key={index.toString()}>
              {renderCameraStream(stream, '850px')} {/* Use a shorter height for individual tabs */}
            </TabPane>
          ))}
        </Tabs>
      </Card>
    </ContentWrapperDark>
  );
};

export default ZoneCameraStreamsPage;
