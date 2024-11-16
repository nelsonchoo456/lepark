import React, { useState, useEffect, useMemo } from 'react';
import { Table, Spin, Tag, Input, message, Typography, DatePicker, Flex, Button } from 'antd';
import { FiSearch } from 'react-icons/fi';
import dayjs from 'dayjs';
import {
  EventResponse,
  EventTicketResponse,
  EventTicketStatusEnum,
  getEventById,
  getEventTicketListingById,
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
  const [absolutePurchaseStartDate, setAbsolutePurchaseStartDate] = useState<string | null>(null);
  const [absolutePurchaseEndDate, setAbsolutePurchaseEndDate] = useState<string | null>(null);
  const [absoluteVisitStartDate, setAbsoluteVisitStartDate] = useState<string | null>(null);
  const [absoluteVisitEndDate, setAbsoluteVisitEndDate] = useState<string | null>(null);
  const [event, setEvent] = useState<EventResponse | null>(null);

  useEffect(() => {
    fetchTickets();
    fetchEvent();
  }, [ticketListingId]);

  useEffect(() => {
    if (purchaseStartDate && purchaseEndDate && visitStartDate && visitEndDate) {
      fetchFilteredTickets();
    }
  }, [purchaseStartDate, purchaseEndDate, visitStartDate, visitEndDate]);

  const fetchEvent = async () => {
    const ticketListing = await getEventTicketListingById(ticketListingId);
    const response = await getEventById(ticketListing.data.eventId);
    setEvent(response.data);
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await getEventTicketsByListingId(ticketListingId);
      const formattedData = response.data.map((ticket: EventTicketResponse) => ({
        ...ticket,
        purchaseDate: dayjs(ticket.eventTicketTransaction?.purchaseDate).format('YYYY-MM-DD'),
        eventDate: dayjs(ticket.eventTicketTransaction?.eventDate).format('YYYY-MM-DD'),
      }));
      console.log(formattedData);
      const filteredData = formattedData.filter((ticket) => {
        const ticketPurchaseDate = dayjs(ticket.purchaseDate);
        const ticketEventDate = dayjs(ticket.eventDate);
        const isPurchaseDateInRange =
          (!purchaseStartDate || ticketPurchaseDate.isAfter(dayjs(purchaseStartDate).subtract(1, 'day'))) &&
          (!purchaseEndDate || ticketPurchaseDate.isBefore(dayjs(purchaseEndDate).add(1, 'day')));
        const isVisitDateInRange =
          (!visitStartDate || ticketEventDate.isAfter(dayjs(visitStartDate).subtract(1, 'day'))) &&
          (!visitEndDate || ticketEventDate.isBefore(dayjs(visitEndDate).add(1, 'day')));
        return isPurchaseDateInRange && isVisitDateInRange;
      });

      formattedData.sort((a: any, b: any) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
      setTickets(formattedData);

      if (formattedData.length > 0) {
        // Only set dates if they are not already set
        if (!purchaseStartDate) {
          setPurchaseStartDate(formattedData[0].purchaseDate);
          setAbsolutePurchaseStartDate(formattedData[0].purchaseDate);
        }
        if (!purchaseEndDate) {
          setPurchaseEndDate(formattedData[formattedData.length - 1].purchaseDate);
          setAbsolutePurchaseEndDate(formattedData[formattedData.length - 1].purchaseDate);
        }
        formattedData.sort((a: any, b: any) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
        if (!visitStartDate) {
          setVisitStartDate(formattedData[0].eventDate);
          setAbsoluteVisitStartDate(formattedData[0].eventDate);
        }
        if (!visitEndDate) {
          setVisitEndDate(formattedData[formattedData.length - 1].eventDate);
          setAbsoluteVisitEndDate(formattedData[formattedData.length - 1].eventDate);
        }
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      message.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredTickets = async () => {
    setLoading(true);
    try {
      const response = await getEventTicketsByListingId(ticketListingId);
      const formattedData = response.data.map((ticket: EventTicketResponse) => ({
        ...ticket,
        purchaseDate: dayjs(ticket.eventTicketTransaction?.purchaseDate).format('YYYY-MM-DD'),
        eventDate: dayjs(ticket.eventTicketTransaction?.eventDate).format('YYYY-MM-DD'),
      }));

      // Filter the data based on the selected date ranges
      const filteredData = formattedData.filter((ticket) => {
        const ticketPurchaseDate = dayjs(ticket.purchaseDate);
        const ticketEventDate = dayjs(ticket.eventDate);
        return (
          ticketPurchaseDate.isAfter(dayjs(purchaseStartDate).subtract(1, 'day')) &&
          ticketPurchaseDate.isBefore(dayjs(purchaseEndDate).add(1, 'day')) &&
          ticketEventDate.isAfter(dayjs(visitStartDate).subtract(1, 'day')) &&
          ticketEventDate.isBefore(dayjs(visitEndDate).add(1, 'day'))
        );
      });

      filteredData.sort((a: any, b: any) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
      setTickets(filteredData);
    } catch (error) {
      message.error('Error fetching tickets data.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseDateChange = (dates: any, dateStrings: [string, string]) => {
    setPurchaseStartDate(dayjs(dateStrings[0]).format('YYYY-MM-DD'));
    setPurchaseEndDate(dayjs(dateStrings[1]).format('YYYY-MM-DD'));
  };

  const handleVisitDateChange = (dates: any, dateStrings: [string, string]) => {
    setVisitStartDate(dayjs(dateStrings[0]).format('YYYY-MM-DD'));
    setVisitEndDate(dayjs(dateStrings[1]).format('YYYY-MM-DD'));
  };

  const resetPurchaseDate = async () => {
    setPurchaseStartDate(absolutePurchaseStartDate);
    setPurchaseEndDate(absolutePurchaseEndDate);
  };

  const resetVisitDate = async () => {
    setVisitStartDate(absoluteVisitStartDate);
    setVisitEndDate(absoluteVisitEndDate);
  };

  const filteredTickets = useMemo(() => {
    console.log('Filtering tickets with:', { purchaseStartDate, purchaseEndDate, visitStartDate, visitEndDate, searchTerm }); // Log filter criteria
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
      sorter: (a, b) => dayjs(a.eventTicketTransaction?.purchaseDate).unix() - dayjs(b.eventTicketTransaction?.purchaseDate).unix(),
    },
    {
      title: 'Event Date',
      dataIndex: ['eventTicketTransaction', 'eventDate'],
      key: 'eventDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.eventTicketTransaction?.eventDate).unix() - dayjs(b.eventTicketTransaction?.eventDate).unix(),
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
            disabledDate={(current) => {
              // Convert to start of day to avoid timezone issues
              const currentDate = current.startOf('day');
              const eventEnd = dayjs(event?.endDate).startOf('day');

              // Disable dates after event end date
              return currentDate.isAfter(eventEnd);
            }}
          />
          <Button onClick={resetPurchaseDate} className="ml-2">
            Reset
          </Button>
        </div>
      </Flex>
      <Flex justify="flex-end" align="center" className="mb-4">
        <div className="flex items-center">
          <Text className="mr-2">Event Date: </Text>
          <RangePicker
            onChange={handleVisitDateChange}
            value={[visitStartDate ? dayjs(visitStartDate) : null, visitEndDate ? dayjs(visitEndDate) : null]}
            disabledDate={(current) => {
              // Convert to start of day to avoid timezone issues
              const currentDate = current.startOf('day');
              const eventStart = dayjs(event?.startDate).startOf('day');
              const eventEnd = dayjs(event?.endDate).startOf('day');

              // Disable dates outside the event range
              return currentDate.isBefore(eventStart) || currentDate.isAfter(eventEnd);
            }}
          />
          <Button onClick={resetVisitDate} className="ml-2">
            Reset
          </Button>
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
