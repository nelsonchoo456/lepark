import { Card, Tag, Spin, Tooltip, Button } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { LogoText } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { ParkVisitorCount } from '../../../hooks/CrowdInsights/useCrowdCounts';
import { sectionHeaderIconStyles } from '../Manager/ManagerMainLanding';

interface LiveVisitorCardProps {
  loading: boolean;
  parkData: ParkVisitorCount | null;
  parkCrowds?: ParkVisitorCount[];
  isSuperAdmin?: boolean;
}

export const LiveVisitorCard = ({ loading, parkData, parkCrowds = [], isSuperAdmin = false }: LiveVisitorCardProps) => {
  const navigate = useNavigate();

  const getTrafficTag = (count: number, threshold: number) => {
    const ratio = count / threshold;
    if (ratio > 1) {
      return <Tag color="error">High Traffic</Tag>;
    } else if (ratio > 0.7) {
      return <Tag color="warning">Moderate Traffic</Tag>;
    } else {
      return <Tag color="success">Low Traffic</Tag>;
    }
  };

  const getTrafficTooltip = (count: number, threshold: number) => {
    const ratio = count / threshold;
    if (ratio > 1) {
      return `Exceeds moderate threshold of ${Math.round(threshold)}`;
    } else if (ratio > 0.7) {
      return `Approaching moderate threshold of ${Math.round(threshold)}`;
    } else {
      return `Well below moderate threshold of ${Math.round(threshold)}`;
    }
  };

  const renderParkGrid = () => (
    <div className="grid grid-cols-2 gap-3">
      {parkCrowds.map((park) => (
        <div
          key={park.parkId}
          className={`bg-white p-3 rounded-lg shadow-sm border-l-4 
              ${park.isOverThreshold ? 'border-red-400 animate-pulse' : 'border-green-200'}`}
        >
          <div className="flex justify-between items-start gap-2">
            <div className="text-sm text-gray-600 min-h-[40px] line-clamp-2" title={park.parkName}>
              {park.parkName}
            </div>
            <Tooltip title={getTrafficTooltip(park.liveCount, park.threshold)}>{getTrafficTag(park.liveCount, park.threshold)}</Tooltip>
          </div>
          <div className={`text-xl font-semibold ${park.isOverThreshold ? 'text-red-500' : 'text-green-500'}`}>
            {park.liveCount}
            {park.isOverThreshold && (
              <Button
                type="link"
                size="small"
                danger
                className="ml-2"
                onClick={() =>
                  navigate('/crowdInsights', {
                    state: { selectedParkId: park.parkId },
                  })
                }
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSinglePark = () =>
    parkData && (
      <div className="space-y-4">
        <div
          className={`bg-white p-4 rounded-lg shadow-sm border-l-4 
              ${parkData.isOverThreshold ? 'border-red-400 animate-pulse' : 'border-green-500'}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="text-gray-600 mb-1">Current Visitors</div>
              <div className={`text-3xl font-bold ${parkData.isOverThreshold ? 'text-red-600' : 'text-green-600'}`}>
                {parkData.liveCount}
                {parkData.isOverThreshold && (
                  <Button type="link" size="small" danger className="ml-2" onClick={() => navigate('/crowdInsights')}>
                    View Details
                  </Button>
                )}
              </div>
            </div>
            <Tooltip title={getTrafficTooltip(parkData.liveCount, parkData.threshold)}>
              {getTrafficTag(parkData.liveCount, parkData.threshold)}
            </Tooltip>
          </div>
        </div>
      </div>
    );

  return (
    <Card className="w-full bg-green-50" styles={{ body: { padding: '1rem' } }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center mb-2">
          <div className={`${sectionHeaderIconStyles} bg-green-400 text-white`}>
            <TeamOutlined />
          </div>
          <LogoText className="text-lg">Live Visitor Count</LogoText>
        </div>
        <p className="text-gray-500">Updated {moment().format('HH:mm')}</p>
      </div>

      {loading ? (
        <Spin size="small" />
      ) : (
        <div className="space-y-4">
          {isSuperAdmin && (
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
              <div className="text-gray-600 mb-1">All NParks</div>
              <div className="text-3xl font-bold text-green-600">{parkCrowds.reduce((sum, park) => sum + park.liveCount, 0)}</div>
            </div>
          )}
          {isSuperAdmin ? renderParkGrid() : renderSinglePark()}
        </div>
      )}
    </Card>
  );
};
