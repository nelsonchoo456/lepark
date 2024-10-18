import React, { useState, useEffect } from 'react';
import { Table, DatePicker, Input, Flex } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { SensorReadingResponse, getSensorReadingsBySensorId } from '@lepark/data-access';
import dayjs, { Dayjs } from 'dayjs';
import { FiSearch } from 'react-icons/fi';
import { SCREEN_LG } from '../../../config/breakpoints';
import { RangePickerProps } from 'antd/es/date-picker';

const { RangePicker } = DatePicker;

interface SensorReadingsTabProps {
  sensorId: string;
}

const SensorReadingsTab: React.FC<SensorReadingsTabProps> = ({ sensorId }) => {
  const [sensorReadings, setSensorReadings] = useState<SensorReadingResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  useEffect(() => {
    fetchSensorReadings();
  }, [sensorId, dateRange]);

  const fetchSensorReadings = async () => {
    setLoading(true);
    try {
      const response = await getSensorReadingsBySensorId(sensorId);
      let filteredReadings = response.data;

      if (dateRange) {
        const [start, end] = dateRange;
        filteredReadings = filteredReadings.filter(reading => {
          const readingDate = dayjs(reading.date);
          return readingDate.isAfter(start) && readingDate.isBefore(end);
        });
      }

      setSensorReadings(filteredReadings);
    } catch (error) {
      console.error('Error fetching sensor readings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange: RangePickerProps['onChange'] = (dates) => {
    setDateRange(dates as [Dayjs, Dayjs] | null);
  };

  const handleSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredSensorReadings = sensorReadings.filter(reading =>
    reading.value.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
    dayjs(reading.date).format('YYYY-MM-DD HH:mm:ss').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnsType<SensorReadingResponse> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      width: '50%',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => value.toFixed(2),
      sorter: (a, b) => a.value - b.value,
      width: '50%',
    },
  ];

  return (
    <div>
      <Flex justify="space-between" align="center" className="mb-4">
        <RangePicker
          onChange={handleDateRangeChange}
          style={{ width: '300px' }}
          showTime={{ format: 'HH:mm' }}
          format="YYYY-MM-DD HH:mm"
        />
        <Input
          suffix={<FiSearch />}
          placeholder="Search in Sensor Readings..."
          onChange={handleSearchBar}
          style={{ width: '300px' }}
          variant="filled"
        />
      </Flex>
      <Table
        columns={columns}
        dataSource={filteredSensorReadings}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: SCREEN_LG }}
      />
    </div>
  );
};

export default SensorReadingsTab;
