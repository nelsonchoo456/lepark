import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, DatePicker, Spin, Tag, Flex, Input, message, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  AttractionResponse,
  AttractionTicketCategoryEnum,
  AttractionTicketNationalityEnum,
  AttractionTicketResponse,
  AttractionTicketStatusEnum,
  getAttractionTicketsByAttractionId,
} from '@lepark/data-access';
import dayjs from 'dayjs';
import { FiSearch } from 'react-icons/fi';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface TicketSalesTabProps {
  attraction: AttractionResponse;
}

const TicketSalesTab: React.FC<TicketSalesTabProps> = ({ attraction }) => {
  const [tickets, setTickets] = useState<AttractionTicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchTicketsData();
    }
  }, [startDate, endDate]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const response = await getAttractionTicketsByAttractionId(attraction.id);
      const formattedData = response.data.map((ticket: AttractionTicketResponse) => ({
        ...ticket,
        purchaseDate: dayjs(ticket.attractionTicketTransaction?.purchaseDate).format('YYYY-MM-DD'),
      }));
      formattedData.sort((a: any, b: any) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
      setTickets(formattedData);

      if (formattedData.length > 0) {
        setStartDate(formattedData[0].purchaseDate);
        setEndDate(formattedData[formattedData.length - 1].purchaseDate);
      }
    } catch (error) {
      message.error('Error fetching initial tickets data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketsData = async () => {
    setLoading(true);
    try {
      if (startDate && endDate) {
        const response = await getAttractionTicketsByAttractionId(attraction.id);
        const formattedData = response.data.map((ticket: AttractionTicketResponse) => ({
          ...ticket,
          purchaseDate: dayjs(ticket.attractionTicketTransaction?.purchaseDate).format('YYYY-MM-DD'),
        }));

        // Filter the data based on the selected date range
        const filteredData = formattedData.filter((ticket) => {
          const ticketDate = dayjs(ticket.purchaseDate);
          return ticketDate.isAfter(dayjs(startDate).subtract(1, 'day')) && ticketDate.isBefore(dayjs(endDate).add(1, 'day'));
        });

        filteredData.sort((a: any, b: any) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
        setTickets(filteredData);
      }
    } catch (error) {
      message.error('Error fetching tickets data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    setStartDate(dayjs(dateStrings[0]).format('YYYY-MM-DD'));
    setEndDate(dayjs(dateStrings[1]).format('YYYY-MM-DD'));
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchString = `
        ${ticket.id}
        ${ticket.attractionTicketListing?.nationality}
        ${ticket.attractionTicketListing?.category}
        ${dayjs(ticket.attractionTicketTransaction?.purchaseDate).format('YYYY-MM-DD HH:mm')}
        ${dayjs(ticket.attractionTicketTransaction?.attractionDate).format('YYYY-MM-DD HH:mm')}
        ${ticket.status}
      `.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
  }, [tickets, searchTerm]);

  const columns: ColumnsType<AttractionTicketResponse> = [
    {
      title: 'Ticket ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Nationality',
      dataIndex: ['attractionTicketListing', 'nationality'],
      key: 'nationality',
      render: (nationality: AttractionTicketNationalityEnum) => nationality.toString(),
      filters: Object.values(AttractionTicketNationalityEnum).map((value) => ({
        text: value,
        value: value,
      })),
      onFilter: (value, record) => record.attractionTicketListing?.nationality === value,
    },
    {
      title: 'Category',
      dataIndex: ['attractionTicketListing', 'category'],
      key: 'category',
      render: (category: AttractionTicketCategoryEnum) => category.toString(),
      filters: Object.values(AttractionTicketCategoryEnum).map((value) => ({
        text: value,
        value: value,
      })),
      onFilter: (value, record) => record.attractionTicketListing?.category === value,
    },
    {
      title: 'Purchase Date',
      dataIndex: ['attractionTicketTransaction', 'purchaseDate'],
      key: 'purchaseDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) =>
        dayjs(a.attractionTicketTransaction?.purchaseDate).unix() - dayjs(b.attractionTicketTransaction?.purchaseDate).unix(),
    },
    {
      title: 'Visit Date',
      dataIndex: ['attractionTicketTransaction', 'attractionDate'],
      key: 'attractionDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) =>
        dayjs(a.attractionTicketTransaction?.attractionDate).unix() - dayjs(b.attractionTicketTransaction?.attractionDate).unix(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: AttractionTicketStatusEnum) => {
        let color = 'default';
        switch (status) {
          case AttractionTicketStatusEnum.VALID:
            color = 'green';
            break;
          case AttractionTicketStatusEnum.USED:
            color = 'blue';
            break;
          case AttractionTicketStatusEnum.INVALID:
            color = 'red';
            break;
          // Add more cases if needed
        }
        return <Tag color={color}>{status}</Tag>;
      },
      filters: Object.values(AttractionTicketStatusEnum).map((value) => ({
        text: value,
        value: value,
      })),
      onFilter: (value, record) => record.status === value,
    },
  ];

  return (
    <>
      {startDate && endDate ? (
        <Flex justify="space-between" align="center" className="mb-4">
          <Input
            suffix={<FiSearch />}
            placeholder="Search in Tickets..."
            className="bg-white"
            variant="filled"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '300px' }}
          />
          <div className="flex items-center">
            <Text className="mr-2">Purchase Date: </Text>
            <RangePicker
              onChange={handleDateChange}
              defaultValue={[dayjs(startDate), dayjs(endDate)]}
              value={[dayjs(startDate), dayjs(endDate)]}
            />
          </div>
        </Flex>
      ) : (
        loading && <Spin />
      )}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <Table columns={columns} dataSource={filteredTickets} rowKey="id" pagination={{ pageSize: 10 }} />
      )}
    </>
  );
};

export default TicketSalesTab;
