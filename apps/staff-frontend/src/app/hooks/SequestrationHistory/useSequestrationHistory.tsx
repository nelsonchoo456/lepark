import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  DecarbonizationAreaResponse,
  SequestrationHistoryResponse,
  getSequestrationHistoryByAreaIdAndTimeFrame,
} from '@lepark/data-access';
import { formatDate } from '../../pages/DecarbonizationArea/components/dateFormatter';

const useSequestrationHistory = (
  startDate: string | null,
  endDate: string | null,
  selectedArea: string | null,
  selectedParkId: number | null,
  decarbonizationAreas: DecarbonizationAreaResponse[],
) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SequestrationHistoryResponse[]>([]);
  const [barChartData, setBarChartData] = useState<any[]>([]);

  useEffect(() => {
    if (startDate && endDate && selectedArea) {
      fetchSequestrationHistory();
    }
  }, [startDate, endDate, selectedArea, selectedParkId]);

  const fetchSequestrationHistory = async () => {
    setLoading(true);
    setData([]); // Clear data before fetching new data
    try {
      const inclusiveEndDate = dayjs(endDate).add(1, 'day').toISOString();
      let response;
      let filteredAreas: DecarbonizationAreaResponse[] = [];
      if (selectedArea === 'all') {
        filteredAreas = decarbonizationAreas.filter((area) => area.parkId === selectedParkId);
        if (filteredAreas.length === 0) {
          setData([]); // Ensure data is cleared if no areas are found
          setLoading(false);
          return;
        }
        const allData = await Promise.all(
          filteredAreas.map((area) => getSequestrationHistoryByAreaIdAndTimeFrame(area.id, startDate!, inclusiveEndDate)),
        );
        response = allData.flatMap((res) => res.data);
      } else {
        response = await getSequestrationHistoryByAreaIdAndTimeFrame(selectedArea!, startDate!, inclusiveEndDate);
        response = response.data;
      }

      if (response.length === 0) {
        setData([]); // Ensure data is cleared if no data is returned
      } else {
        const formattedData = response.map((entry: any) => ({
          ...entry,
          date: formatDate(entry.date), // Use the formatDate utility function
        }));
        // Sort data by date in ascending order
        formattedData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Aggregate data by date and areaId
        const aggregatedData = formattedData.reduce((acc: any, entry: any) => {
          const existingEntry = acc.find((e: any) => e.date === entry.date && e.decarbonizationAreaId === entry.decarbonizationAreaId);
          if (existingEntry) {
            existingEntry.seqValue += entry.seqValue;
          } else {
            acc.push({ ...entry });
          }
          return acc;
        }, []);

        setData(aggregatedData);

        // Group data by area for bar chart using aggregated data
        const groupedData = filteredAreas.map((area) => {
          const areaData = aggregatedData.filter((entry: { decarbonizationAreaId: string }) => entry.decarbonizationAreaId === area.id);
          const totalSeqValue = areaData.reduce((sum: number, entry: { seqValue: number }) => sum + entry.seqValue, 0);
          return { areaName: area.name, totalSeqValue };
        });

        setBarChartData(groupedData);

        // Aggregate data by date for line chart
        const lineChartData = aggregatedData.reduce((acc: any, entry: any) => {
          const existingEntry = acc.find((e: any) => e.date === entry.date);
          if (existingEntry) {
            existingEntry.seqValue += entry.seqValue;
          } else {
            acc.push({ date: entry.date, seqValue: entry.seqValue, decarbonizationAreaId: entry.decarbonizationAreaId });
          }
          return acc;
        }, []);

        setData(lineChartData);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, data, barChartData };
};

export default useSequestrationHistory;
