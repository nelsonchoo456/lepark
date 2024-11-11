import {
  AttractionResponse,
  getSensorById,
  getSensorReadingsByDateRange,
  ParkResponse,
  SensorReadingResponse,
  SensorResponse,
  StaffResponse,
  StaffType,
  updateAttractionDetails,
} from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { Button, Card, Divider, Empty, Menu, Space, Tooltip, Dropdown, Flex, Modal, message, Spin } from 'antd';
import { TbBuildingEstate, TbEdit } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import PictureMarker from '../../../components/map/PictureMarker';
import { COLORS } from '../../../config/colors';
import { useAuth } from '@lepark/common-ui';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Line } from 'react-chartjs-2';
import { IoMenu } from 'react-icons/io5';
import { MdOutlinePhotoCamera } from 'react-icons/md';

interface CameraSensorTabProps {
  attraction: AttractionResponse;
  park?: ParkResponse | null;
  triggerFetchAttraction: () => void;
}
const CameraSensorTab = ({ attraction, park, triggerFetchAttraction }: CameraSensorTabProps) => {
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const [cameraSensorLoading, setCameraSensorLoading] = useState<boolean>();
  const [cameraSensor, setCameraSensor] = useState<SensorResponse>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(1, 'days'), dayjs()]);
  const [readings, setReadings] = useState<SensorReadingResponse[]>([]);

  useEffect(() => {
    if (attraction && attraction.cameraSensorId) {
      fetchCameraSensor(attraction.cameraSensorId);
    }
  }, [attraction]);

  useEffect(() => {
    if (cameraSensor) {
      fetchCameraSensorReadings(cameraSensor.id);
    }
  }, [cameraSensor]);

  const fetchCameraSensor = async (cameraSensorId: string) => {
    try {
      setCameraSensorLoading(true)
      const sensorRes = await getSensorById(cameraSensorId);
      setCameraSensor(sensorRes.data);
      setCameraSensorLoading(false)
    } catch (e) {
      setCameraSensorLoading(false)
      console.error('Error fetching camera sensor:', e);
    }
  };

  const fetchCameraSensorReadings = async (cameraSensorId: string) => {
    try {
      const readingsRes = await getSensorReadingsByDateRange(cameraSensorId, dateRange[0].toDate(), dateRange[1].toDate());
      setReadings(readingsRes.data);
    } catch (e) {
      console.error('Error fetching sensor readings:', e);
    }
  };

  const sortedReadings = [...readings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartData = {
    labels: sortedReadings.map((reading) => dayjs(reading.date).format('YYYY-MM-DD HH:mm')),
    datasets: [
      {
        label: 'Crowd',
        data: sortedReadings.map((reading) => reading.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const handleDelete = async () => {
    try {
      const confirmed = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: 'Confirm dettachment of this camera sensor from this Attraction?',
          content: 'Are you sure you want to proceed?',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
          okText: 'Confirm dettachment',
          okButtonProps: { danger: true },
        });
      });

      if (!confirmed) return;

      const response = await updateAttractionDetails(attraction.id, { cameraSensorId: null });
      if (response.status === 200) {
        triggerFetchAttraction();
        message.success('Camera sensor detached from this attraction');
      }
    } catch (error) {
      console.error('Error detaching camera sensor', error);
      message.error('Failed to detach camera sensor. Please try again.');
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Crowd Level`,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              context.parsed.y.toFixed(2);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
        ticks: {
          maxTicksLimit: 10,
        },
      },
    },
  };

  if (cameraSensorLoading) {
    return (
      <Flex justify='center' className='mt-10'><Spin/></Flex>
    )
  }

  return (
    <>
      {cameraSensor ? (
        <Flex justify="flex-end">
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="change" onClick={() => navigate(`/attraction/${attraction.id}/assign-camera`)}>
                  Change assigned camera
                </Menu.Item>
                <Menu.Item key="remove" danger onClick={() => handleDelete()}>
                  Remove assigned camera
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <Button icon={<IoMenu className='text-lg'/>} type='link'>
              Actions
            </Button>
          </Dropdown>
        </Flex>
      ) : (
        <Card styles={{ body: { padding: 0 } }} className="px-4 py-2 mb-4">
          <Space size={16} className="flex-wrap">
            <div className="font-semibold">Actions:</div>
            <Button type="primary" onClick={() => navigate(`/attraction/${attraction.id}/assign-camera`)}>
              Assign a camera to this attraction
            </Button>
          </Space>
        </Card>
      )}

      {cameraSensor ? (
        <>
          <Divider orientation="left">Crowd Data</Divider>
          {readings && readings.length > 0 ? (
            <Line height={120} data={chartData} options={chartOptions} />
          ) : (
            <Card>
              <Empty description="No crowd data from this sensor" />
            </Card>
          )}

          <Divider orientation="left">Camera Sensor Details</Divider>
          {/* <Card styles={{ body: { padding: 0 } }} className="px-4 py-2 mb-4">
        <Space size={16} className="flex-wrap">
          <div className="font-semibold">Display:</div>
          <Checkbox
            onChange={(e) => setShowZones(e.target.checked)}
            checked={showZones}
            className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
          >
            Zones
          </Checkbox>
        </Space>
      </Card> */}
          <div
            style={{
              height: '30vh',
              position: 'relative',
            }}
            className="rounded-xl overflow-hidden"
          >
            <MapContainer
              center={[1.287953, 103.851784]}
              zoom={11}
              className="leaflet-mapview-container"
              style={{ height: '100%', width: '100%', zIndex: 10 }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <PolygonFitBounds geom={park?.geom} polygonFields={{ fillOpacity: 0.9 }} />

              {attraction && attraction.lat && attraction.lng && (
                <PictureMarker
                  id={attraction.id}
                  entityType="ATTRACTION"
                  circleWidth={37}
                  lat={attraction.lat}
                  lng={attraction.lng}
                  tooltipLabel={attraction.title}
                  backgroundColor={COLORS.sky[300]}
                  icon={<TbBuildingEstate className="text-sky-600 drop-shadow-lg" style={{ fontSize: '2rem' }} />}
                />
              )}

              {cameraSensor && cameraSensor.lat && cameraSensor.long && (
                <PictureMarker
                  id={cameraSensor.id}
                  entityType="SENSOR"
                  circleWidth={37}
                  lat={cameraSensor.lat}
                  lng={cameraSensor.long}
                  tooltipLabel={cameraSensor.name}
                  backgroundColor={COLORS.gray[400]}
                  icon={<MdOutlinePhotoCamera className="text-slate-400 drop-shadow-lg" style={{ fontSize: '1.4rem' }} />}
                />
              )}
            </MapContainer>

            <div className="absolute top-4 right-3 z-[1000]">
              {user?.role !== StaffType.ARBORIST &&
                user?.role !== StaffType.BOTANIST && ( // Check if the user is not an Arborist or Botanist
                  <Tooltip title="Edit Location">
                    <Button icon={<TbEdit />} type="primary" onClick={() => navigate(`edit-location`)}>
                      Edit Location
                    </Button>
                  </Tooltip>
                )}
            </div>
          </div>
        </>
      ) : (
        <Card>
          <Empty description="No camera is assigned to this attraction" />
        </Card>
      )}
    </>
  );
};

export default CameraSensorTab;
