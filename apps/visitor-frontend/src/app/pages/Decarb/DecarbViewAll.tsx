import { ContentWrapper, ContentWrapperDark, Divider, LogoText, useAuth } from '@lepark/common-ui';
import MainLayout from '../../components/main/MainLayout';
import { NavButton } from '../../components/buttons/NavButton';
import { PiPlantFill, PiStarFill, PiTicketFill } from 'react-icons/pi';
import { FaPlane, FaTent, FaTv } from 'react-icons/fa6';
import { Badge, Card, Space, Input, Tag, Button, Tooltip } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { getDecarbonizationAreasByParkId, DecarbonizationAreaResponse, VisitorResponse, getOccurrencesWithinDecarbonizationArea, getTotalSequestrationForParkAndYear } from '@lepark/data-access';
import { FiSearch } from 'react-icons/fi';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { usePark } from '../../park-context/ParkContext';
import styled from 'styled-components';
import { IoIosArrowDown } from 'react-icons/io';
import { IoEarth } from 'react-icons/io5';
import withParkGuard from '../../park-context/withParkGuard';
import { FaQuestionCircle } from 'react-icons/fa';
import { MdChevronRight, MdInfoOutline, MdMap } from 'react-icons/md';
import React from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Tabs } from 'antd';
import { calculateA380FlightTime, calculateHDBPoweredDays, calculateNetflixHoursOffset, calculateSmartphoneChargesPerDay } from './DecarbFunctions';
import { PiPlant } from 'react-icons/pi';
import { BsHouseDoor, BsPhone } from 'react-icons/bs';

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
  const [totalSequestration, setTotalSequestration] = useState<number | null>(null);
  const [poweredDays, setPoweredDays] = useState<number | null>(null);
  const [netflixHours, setNetflixHours] = useState<number | null>(null);
  const [a380FlightTime, setA380FlightTime] = useState<{ hours: number; minutes: number } | null>(null);
  const [smartphoneChargesPerDay, setSmartphoneChargesPerDay] = useState<number | null>(null);

  useEffect(() => {
    const fetchDecarbAreas = async () => {
      setLoading(true);
      try {
        if (selectedPark) {
          const response = await getDecarbonizationAreasByParkId(selectedPark.id);
          setFetchedAreas(response.data);

          // Fetch details for each area
          const details = await Promise.all(
            response.data.map(async (area) => {
              const occurrences = await getOccurrencesWithinDecarbonizationArea(area.id);
              const totalSequestration = occurrences.data.reduce((sum: number, occ: any) => sum + occ.biomass, 0);
              return {
                id: area.id,
                totalSequestration,
                occurrenceCount: occurrences.data.length,
              };
            }),
          );
          const detailsObject = details.reduce<{ [key: string]: { totalSequestration: number; occurrenceCount: number } }>(
            (acc, detail) => {
              acc[detail.id] = {
                totalSequestration: detail.totalSequestration,
                occurrenceCount: detail.occurrenceCount,
              };
              return acc;
            },
            {},
          );

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

  useEffect(() => {
    const fetchSequestration = async () => {
      if (selectedPark?.id) {
        try {
                  const currentYear = new Date().getFullYear().toString();
          const response = await getTotalSequestrationForParkAndYear(selectedPark.id, currentYear);
          const sequestration = response.data.totalSequestration;
          setTotalSequestration(Math.round(sequestration));
          setPoweredDays(calculateHDBPoweredDays(sequestration));
          setNetflixHours(calculateNetflixHoursOffset(sequestration));
          setA380FlightTime(calculateA380FlightTime(sequestration));
          setSmartphoneChargesPerDay(calculateSmartphoneChargesPerDay(sequestration));
        } catch (error) {
          console.error('Error fetching sequestration data:', error);
        }
      }
    };

    fetchSequestration();
  }, [selectedPark]);
  const navigateToDecarbArea = (areaId: string) => {
    navigate(`/decarb/${areaId}`);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const filteredAreas = useMemo(() => {
    if (loading) return [];
    return fetchedAreas.filter((area) => area.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [fetchedAreas, searchQuery, loading]);

  const handleTooltipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  const funFacts = useMemo(() => {
    if (!totalSequestration || !poweredDays || !netflixHours || !a380FlightTime) return [];

    return [
      {
        icon: <PiPlant className="text-4xl mb-2 text-green-500" />,
        content: (
          <p className="text-green-500">In the past year, this park has absorbed <span className="font-bold text-lg ml-1 text-green-500">{totalSequestration} kg</span> of CO2</p>
        )
      },
      {
        icon: <BsHouseDoor className="text-4xl mb-2 text-green-500" />,
        content: (
          <p className="text-green-500">This year, the park has offset <span className="font-bold text-lg ml-1 text-green-500">{poweredDays} days</span> of electricity bill for 1 family</p>
        )
      },
      {
        icon: <FaTv className="text-4xl mb-2 text-green-500" />,
        content: (
          <p className="text-green-500">Today, this park has offset <span className="font-bold text-lg ml-1 text-green-500">{netflixHours} hours</span> of Netflix streaming emissions</p>
        )
      },
      {
  icon: <BsPhone className="text-4xl mb-2 text-green-500" />,
  content: (
    <p className="text-green-500">
      Daily, this park offsets <span className="font-bold text-lg ml-1 text-green-500">{smartphoneChargesPerDay}</span> smartphone charges
    </p>
  )
},
      {
        icon: <FaPlane className="text-4xl mb-2 text-green-500" />,
        content: (
          <p className="text-green-500">
            Annual offset equivalent to
            {(a380FlightTime.hours > 0 || a380FlightTime.minutes > 0) && (
              <span className="font-bold text-lg ml-1 text-green-500">
                {a380FlightTime.hours > 0 && `${a380FlightTime.hours} hours`}
                {a380FlightTime.minutes > 0 && ` ${a380FlightTime.minutes} min `}
              </span>
            )} of A380 flight time
          </p>
        )
      }
    ];
  }, [totalSequestration, poweredDays, netflixHours, a380FlightTime]);

  const selectedFacts = useMemo(() => {
    return funFacts.length >= 2 ? funFacts.sort(() => 0.5 - Math.random()).slice(0, 2) : [];
  }, [funFacts]);

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
      <ParkHeader cardClassName="h-24 md:h-[160px] flex">
        <div className="flex w-full md:text-center md:mx-auto md:block md:w-auto">
          <div className="flex-1 font-medium text-2xl md:text-3xl">
            Decarbonization Areas <br />
            <span className="text-sm md:text-md opacity-80">in {selectedPark?.name}</span>{' '}
            <Tooltip
              title="A Decarbonization Area is a group of plants (trees, shrubs) used to calculate carbon absorption based on their biomass. It tracks the overall carbon reduction impact of the area."
              trigger="click"
            >
              <span onClick={handleTooltipClick}>
                <MdInfoOutline className="inline-block text-white cursor-pointer md:text-md text-sm opacity-80" />
              </span>
            </Tooltip>
          </div>
        </div>
        <Tooltip title="Map View">
          <Button
            icon={<MdMap />}
            className="text-lg"
            type="primary"
            onClick={(e) => {
              navigate('/decarb/map-view');
              e.stopPropagation();
            }}
          ></Button>
        </Tooltip>
      </ParkHeader>

   {/* Fun Facts */}
     {selectedFacts.length === 2 && (
        <div className="flex justify-between items-center h-48 mx-4 mt-4 rounded-xl p-4">
          {selectedFacts.map((fact, index) => (
            <React.Fragment key={index}>
              {index > 0 && <div className="w-px h-full bg-green-500 mx-4"></div>}
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                {fact.icon}
                {fact.content}
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

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
                          <div className="md:inline-block md:ml-4">Occurrences: {areaDetails[area.id]?.occurrenceCount}</div>
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
