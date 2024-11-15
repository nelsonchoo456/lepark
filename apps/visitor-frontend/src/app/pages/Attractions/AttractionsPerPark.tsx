import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePark } from '../../park-context/ParkContext';
import { getAttractionsByParkId, AttractionResponse } from '@lepark/data-access';
import { Card, Tag, Input, Select, Spin, Pagination } from 'antd';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { FiSearch } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import dayjs from 'dayjs';

const { Option } = Select;

const AttractionsPerPark: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPark } = usePark();
  const [loading, setLoading] = useState(false);
  const [attractions, setAttractions] = useState<AttractionResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items per page

  useEffect(() => {
    const fetchAttractions = async () => {
      if (!selectedPark) return;
      setLoading(true);
      try {
        const response = await getAttractionsByParkId(selectedPark.id);
        setAttractions(response.data);
      } catch (error) {
        console.error('Failed to fetch attractions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttractions();
  }, [selectedPark]);

  const navigateToAttraction = (attractionId: string) => {
    navigate(`/attractions/${attractionId}`);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  const filteredAttractions = useMemo(() => {
    if (loading) return [];
    return attractions.filter((attraction) => {
      const matchesSearchQuery = attraction.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus ? attraction.status === selectedStatus : true;
      return matchesSearchQuery && matchesStatus;
    });
  }, [attractions, searchQuery, selectedStatus, loading]);

  const paginatedAttractions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAttractions.slice(startIndex, endIndex);
  }, [filteredAttractions, currentPage, itemsPerPage]);

  const formatHoursForToday = (openingHours: Date[], closingHours: Date[]) => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const todayIndex = new Date().getDay(); // 0 is Sunday, 6 is Saturday
    const adjustedToday = todayIndex === 0 ? 6 : todayIndex - 1; // Adjust so that 0 is Monday and 6 is Sunday
    const open = openingHours[adjustedToday];
    const close = closingHours[adjustedToday];
    return `${daysOfWeek[adjustedToday]}: ${dayjs(open).format('HH:mm')} - ${dayjs(close).format('HH:mm')}`;
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      <ParkHeader cardClassName="h-32 md:h-[160px]">
        <div className="md:text-center md:mx-auto">
          <p className="font-light">Attractions in</p>
          <p className="font-medium text-2xl -mt-1 md:text-3xl">{selectedPark?.name}</p>
        </div>
      </ParkHeader>
      <div
        className="p-2 items-center bg-green-50 mt-[-2.5rem]
        backdrop-blur bg-white/10 mx-4 rounded-2xl px-4
        md:flex-row md:-mt-[5.5rem] md:gap-2 md:backdrop-blur md:bg-white/10 md:mx-4 md:px-4"
      >
        <Input
          suffix={<FiSearch />}
          placeholder="Search Attractions..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full mb-2 md:flex-[3] "
        />
        {selectedStatus && <div className="text-sm text-white/50 mb-1 ml-1 md:text-white/75"></div>}
        <Select
          placeholder={<div className="md:text-white/75 text-green-700">{`Filter by Status`}</div>}
          value={selectedStatus}
          onChange={handleStatusChange}
          className="w-full cursor-pointer md:flex-1 md:min-w-[260px] mb-2"
          variant="borderless"
          suffixIcon={<IoIosArrowDown className="md:text-gray-400 text-green-700 text-lg cursor-pointer" />}
        >
          <Option value={null}>All</Option>
          <Option value="OPEN">Open</Option>
          <Option value="CLOSED">Closed</Option>
          <Option value="UNDER_MAINTENANCE">Under Maintenance</Option>
        </Select>
        {selectedStatus && <div className="h-[1px] w-full bg-black/5" />}
      </div>
      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <Spin size="large" />
        </div>
      ) : !filteredAttractions || filteredAttractions.length === 0 ? (
        <div className="opacity-40 flex flex-col justify-center items-center text-center w-full">
          <FiSearch className="text-4xl mb-2 mt-10" />
          No Attractions found.
        </div>
      ) : (
        <div
          className="justify-center overflow-y-auto mx-4 flex-1
    md:mt-6 md:bg-white md:mb-4 md:rounded-xl md:p-4"
        >
          {paginatedAttractions.map((attraction) => (
            <div
              key={attraction.id}
              onClick={() => navigateToAttraction(attraction.id)}
              className="w-full text-left inline-flex items-center py-2 px-4 cursor-pointer
          bg-white rounded-xl mb-2
          md:border-[1px]
          hover:bg-green-600/10"
            >
              <div className="flex flex-row w-full">
                <div
                  className="w-[80px] h-[80px] flex-shrink-0 mr-2 overflow-hidden rounded-full bg-slate-400/40
          "
                >
                  {attraction.images && attraction.images.length > 0 && (
                    <img src={attraction.images[0]} alt={attraction.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="h-full flex-1">
                  <div className="text-lg font-semibold text-green-700">{attraction.title}</div>
                  <div className="-mt-[2px] text-green-700/80 italic line-clamp-2">{attraction.description}</div>
                </div>
                <div className="h-full flex-1 hidden lg:block">
                  <Tag color={attraction.status === 'OPEN' ? 'green' : 'red'}>{attraction.status}</Tag>
                  <div className="text-sm text-green-700/60 mt-2">
                    {formatHoursForToday(attraction.openingHours, attraction.closingHours)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Pagination
            current={currentPage}
            pageSize={itemsPerPage}
            total={filteredAttractions.length}
            onChange={(page) => setCurrentPage(page)}
            className="mt-4"
          />
        </div>
      )}
    </div>
  );
};

export default AttractionsPerPark;
