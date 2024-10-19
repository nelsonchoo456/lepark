import React, { useState, useEffect } from 'react';
import { Spin, Alert, Typography } from 'antd';
import { getCameraStreamBySensorId, SensorResponse } from '@lepark/data-access';

const { Title } = Typography;

interface CameraStreamTabProps {
  sensorId: string;
}

const CameraStreamTab: React.FC<CameraStreamTabProps> = ({ sensorId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [sensor, setSensor] = useState<SensorResponse | null>(null);

  useEffect(() => {
    const fetchCameraStream = async () => {
      try {
        const response = await getCameraStreamBySensorId(sensorId);
        setStreamUrl(response.data.cameraStreamURL);
        setSensor(response.data.sensor);
        setLoading(false);
      } catch (err) {
        setError('Failed to load camera stream. Please try again later.');
        setLoading(false);
      }
    };

    fetchCameraStream();
  }, [sensorId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div className="camera-stream-container">
      {streamUrl ? (
        <div className="stream-wrapper" style={{ aspectRatio: '16 / 9', maxWidth: '100%', margin: '0 auto' }}>
          <iframe
            src={streamUrl}
            title="Camera Live Stream"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
          />
        </div>
      ) : (
        <Alert message="No stream available" description="The camera stream is not available for this sensor." type="warning" showIcon />
      )}
    </div>
  );
};

export default CameraStreamTab;