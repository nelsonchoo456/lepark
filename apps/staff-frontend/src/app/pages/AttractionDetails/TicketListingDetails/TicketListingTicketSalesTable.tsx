import React, { useState, useEffect, useMemo } from 'react';
import { Table, Spin, Tag, Input, message, Typography, DatePicker, Flex, Button } from 'antd';
import { FiSearch } from 'react-icons/fi';
import dayjs from 'dayjs';
import { AttractionTicketResponse, AttractionTicketStatusEnum, getAttractionTicketsByListingId } from '@lepark/data-access';
import { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface TicketListingTicketSalesTableProps {
  ticketListingId: string;
}

const TicketListingTicketSalesTable: React.FC<TicketListingTicketSalesTableProps> = ({ ticketListingId }) => {
  const [tickets, setTickets] = useState<AttractionTicketResponse[]>([]);
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

  useEffect(() => {
    fetchTickets();
  }, [ticketListingId]);

  useEffect(() => {
    if (purchaseStartDate && purchaseEndDate && visitStartDate && visitEndDate) {
      fetchFilteredTickets();
    }
  }, [purchaseStartDate, purchaseEndDate, visitStartDate, visitEndDate]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await getAttractionTicketsByListingId(ticketListingId);
      const formattedData = response.data.map((ticket: AttractionTicketResponse) => ({
        ...ticket,
        purchaseDate: dayjs(ticket.attractionTicketTransaction?.purchaseDate).format('YYYY-MM-DD'),
        attractionDate: dayjs(ticket.attractionTicketTransaction?.attractionDate).format('YYYY-MM-DD'),
      }));
      console.log(formattedData);
      const filteredData = formattedData.filter((ticket) => {
        const ticketPurchaseDate = dayjs(ticket.purchaseDate);
        const ticketAttractionDate = dayjs(ticket.attractionDate);
        const isPurchaseDateInRange =
          (!purchaseStartDate || ticketPurchaseDate.isAfter(dayjs(purchaseStartDate).subtract(1, 'day'))) &&
          (!purchaseEndDate || ticketPurchaseDate.isBefore(dayjs(purchaseEndDate).add(1, 'day')));
        const isVisitDateInRange =
          (!visitStartDate || ticketAttractionDate.isAfter(dayjs(visitStartDate).subtract(1, 'day'))) &&
          (!visitEndDate || ticketAttractionDate.isBefore(dayjs(visitEndDate).add(1, 'day')));
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
        formattedData.sort((a: any, b: any) => new Date(a.attractionDate).getTime() - new Date(b.attractionDate).getTime());
        if (!visitStartDate) {
          setVisitStartDate(formattedData[0].attractionDate);
          setAbsoluteVisitStartDate(formattedData[0].attractionDate);
        }
        if (!visitEndDate) {
          setVisitEndDate(formattedData[formattedData.length - 1].attractionDate);
          setAbsoluteVisitEndDate(formattedData[formattedData.length - 1].attractionDate);
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
      const response = await getAttractionTicketsByListingId(ticketListingId);
      const formattedData = response.data.map((ticket: AttractionTicketResponse) => ({
        ...ticket,
        purchaseDate: dayjs(ticket.attractionTicketTransaction?.purchaseDate).format('YYYY-MM-DD'),
        attractionDate: dayjs(ticket.attractionTicketTransaction?.attractionDate).format('YYYY-MM-DD'),
      }));

      // Filter the data based on the selected date ranges
      const filteredData = formattedData.filter((ticket) => {
        const ticketPurchaseDate = dayjs(ticket.purchaseDate);
        const ticketAttractionDate = dayjs(ticket.attractionDate);
        return (
          ticketPurchaseDate.isAfter(dayjs(purchaseStartDate).subtract(1, 'day')) &&
          ticketPurchaseDate.isBefore(dayjs(purchaseEndDate).add(1, 'day')) &&
          ticketAttractionDate.isAfter(dayjs(visitStartDate).subtract(1, 'day')) &&
          ticketAttractionDate.isBefore(dayjs(visitEndDate).add(1, 'day'))
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
      ${dayjs(ticket.attractionTicketTransaction?.purchaseDate).format('YYYY-MM-DD')}
      ${dayjs(ticket.attractionTicketTransaction?.attractionDate).format('YYYY-MM-DD')}
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
      title: 'Purchase Date',
      dataIndex: ['attractionTicketTransaction', 'purchaseDate'],
      key: 'purchaseDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) =>
        dayjs(a.attractionTicketTransaction?.purchaseDate).unix() - dayjs(b.attractionTicketTransaction?.purchaseDate).unix(),
    },
    {
      title: 'Visit Date',
      dataIndex: ['attractionTicketTransaction', 'attractionDate'],
      key: 'attractionDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
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
          <Button onClick={resetPurchaseDate} className="ml-2">
            Reset
          </Button>
        </div>
      </Flex>
      <Flex justify="flex-end" align="center" className="mb-4">
        <div className="flex items-center">
          <Text className="mr-2">Visit Date: </Text>
          <RangePicker
            onChange={handleVisitDateChange}
            value={[visitStartDate ? dayjs(visitStartDate) : null, visitEndDate ? dayjs(visitEndDate) : null]}
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
