import React, { useEffect, useState } from 'react';
import { Calendar, Card, Tag, Tooltip } from 'antd';
import type { Dayjs } from 'dayjs';
import { TeamOutlined } from '@ant-design/icons';

interface CrowdData {
  date: string;
  crowdLevel: number | null;
  predictedCrowdLevel: number | null;
}

interface ParkCrowdLevelsCalendarProps {
  crowdData: CrowdData[];
  parkId: number;
  thresholds: { low: number; moderate: number };
  allParks: any[]; 
}

const ParkCrowdLevelsCalendar: React.FC<ParkCrowdLevelsCalendarProps> = ({ crowdData, parkId, thresholds, allParks }) => {
  const [resolvedThresholds, setResolvedThresholds] = useState<{ low: number; moderate: number } | null>(null);
  console.log(`thresholds of ${parkId}`, thresholds);

  useEffect(() => {
    setResolvedThresholds(thresholds);
  }, [thresholds]);

  if (!resolvedThresholds) return <div>Loading...</div>;

  const getCrowdLevelTag = (level: number) => {
    if (level <= resolvedThresholds.low) return <Tag color="green">Low</Tag>;
    if (level <= resolvedThresholds.moderate) return <Tag color="orange">Moderate</Tag>;
    return <Tag color="red">High</Tag>;
  };

  const dateCellRender = (value: Dayjs) => {
    const date = value.format('YYYY-MM-DD');
    const dataForDate = crowdData.find((d) => d.date === date);

    if (!dataForDate) return null;

    const actualLevel = dataForDate.crowdLevel !== null ? Math.round(dataForDate.crowdLevel) : null;
    const predictedLevel = dataForDate.predictedCrowdLevel !== null ? Math.round(dataForDate.predictedCrowdLevel) : null;

    const renderCrowdLevel = (level: number | null, isPredicted: boolean) => {
      if (level === null) return null;

      return (
        <div className="flex flex-col items-start">
          <div className="flex items-center">
            <TeamOutlined className="mr-1" />
            {isPredicted && <span className="mr-1 text-xs">Predicted:</span>}
            <span className="font-bold">{level}</span>
          </div>
          <div className="mt-1">{getCrowdLevelTag(level)}</div>
        </div>
      );
    };

    return (
      <div className="flex flex-col items-start p-1 h-full">
        {actualLevel !== null ? (
          renderCrowdLevel(actualLevel, false)
        ) : (
          renderCrowdLevel(predictedLevel, true)
        )}
      </div>
    );
  };

  const parkName = parkId === 0 ? "All Parks" : allParks.find(park => park.id === parkId)?.name || "Unknown Park";

  return (
    <Card>
      <Calendar
        cellRender={dateCellRender}
        className="responsive-calendar"
        headerRender={({ value, onChange }) => {
          const current = value.clone();
          const prevMonth = () => onChange(current.subtract(1, 'month'));
          const nextMonth = () => onChange(current.add(1, 'month'));

          return (
            <div className="flex justify-between items-center mb-2">
              <button onClick={prevMonth} className="text-lg">
                {'<'}
              </button>
              <span className="font-bold">{current.format('MMMM YYYY')}</span>
              <button onClick={nextMonth} className="text-lg">
                {'>'}
              </button>
            </div>
          );
        }}
      />
    </Card>
  );
};

export default ParkCrowdLevelsCalendar;