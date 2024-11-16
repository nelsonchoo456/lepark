import { Card, List, Empty, Button, Spin } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { LogoText } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { CrowdAlert } from '../../../hooks/CrowdInsights/useCrowdAlerts';
import { sectionHeaderIconStyles } from '../Manager/ManagerMainLanding';

interface CrowdAlertsCardProps {
  alerts: CrowdAlert[];
  isSuperAdmin?: boolean;
  loading?: boolean;
}

export const CrowdAlertsCard = ({ alerts, loading = false, isSuperAdmin = false }: CrowdAlertsCardProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="w-full" styles={{ body: { padding: '1rem' } }}>
        <div className="flex items-center mb-4">
          <div className={`${sectionHeaderIconStyles} bg-red-400 text-white`}>
            <TeamOutlined />
          </div>
          <LogoText className="text-lg">Upcoming Crowd Alerts</LogoText>
        </div>
        <div className="flex justify-center items-center py-8">
          <Spin />
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full" styles={{ body: { padding: '1rem' } }}>
      <div className="flex items-center mb-4">
        <div className={`${sectionHeaderIconStyles} bg-red-400 text-white`}>
          <TeamOutlined />
        </div>
        <LogoText className="text-lg">Upcoming Crowd Alerts</LogoText>
      </div>

      {alerts.length > 0 ? (
        <List
          dataSource={alerts}
          renderItem={(alert) => (
            <List.Item>
              <Card className="w-full bg-red-50 border-l-4 border-red-400">
                <div className="flex justify-between items-center gap-4">
                  <div className="min-w-0 flex-1">
                    {isSuperAdmin && <div className="text-sm font-medium text-gray-700 mb-1">{alert.parkName}</div>}
                    <div className="text-sm text-gray-500">
                      Predicted crowd: {Math.round(alert.predictedCrowd)} (Threshold: {Math.round(alert.threshold)})
                    </div>
                    <div className="text-xs text-gray-500">
                      {dayjs(alert.date).format('DD MMM YYYY')} - {dayjs(alert.date).format('dddd')}
                    </div>
                  </div>
                  <Button
                    type="primary"
                    danger
                    className="shrink-0"
                    onClick={() =>
                      navigate('/crowdInsights', {
                        state: { selectedParkId: alert.parkId },
                      })
                    }
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No crowd alerts at the moment" />
      )}
    </Card>
  );
};