import {
  FacilityResponse,
  getSensorById,
  getSensorReadingsByDateRange,
  getZonesByParkId,
  ParkResponse,
  SensorReadingResponse,
  SensorResponse,
  StaffResponse,
  StaffType,
  ZoneResponse,
} from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { Button, Card, Checkbox, Divider, Empty, Space, Tooltip } from 'antd';
import { TbBuildingEstate, TbEdit, TbTicket, TbTree } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import PictureMarker from '../../../components/map/PictureMarker';
import { COLORS } from '../../../config/colors';
import { PiPlantFill } from 'react-icons/pi';
import { FaHome, FaTicketAlt } from 'react-icons/fa';
import { useAuth } from '@lepark/common-ui';
import { useEffect, useState } from 'react';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';
import dayjs from 'dayjs';
import { Line } from 'react-chartjs-2';

interface CameraSensorTabProps {
  facility: FacilityResponse;
  park?: ParkResponse | null;
}
const CameraSensorTab = ({ facility, park }: CameraSensorTabProps) => {
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const [zones, setZones] = useState<ZoneResponse[]>();
  const [cameraSensor, setCameraSensor] = useState<SensorResponse>();
  const [showZones, setShowZones] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(1, 'days'), dayjs()]);
  const [readings, setReadings] = useState<SensorReadingResponse[]>([]);

  useEffect(() => {
    if (facility && facility.cameraSensorId) {
      fetchCameraSensor(facility.cameraSensorId);
    }
  }, [facility]);

  useEffect(() => {
    if (cameraSensor) {
      fetchCameraSensorReadings(cameraSensor.id);
    }
  }, [cameraSensor]);

  const fetchCameraSensor = async (cameraSensorId: string) => {
    try {
      const sensorRes = await getSensorById(cameraSensorId);
      setCameraSensor(sensorRes.data);
    } catch (e) {
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

  return cameraSensor ? (
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

          {facility && facility.lat && facility.long && (
            <PictureMarker
              id={facility.id}
              entityType="FACILITY"
              circleWidth={37}
              lat={facility.lat}
              lng={facility.long}
              tooltipLabel={facility.name}
              backgroundColor={COLORS.sky[300]}
              icon={<TbBuildingEstate className="text-sky-600 drop-shadow-lg" style={{ fontSize: '2rem' }} />}
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
    <>
      <Card styles={{ body: { padding: 0 } }} className="px-4 py-2 mb-4">
        <Space size={16} className="flex-wrap">
          <div className="font-semibold">Actions:</div>
          <Button type='primary' onClick={() => navigate(`/facilities/${facility.id}/assign-camera`)}>Assign a camera to this facility</Button>
        </Space>
      </Card>

      <Card>
        <Empty description="No camera is assigned to this facility" />
      </Card>
    </>
  );
};

export default CameraSensorTab;
