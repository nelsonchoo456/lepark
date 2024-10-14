import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePark } from '../../park-context/ParkContext';
import { getFacilitiesByParkId, FacilityResponse } from '@lepark/data-access';
import { Card, Tag, Input, Select } from 'antd';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { FiSearch } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import dayjs from 'dayjs';

const { Option } = Select;

const FacilitiesPerPark: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPark } = usePark();
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      console.log('Selected Park:', selectedPark);
      if (!selectedPark) return;
      setLoading(true);
      try {
        const response = await getFacilitiesByParkId(selectedPark.id);
        const publicFacilities = response.data.filter((facility) => facility.isPublic);
        setFacilities(publicFacilities);
        console.log('Facilities:', publicFacilities);
      } catch (error) {
        console.error('Failed to fetch facilities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, [selectedPark]);

  const navigateToFacility = (facilityId: string) => {
    navigate(`/facility/${facilityId}`);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  const filteredFacilities = useMemo(() => {
    if (loading) return [];
    return facilities.filter((facility) => {
      const matchesSearchQuery = facility.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus ? facility.facilityStatus === selectedStatus : true;
      return matchesSearchQuery && matchesStatus;
    });
  }, [facilities, searchQuery, selectedStatus, loading]);

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      <ParkHeader cardClassName="h-24 md:h-[160px]">
        <div className="md:text-center md:mx-auto">
          <p className="font-light">Facilities in</p>
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
          placeholder="Search Facilities..."
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

      {!filteredFacilities || filteredFacilities.length === 0 ? (
        <div className="opacity-40 flex flex-col justify-center items-center text-center w-full">
          <FiSearch className="text-4xl mb-2 mt-10" />
          No Facilities found.
        </div>
      ) : (
        <div
          className="justify-center overflow-y-auto mx-4
          md:mt-6 md:bg-white md:flex-1 md:mb-4 md:rounded-xl md:p-4"
        >
          {filteredFacilities.map((facility) => (
            <div
              key={facility.id}
              onClick={() => navigateToFacility(facility.id)}
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
                  {facility.images && facility.images.length > 0 && (
                    <img src={facility.images[0]} alt={facility.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="h-full flex-1">
                  <div className="text-lg font-semibold text-green-700">{facility.name}</div>
                  <div className="-mt-[2px] text-green-700/80 italic">{facility.facilityStatus}</div>
                </div>
                <div className="h-full flex-1 hidden lg:block">
                  <div className="text-sm text-gray-500">{facility.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacilitiesPerPark;
