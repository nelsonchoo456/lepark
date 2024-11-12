import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePark } from '../../park-context/ParkContext';
import { getFacilitiesByParkId, FacilityResponse, FacilityTypeEnum, FacilityStatusEnum } from '@lepark/data-access';
import { Card, Tag, Input, TreeSelect, Spin } from 'antd';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { FiSearch } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import dayjs from 'dayjs';
import withParkGuard from '../../park-context/withParkGuard';
import { MdArrowForwardIos } from 'react-icons/md';
import { Typography } from 'antd';

const { SHOW_PARENT } = TreeSelect;

const formatEnumLabel = (label: string) => {
  const specialCases = {
    BBQ_PIT: 'BBQ Pit',
    AED: 'AED',
  };
  if (specialCases[label as keyof typeof specialCases]) {
    return specialCases[label as keyof typeof specialCases];
  }
  return label
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const FacilitiesPerPark: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPark } = usePark();
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

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

  const handleFilterChange = (value: string[]) => {
    setSelectedFilters(value);
  };

  const treeData = useMemo(() => {
    return [
      {
        title: 'Status',
        value: 'status',
        key: 'status',
        selectable: false,
        children: [
          { title: 'Open', value: 'status-OPEN', key: 'status-OPEN' },
          { title: 'Closed', value: 'status-CLOSED', key: 'status-CLOSED' },
          { title: 'Under Maintenance', value: 'status-UNDER_MAINTENANCE', key: 'status-UNDER_MAINTENANCE' },
        ],
      },
      {
        title: 'Type',
        value: 'type',
        key: 'type',
        selectable: false,
        children: Object.values(FacilityTypeEnum)
          .filter((type) => type !== 'STOREROOM') // Remove "Storeroom" from the filter options
          .map((type) => ({
            title: formatEnumLabel(type),
            value: `type-${type}`,
            key: `type-${type}`,
          })),
      },
      {
        title: 'Bookable',
        value: 'isBookable',
        key: 'isBookable',
        selectable: false,
        children: [
          { title: 'Bookable', value: 'isBookable-true', key: 'isBookable-true' },
          { title: 'Not Bookable', value: 'isBookable-false', key: 'isBookable-false' },
        ],
      },
    ];
  }, []);

  const filteredFacilities = useMemo(() => {
    if (loading) return [];
    return facilities.filter((facility) => {
      const matchesSearchQuery = facility.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilters = selectedFilters.every((filter) => {
        const [category, value] = filter.split('-');
        if (category === 'status') return facility.facilityStatus === value;
        if (category === 'type') return facility.facilityType === value;
        if (category === 'isBookable') return facility.isBookable === (value === 'true');
        return true;
      });
      return matchesSearchQuery && matchesFilters;
    });
  }, [facilities, searchQuery, selectedFilters, loading]);

  const renderFacilityStatus = (status: FacilityStatusEnum) => {
    switch (status) {
      case FacilityStatusEnum.OPEN:
        return (
          <Tag color="green" bordered={false}>
            {formatEnumLabel(status)}
          </Tag>
        );
      case FacilityStatusEnum.UNDER_MAINTENANCE:
        return (
          <Tag color="yellow" bordered={false}>
            {formatEnumLabel(status)}
          </Tag>
        );
      case FacilityStatusEnum.CLOSED:
        return (
          <Tag color="red" bordered={false}>
            {formatEnumLabel(status)}
          </Tag>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  };

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
        <TreeSelect
          treeData={treeData}
          value={selectedFilters}
          onChange={handleFilterChange}
          treeCheckable={true}
          showCheckedStrategy={SHOW_PARENT}
          placeholder={<div className="md:text-white/75 text-green-700">{`Filter by Status, Type, Bookable`}</div>}
          className="w-full cursor-pointer md:flex-1 md:min-w-[260px] mb-2"
          variant="borderless"
          suffixIcon={<IoIosArrowDown className="md:text-gray-400 text-green-700 text-lg cursor-pointer" />}
        />
        {selectedFilters.length > 0 && <div className="h-[1px] w-full bg-black/5" />}
      </div>

      {loading ? (
      <div className="flex justify-center items-center flex-1">
        <Spin size="large" />
      </div>
    ) : !filteredFacilities || filteredFacilities.length === 0 ? (
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
              {/* Mobile View (Simple) */}
              <div className="md:hidden flex flex-col w-full">
                <div className="flex items-center gap-3">
                  {/* Circular Image */}
                  <div className="w-[60px] h-[60px] flex-shrink-0 overflow-hidden rounded-full bg-slate-400/40">
                    {facility.images && facility.images.length > 0 && (
                      <img src={facility.images[0]} alt={facility.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  {/* Name, Type, Status */}
                  <div className="flex flex-col">
                    <div className="text-lg font-semibold text-green-700 leading-tight">{facility.name}</div>
                    <div className="text-sm text-gray-500">Type: {formatEnumLabel(facility.facilityType)}</div>
                    <div className="mt-1">{renderFacilityStatus(facility.facilityStatus)}</div>
                  </div>
                </div>
              </div>

              {/* Desktop View (Full) - Hidden on mobile */}
              <div className="hidden md:flex flex-row w-full">
                {/* Column 1: Image, Name, Description */}
                <div className="flex flex-row flex-1">
                  <div className="w-[80px] h-[80px] flex-shrink-0 mr-2 overflow-hidden rounded-full bg-slate-400/40">
                    {facility.images && facility.images.length > 0 && (
                      <img src={facility.images[0]} alt={facility.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 lg:pr-8">
                    <div className="text-lg font-semibold text-green-700 leading-tight">{facility.name}</div>
                    <Typography.Paragraph
                      ellipsis={{
                        rows: 2,
                      }}
                      className="text-sm text-gray-500"
                    >
                      {facility.description}
                    </Typography.Paragraph>
                  </div>
                </div>

                {/* Column 2: Status and Type */}
                <div className="w-[200px]">
                  <div className="text-green-700/80">{renderFacilityStatus(facility.facilityStatus)}</div>
                  <div className="text-sm text-gray-500">Type: {formatEnumLabel(facility.facilityType)}</div>
                </div>

                {/* Column 3: Capacity and Fee */}
                <div className="hidden lg:block w-[200px]">
                  <div className="text-sm text-gray-500">
                    Capacity: {facility.capacity ? `${facility.capacity} pax` : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Fee: {facility.fee ? `$${facility.fee.toFixed(2)}` : 'Free'}
                  </div>
                </div>

                {/* Arrow icon */}
                <div className="flex flex-col justify-center hidden lg:flex">
                  <MdArrowForwardIos className='text-highlightGreen-400'/>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
};

export default withParkGuard(FacilitiesPerPark);
