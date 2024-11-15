import { useState, useEffect } from 'react';
import { getCameraStreamsByZoneId, SensorResponse } from '@lepark/data-access';

interface CameraStream {
  sensor: SensorResponse;
  cameraStreamURL: string;
}

export const useZoneCameraStreams = (zoneId: string) => {
  const [loading, setLoading] = useState(true);
  const [cameraStreams, setCameraStreams] = useState<CameraStream[]>([]);
  const [streamErrors, setStreamErrors] = useState<{ [key: number]: boolean }>({});
  const [streamLoading, setStreamLoading] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchCameraStreams = async () => {
      try {
        const response = await getCameraStreamsByZoneId(Number(zoneId));
        setCameraStreams(response.data);
        // Initialize all streams as loading
        setStreamLoading(response.data.reduce((acc, _, index) => ({ ...acc, [index]: true }), {}));
      } catch (error) {
        console.error('Error fetching camera streams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCameraStreams();
  }, [zoneId]);

  const handleStreamError = (index: number) => {
    setStreamErrors(prev => ({ ...prev, [index]: true }));
    setStreamLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleStreamLoad = (index: number) => {
    setStreamLoading(prev => ({ ...prev, [index]: false }));
  };

  return {
    loading,
    cameraStreams,
    streamErrors,
    streamLoading,
    handleStreamError,
    handleStreamLoad
  };
};