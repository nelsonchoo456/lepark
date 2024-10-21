import React, { useState, useEffect, useMemo } from 'react';
import { Table, Spin, Tag, Input, message, Typography, DatePicker, Flex } from 'antd';
import { FiSearch } from 'react-icons/fi';
import dayjs from 'dayjs';
import {
  EventTicketResponse,
  EventTicketStatusEnum,
  getEventTicketsByListingId,
} from '@lepark/data-access';
import { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface TicketListingTicketSalesTableProps {
  ticketListingId: string;
}

const TicketListingTicketSalesTable: React.FC<TicketListingTicketSalesTableProps> = ({ ticketListingId }) => {
  const [tickets, setTickets] = useState<EventTicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [purchaseStartDate, setPurchaseStartDate] = useState<string | null>(null);
  const [purchaseEndDate, setPurchaseEndDate] = useState<string | null>(null);
  const [visitStartDate, setVisitStartDate] = useState<string | null>(null);
  const [visitEndDate, setVisitEndDate] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, [ticketListingId, purchaseStartDate, purchaseEndDate, visitStartDate, visitEndDate]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await getEventTicketsByListingId(ticketListingId);
      const formattedData = response.data.map((ticket: EventTicketResponse) => ({
        ...ticket,
        purchaseDate: dayjs(ticket.eventTicketTransaction?.purchaseDate).format('YYYY-MM-DD'),
        eventDate: dayjs(ticket.eventTicketTransaction?.eventDate).format('YYYY-MM-DD'),
      }));
      const filteredData = formattedData.filter((ticket) => {
        const ticketPurchaseDate = dayjs(ticket.purchaseDate);
        const ticketEventDate = dayjs(ticket.eventDate);
        const isPurchaseDateInRange = (!purchaseStartDate || ticketPurchaseDate.isAfter(dayjs(purchaseStartDate).subtract(1, 'day'))) &&
                                      (!purchaseEndDate || ticketPurchaseDate.isBefore(dayjs(purchaseEndDate).add(1, 'day')));
        const isVisitDateInRange = (!visitStartDate || ticketEventDate.isAfter(dayjs(visitStartDate).subtract(1, 'day'))) &&
                                   (!visitEndDate || ticketEventDate.isBefore(dayjs(visitEndDate).add(1, 'day')));
        return isPurchaseDateInRange && isVisitDateInRange;
      });
  
      setTickets(filteredData);
  
      if (!purchaseStartDate && !purchaseEndDate && !visitStartDate && !visitEndDate && formattedData.length > 0) {
        setPurchaseStartDate(formattedData[0].purchaseDate);
        setPurchaseEndDate(formattedData[formattedData.length - 1].purchaseDate);
        setVisitStartDate(formattedData[0].eventDate);
        setVisitEndDate(formattedData[formattedData.length - 1].eventDate);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      message.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseDateChange = (dates: any, dateStrings: [string, string]) => {
    setPurchaseStartDate(dateStrings[0] ? dayjs(dateStrings[0]).format('YYYY-MM-DD') : null);
    setPurchaseEndDate(dateStrings[1] ? dayjs(dateStrings[1]).format('YYYY-MM-DD') : null);
  };

  const handleVisitDateChange = (dates: any, dateStrings: [string, string]) => {
    setVisitStartDate(dateStrings[0] ? dayjs(dateStrings[0]).format('YYYY-MM-DD') : null);
    setVisitEndDate(dateStrings[1] ? dayjs(dateStrings[1]).format('YYYY-MM-DD') : null);
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
    const searchString = `
      ${ticket.id}
      ${dayjs(ticket.eventTicketTransaction?.purchaseDate).format('YYYY-MM-DD')}
      ${dayjs(ticket.eventTicketTransaction?.eventDate).format('YYYY-MM-DD')}
      ${ticket.status}
    `.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
  }, [tickets, searchTerm]);

  const columns: ColumnsType<EventTicketResponse> = [
    {
      title: 'Ticket ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Purchase Date',
      dataIndex: ['eventTicketTransaction', 'purchaseDate'],
      key: 'purchaseDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) =>
        dayjs(a.eventTicketTransaction?.purchaseDate).unix() - dayjs(b.eventTicketTransaction?.purchaseDate).unix(),
    },
    {
      title: 'Visit Date',
      dataIndex: ['eventTicketTransaction', 'eventDate'],
      key: 'eventDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) =>
        dayjs(a.eventTicketTransaction?.eventDate).unix() - dayjs(b.eventTicketTransaction?.eventDate).unix(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: EventTicketStatusEnum) => {
        let color = 'default';
        switch (status) {
          case EventTicketStatusEnum.VALID:
            color = 'green';
            break;
          case EventTicketStatusEnum.USED:
            color = 'blue';
            break;
          case EventTicketStatusEnum.INVALID:
            color = 'red';
            break;
          // Add more cases if needed
        }
        return <Tag color={color}>{status}</Tag>;
      },
      filters: Object.values(EventTicketStatusEnum).map((value) => ({
        text: value,
        value: value,
      })),
      onFilter: (value, record) => record.status === value,
    },
  ];

   return (
    <>
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
            onChange={handlePurchaseDateChange}
            value={[purchaseStartDate ? dayjs(purchaseStartDate) : null, purchaseEndDate ? dayjs(purchaseEndDate) : null]}
          />
        </div>
      </Flex>
      <Flex justify="flex-end" align="center" className="mb-4">
        <div className="flex items-center">
          <Text className="mr-2">Visit Date: </Text>
          <RangePicker
            onChange={handleVisitDateChange}
            value={[visitStartDate ? dayjs(visitStartDate) : null, visitEndDate ? dayjs(visitEndDate) : null]}
          />
        </div>
      </Flex>
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

export default TicketListingTicketSalesTable;