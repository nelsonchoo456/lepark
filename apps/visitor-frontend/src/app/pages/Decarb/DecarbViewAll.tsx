import { ContentWrapper, ContentWrapperDark, Divider, LogoText, useAuth } from '@lepark/common-ui';
import MainLayout from '../../components/main/MainLayout';
import { NavButton } from '../../components/buttons/NavButton';
import { PiPlantFill, PiStarFill, PiTicketFill } from 'react-icons/pi';
import { FaTent } from 'react-icons/fa6';
import { Badge, Card, Space, Input, Tag, Button, Tooltip } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { getDecarbonizationAreasByParkId, DecarbonizationAreaResponse, VisitorResponse, getOccurrencesWithinDecarbonizationArea } from '@lepark/data-access';
import { FiSearch } from 'react-icons/fi';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { usePark } from '../../park-context/ParkContext';
import styled from 'styled-components';
import { IoIosArrowDown } from 'react-icons/io';
import { IoEarth } from 'react-icons/io5';
import withParkGuard from '../../park-context/withParkGuard';
import { FaQuestionCircle } from 'react-icons/fa';
import { MdChevronRight } from 'react-icons/md';
import React from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Tabs } from 'antd';

// Register the required Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);


const DecarbViewAll = () => {
  const navigate = useNavigate();
  const { user } = useAuth<VisitorResponse>();
  const { selectedPark } = usePark();
  const [loading, setLoading] = useState(false);
  const [fetchedAreas, setFetchedAreas] = useState<DecarbonizationAreaResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [areaDetails, setAreaDetails] = useState<{ [key: string]: { totalSequestration: number, occurrenceCount: number } }>({});



  useEffect(() => {
    const fetchDecarbAreas = async () => {
      setLoading(true);
      try {
        if (selectedPark) {
          const response = await getDecarbonizationAreasByParkId(selectedPark.id);
          setFetchedAreas(response.data);

          // Fetch details for each area
          const details = await Promise.all(response.data.map(async (area) => {
            const occurrences = await getOccurrencesWithinDecarbonizationArea(area.id);
            const totalSequestration = occurrences.data.reduce((sum: number, occ: any) => sum + occ.biomass, 0);
            return {
              id: area.id,
              totalSequestration,
              occurrenceCount: occurrences.data.length
            };
          }));
          const detailsObject = details.reduce<{ [key: string]: { totalSequestration: number, occurrenceCount: number } }>((acc, detail) => {
            acc[detail.id] = {
              totalSequestration: detail.totalSequestration,
              occurrenceCount: detail.occurrenceCount
            };
            return acc;
          }, {});

          setAreaDetails(detailsObject);
        }
      } catch (error) {
        console.error('Error fetching decarbonization areas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDecarbAreas();
  }, [selectedPark]);

  const navigateToDecarbArea = (areaId: string) => {
    navigate(`/decarb/${areaId}`);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const filteredAreas = useMemo(() => {
    if (loading) return [];
    return fetchedAreas.filter((area) =>
      area.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [fetchedAreas, searchQuery, loading]);

   const handleTooltipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

   const donutChartData = {
    labels: filteredAreas.map(area => area.name),
    datasets: [
      {
        data: filteredAreas.map(area => areaDetails[area.id]?.totalSequestration || 0),
        backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'],
        hoverOffset: 4
      }
    ]
  };

  const totalSequestration = donutChartData.datasets[0].data.reduce((a, b) => a + b, 0);

  const percentagePlugin = {
    id: 'percentagePlugin',
    beforeDraw(chart: any) {
      const { ctx, chartArea: { top, width, height } } = chart;
      ctx.save();
      const fontSize = (height / 114).toFixed(2);
      ctx.font = `${fontSize}em sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      donutChartData.datasets[0].data.forEach((value, index) => {
        const percentage = ((value / totalSequestration) * 100).toFixed(1);
        const meta = chart.getDatasetMeta(0);
        const midAngle = meta.data[index].startAngle + (meta.data[index].endAngle - meta.data[index].startAngle) / 2;
        const x = Math.cos(midAngle) * (chart.getDatasetMeta(0).data[index].outerRadius + chart.getDatasetMeta(0).data[index].innerRadius) / 2 + chart.getDatasetMeta(0).data[index].x;
        const y = Math.sin(midAngle) * (chart.getDatasetMeta(0).data[index].outerRadius + chart.getDatasetMeta(0).data[index].innerRadius) / 2 + chart.getDatasetMeta(0).data[index].y;

        ctx.fillStyle = 'white';
        ctx.fillText(`${percentage}%`, x, y);
      });
      ctx.restore();
    }
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = ((value / totalSequestration) * 100).toFixed(1);
            return `${label}: ${percentage}% (${value.toFixed(2)} kg)`;
          }
        }
      }
    }
  };

  // Data for the line graph
  const lineChartData = {
    labels: ['2022', '2023', '2024'],
    datasets: [
      {
        label: 'Sequestration (kg)',
        data: [1128, 1239, 1349],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };


  return (
  <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
    <ParkHeader cardClassName="h-24 md:h-[160px]">
      <div className="flex w-full md:text-center md:mx-auto md:block md:w-auto">
        <div className="flex-1 font-medium text-2xl md:text-3xl">
          Decarbonization Areas{' '}
          <span className="text-sm md:text-lg">in {selectedPark?.name}</span>{' '}
          <Tooltip
            title="A Decarbonization Area is a group of plants (trees, shrubs) used to calculate carbon absorption based on their biomass. It tracks the overall carbon reduction impact of the area."
            trigger="click"
          >
            <span onClick={handleTooltipClick}>
              <FaQuestionCircle className="inline-block text-white cursor-pointer" />
            </span>
          </Tooltip>
        </div>
      </div>
    </ParkHeader>

   {/* Visualization Area */}
<div className="h-[35vh] p-4 flex">
  {/* Doughnut Chart */}
  <div className="w-1/2 flex items-center justify-center" style={{ height: '250px' }}>
    <div style={{ width: '85%', height: '100%', position: 'relative' }}>
      <Doughnut data={donutChartData} options={donutOptions} />
    </div>
  </div>

  {/* Line Graph */}
  <div className="w-1/2 flex items-center justify-center" style={{ height: '250px' }}>
    <div style={{ width: '85%', height: '100%', position: 'relative' }}>
      <Line data={lineChartData} options={options} />
    </div>
  </div>
</div>
   <div className="flex flex-col overflow-hidden">
      <div className="pt-2 bg-green-50 backdrop-blur bg-white/10 mx-4 rounded-2xl px-4 md:mx-4">
        <Input
          suffix={<FiSearch />}
          placeholder="Search Decarbonization Areas..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full mb-2 md:flex-[3]"
        />
      </div>

     <div className="flex flex-col h-[calc(100vh-30vh-160px)] overflow-hidden mx-4 mt-2 md:bg-white md:rounded-xl md:p-4">
  <div className="flex-grow overflow-y-auto">
        {!filteredAreas || filteredAreas.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="opacity-40 flex flex-col justify-center items-center text-center">
              <PiPlantFill className="text-4xl mb-2" />
              No Decarbonization Areas found.
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-2">
            {filteredAreas.map((area) => (
              <div
                key={area.id}
                onClick={() => navigateToDecarbArea(area.id)}
                className="w-full text-left inline-flex items-center py-2 px-4 cursor-pointer bg-white rounded-xl mb-2 md:border-[1px] hover:bg-green-600/10"
              >
                <div className="flex flex-row w-full items-center">
                  <div className="w-[80px] h-[80px] flex-shrink-0 mr-2 overflow-hidden rounded-full bg-slate-400/40">
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <PiPlantFill className="text-4xl" />
                    </div>
                  </div>
                  <div className="h-full flex-1">
                    <div className="text-lg font-semibold text-green-700">{area.name}</div>
                    <div className="-mt-[2px] text-green-700/80">{area.description}</div>
                    <div className="mt-1 text-sm text-green-600">
                      <div className="md:inline-block">
                        Total Sequestration: {areaDetails[area.id]?.totalSequestration.toFixed(2)} kg
                      </div>
                      <div className="md:inline-block md:ml-4">
                        Occurrences: {areaDetails[area.id]?.occurrenceCount}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-8 h-full text-green-600 self-stretch">
                    <MdChevronRight size={24} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  </div>
);
};

export default withParkGuard(DecarbViewAll);
