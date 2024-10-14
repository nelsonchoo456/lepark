import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePark } from '../../park-context/ParkContext';
import { getEventsByParkId, EventResponse, EventTypeEnum, EventSuitabilityEnum, EventStatusEnum } from '@lepark/data-access';
import { Card, Tag, Input, TreeSelect, Spin } from 'antd';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { FiSearch } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import dayjs from 'dayjs';

const { SHOW_PARENT } = TreeSelect;

const formatEnumLabel = (label: string) => {
  const specialCases = {
    BBQ_PIT: 'BBQ Pit',
    AED: 'AED',
  };
  if (specialCases[label]) {
    return specialCases[label];
  }
  return label
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const EventsPerPark: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPark } = usePark();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      console.log('Selected Park:', selectedPark);
      if (!selectedPark) return;
      setLoading(true);
      try {
        const response = await getEventsByParkId(selectedPark.id);
        setEvents(response.data);
        console.log('Events:', response.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [selectedPark]);

  const navigateToEvent = (eventId: string) => {
    navigate(`/event/${eventId}`);
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
          { title: 'Ongoing', value: 'status-ONGOING', key: 'status-ONGOING' },
          { title: 'Upcoming', value: 'status-UPCOMING', key: 'status-UPCOMING' },
          { title: 'Completed', value: 'status-COMPLETED', key: 'status-COMPLETED' },
        ],
      },
      {
        title: 'Type',
        value: 'type',
        key: 'type',
        selectable: false,
        children: Object.values(EventTypeEnum).map((type) => ({
          title: formatEnumLabel(type),
          value: `type-${type}`,
          key: `type-${type}`,
        })),
      },
      {
        title: 'Suitability',
        value: 'suitability',
        key: 'suitability',
        selectable: false,
        children: Object.values(EventSuitabilityEnum).map((suitability) => ({
          title: formatEnumLabel(suitability),
          value: `suitability-${suitability}`,
          key: `suitability-${suitability}`,
        })),
      },
    ];
  }, []);

  const filteredEvents = useMemo(() => {
    if (loading) return [];
    return events.filter((event) => {
      const matchesSearchQuery = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilters = selectedFilters.every((filter) => {
        const [category, value] = filter.split('-');
        if (category === 'status') return event.status === value;
        if (category === 'type') return event.type === value;
        if (category === 'suitability') return event.suitability === value;
        return true;
      });
      return matchesSearchQuery && matchesFilters;
    });
  }, [events, searchQuery, selectedFilters, loading]);

  const renderEventStatus = (status: EventStatusEnum) => {
    switch (status) {
      case EventStatusEnum.ONGOING:
        return (
          <Tag color="green" bordered={false}>
            {formatEnumLabel(status)}
          </Tag>
        );
      case EventStatusEnum.UPCOMING:
        return (
          <Tag color="blue" bordered={false}>
            {formatEnumLabel(status)}
          </Tag>
        );
      case EventStatusEnum.COMPLETED:
        return (
          <Tag color="gray" bordered={false}>
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
          <p className="font-light">Events in</p>
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
          placeholder="Search Events..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full mb-2 md:flex-[3] "
        />
        <TreeSelect
          treeData={treeData}
          value={selectedFilters}
          onChange={handleFilterChange}
          treeCheckable={true}
          showCheckedStrategy={SHOW_PARENT}
          placeholder={<div className="md:text-white/75 text-green-700">{`Filter by Status, Type, Suitability`}</div>}
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
      ) : !filteredEvents || filteredEvents.length === 0 ? (
        <div className="opacity-40 flex flex-col justify-center items-center text-center w-full">
          <FiSearch className="text-4xl mb-2 mt-10" />
          No Events found.
        </div>
      ) : (
        <div
          className="justify-center overflow-y-auto mx-4
          md:mt-6 md:bg-white md:flex-1 md:mb-4 md:rounded-xl md:p-4"
        >
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => navigateToEvent(event.id)}
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
                  {event.images && event.images.length > 0 && (
                    <img src={event.images[0]} alt={event.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="h-full flex-1">
                  <div className="text-lg font-semibold text-green-700">{event.title}</div>
                  <div className="-mt-[2px] text-green-700/80">{renderEventStatus(event.status)}</div>
                  <div className="text-sm text-gray-500">Type: {formatEnumLabel(event.type)}</div>
                  <div className="text-sm text-gray-500">Suitability: {formatEnumLabel(event.suitability)}</div>
                </div>
                <div className="h-full flex-1 hidden lg:block">
                  <div className="text-sm text-gray-500">{event.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPerPark;
