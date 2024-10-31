import { Card, Tag, Spin } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { LogoText } from '@lepark/common-ui';
import { ParkVisitorCount } from '../../../hooks/CrowdInsights/useCrowdCounts';
import { sectionHeaderIconStyles } from '../Manager/ManagerMainLanding';

interface WeeklyVisitorCardProps {
  loading: boolean;
  parkData: ParkVisitorCount | null;
  parkCrowds?: ParkVisitorCount[];
  isSuperAdmin?: boolean;
}

export const WeeklyVisitorCard = ({ loading, parkData, parkCrowds = [], isSuperAdmin = false }: WeeklyVisitorCardProps) => {
  return (
    <Card className="w-full bg-blue-50" styles={{ body: { padding: '1rem' } }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center mb-2">
          <div className={`${sectionHeaderIconStyles} bg-blue-400 text-white`}>
            <TeamOutlined />
          </div>
          <LogoText className="text-lg">Weekly Visitor Count</LogoText>
        </div>
        <p className="text-gray-500">Past 7 Days</p>
      </div>

      {loading ? (
        <Spin size="small" />
      ) : (
        <div className="space-y-4">
          {isSuperAdmin && (
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
              <div className="text-gray-600 mb-1">All NParks</div>
              <div className="text-3xl font-bold text-blue-600">{parkCrowds.reduce((sum, park) => sum + park.weeklyCount, 0)}</div>
            </div>
          )}

          {isSuperAdmin ? (
            <div className="grid grid-cols-2 gap-3">
              {parkCrowds.map((park) => (
                <div key={park.parkId} className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-blue-200">
                  <div className="text-sm text-gray-600 min-h-[40px] line-clamp-2" title={park.parkName}>
                    {park.parkName}
                  </div>
                  <div className="text-xl font-semibold text-blue-500">{park.weeklyCount}</div>
                </div>
              ))}
            </div>
          ) : (
            parkData && (
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                <div className="text-gray-600 mb-1">Total Visitors</div>
                <div className="text-3xl font-bold text-blue-600">{parkData.weeklyCount}</div>
              </div>
            )
          )}
        </div>
      )}
    </Card>
  );
};
