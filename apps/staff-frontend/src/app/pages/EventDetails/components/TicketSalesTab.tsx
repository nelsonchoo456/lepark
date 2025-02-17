import React, { useState, useEffect, useMemo } from 'react';
import { Table, DatePicker, Input, message, Tag, Spin, Flex, Typography, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FiSearch } from 'react-icons/fi';
import dayjs from 'dayjs';
import {
  EventResponse,
  EventTicketResponse,
  EventTicketNationalityEnum,
  EventTicketCategoryEnum,
  EventTicketStatusEnum,
} from '@lepark/data-access';
import { getEventTicketsByEventId } from '@lepark/data-access';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface TicketSalesTabProps {
  event: EventResponse;
}

interface FormattedTicket extends EventTicketResponse {
  purchaseDate: string;
  eventDate: string;
}

const TicketSalesTab: React.FC<TicketSalesTabProps> = ({ event }) => {
  const [tickets, setTickets] = useState<EventTicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseStartDate, setPurchaseStartDate] = useState<string | null>(null);
  const [purchaseEndDate, setPurchaseEndDate] = useState<string | null>(null);
  const [eventStartDate, setEventStartDate] = useState<string | null>(null);
  const [eventEndDate, setEventEndDate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [absolutePurchaseStartDate, setAbsolutePurchaseStartDate] = useState<string | null>(null);
  const [absolutePurchaseEndDate, setAbsolutePurchaseEndDate] = useState<string | null>(null);
  const [absoluteEventStartDate, setAbsoluteEventStartDate] = useState<string | null>(null);
  const [absoluteEventEndDate, setAbsoluteEventEndDate] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (purchaseStartDate && purchaseEndDate && eventStartDate && eventEndDate) {
      fetchTicketsData();
    }
  }, [purchaseStartDate, purchaseEndDate, eventStartDate, eventEndDate]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const response = await getEventTicketsByEventId(event.id);
      const formattedData = response.data.map((ticket: EventTicketResponse) => ({
        ...ticket,
        purchaseDate: dayjs(ticket.eventTicketTransaction?.purchaseDate).format('YYYY-MM-DD'),
        eventDate: dayjs(ticket.eventTicketTransaction?.eventDate).format('YYYY-MM-DD'),
      }));
      formattedData.sort((a: any, b: any) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
      setTickets(formattedData);

      if (formattedData.length > 0) {
        setPurchaseStartDate(formattedData[0].purchaseDate);
        setPurchaseEndDate(formattedData[formattedData.length - 1].purchaseDate);
        setAbsolutePurchaseStartDate(formattedData[0].purchaseDate);
        setAbsolutePurchaseEndDate(formattedData[formattedData.length - 1].purchaseDate);
        formattedData.sort((a: any, b: any) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
        setEventStartDate(formattedData[0].eventDate);
        setEventEndDate(formattedData[formattedData.length - 1].eventDate);
        setAbsoluteEventStartDate(formattedData[0].eventDate);
        setAbsoluteEventEndDate(formattedData[formattedData.length - 1].eventDate);
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
      const response = await getEventTicketsByEventId(event.id);
      const formattedData: FormattedTicket[] = response.data.map((ticket: EventTicketResponse) => ({
        ...ticket,
        purchaseDate: dayjs(ticket.eventTicketTransaction?.purchaseDate).format('YYYY-MM-DD'),
        eventDate: dayjs(ticket.eventTicketTransaction?.eventDate).format('YYYY-MM-DD'),
      }));

      const filteredData = formattedData.filter((ticket) => {
        const ticketPurchaseDate = dayjs(ticket.purchaseDate);
        const ticketEventDate = dayjs(ticket.eventDate);
        return (
          ticketPurchaseDate.isAfter(dayjs(purchaseStartDate).subtract(1, 'day')) &&
          ticketPurchaseDate.isBefore(dayjs(purchaseEndDate).add(1, 'day')) &&
          ticketEventDate.isAfter(dayjs(eventStartDate).subtract(1, 'day')) &&
          ticketEventDate.isBefore(dayjs(eventEndDate).add(1, 'day'))
        );
      });

      filteredData.sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
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

  const handleEventDateChange = (dates: any, dateStrings: [string, string]) => {
    setEventStartDate(dayjs(dateStrings[0]).format('YYYY-MM-DD'));
    setEventEndDate(dayjs(dateStrings[1]).format('YYYY-MM-DD'));
  };

  const resetPurchaseDate = async () => {
    setPurchaseStartDate(absolutePurchaseStartDate);
    setPurchaseEndDate(absolutePurchaseEndDate);
  };

  const resetEventDate = async () => {
    setEventStartDate(absoluteEventStartDate);
    setEventEndDate(absoluteEventEndDate);
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchString = `
        ${ticket.id}
        ${ticket.eventTicketListing?.nationality}
        ${ticket.eventTicketListing?.category}
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
      title: 'Nationality',
      dataIndex: ['eventTicketListing', 'nationality'],
      key: 'nationality',
      render: (nationality: EventTicketNationalityEnum) => nationality.toString(),
      filters: Object.values(EventTicketNationalityEnum).map((value) => ({
        text: value,
        value: value,
      })),
      onFilter: (value, record) => record.eventTicketListing?.nationality === value,
    },
    {
      title: 'Category',
      dataIndex: ['eventTicketListing', 'category'],
      key: 'category',
      render: (category: EventTicketCategoryEnum) => category.toString(),
      filters: Object.values(EventTicketCategoryEnum).map((value) => ({
        text: value,
        value: value,
      })),
      onFilter: (value, record) => record.eventTicketListing?.category === value,
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
      {purchaseStartDate && purchaseEndDate && eventStartDate && eventEndDate ? (
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
                value={[dayjs(purchaseStartDate), dayjs(purchaseEndDate)]}
                disabledDate={(current) => {
                  // Convert to start of day to avoid timezone issues
                  const currentDate = current.startOf('day');
                  const eventEnd = dayjs(event?.endDate).startOf('day');

                  // Disable dates after event end date
                  return currentDate.isAfter(eventEnd);
                }}
              />
              <Button onClick={resetPurchaseDate} className="ml-2">Reset</Button>
            </div>
          </Flex>
          <Flex justify="flex-end" align="center" className="mb-4">
            <div className="flex items-center">
              <Text className="mr-2">Event Date: </Text>
              <RangePicker
                onChange={handleEventDateChange}
                value={[dayjs(eventStartDate), dayjs(eventEndDate)]}
                disabledDate={(current) => {
                  // Convert to start of day to avoid timezone issues
                  const currentDate = current.startOf('day');
                  const eventStart = dayjs(event?.startDate).startOf('day');
                  const eventEnd = dayjs(event?.endDate).startOf('day');
                  
                  // Disable dates outside the event range
                  return currentDate.isBefore(eventStart) || currentDate.isAfter(eventEnd);
                }}
              />
              <Button onClick={resetEventDate} className="ml-2">Reset</Button>
            </div>
          </Flex>
        </>
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
