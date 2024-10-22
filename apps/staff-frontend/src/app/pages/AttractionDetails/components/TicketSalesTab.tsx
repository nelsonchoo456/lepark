import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, DatePicker, Spin, Tag, Flex, Input, message, Typography, Button } from 'antd';
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

interface FormattedTicket extends AttractionTicketResponse {
  purchaseDate: string;
  attractionDate: string;
}

const TicketSalesTab: React.FC<TicketSalesTabProps> = ({ attraction }) => {
  const [tickets, setTickets] = useState<FormattedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseStartDate, setPurchaseStartDate] = useState<string | null>(null);
  const [purchaseEndDate, setPurchaseEndDate] = useState<string | null>(null);
  const [attractionStartDate, setAttractionStartDate] = useState<string | null>(null);
  const [attractionEndDate, setAttractionEndDate] = useState<string | null>(null);
  const [absolutePurchaseStartDate, setAbsolutePurchaseStartDate] = useState<string | null>(null);
  const [absolutePurchaseEndDate, setAbsolutePurchaseEndDate] = useState<string | null>(null);
  const [absoluteAttractionStartDate, setAbsoluteAttractionStartDate] = useState<string | null>(null);
  const [absoluteAttractionEndDate, setAbsoluteAttractionEndDate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (purchaseStartDate && purchaseEndDate && attractionStartDate && attractionEndDate) {
      fetchTicketsData();
    }
  }, [purchaseStartDate, purchaseEndDate, attractionStartDate, attractionEndDate]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const response = await getAttractionTicketsByAttractionId(attraction.id);
      const formattedData = response.data.map((ticket: AttractionTicketResponse) => ({
        ...ticket,
        purchaseDate: dayjs(ticket.attractionTicketTransaction?.purchaseDate).format('YYYY-MM-DD'),
        attractionDate: dayjs(ticket.attractionTicketTransaction?.attractionDate).format('YYYY-MM-DD'),
      }));

      formattedData.sort((a: any, b: any) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
      setTickets(formattedData);

      if (formattedData.length > 0) {
        setPurchaseStartDate(formattedData[0].purchaseDate);
        setPurchaseEndDate(formattedData[formattedData.length - 1].purchaseDate);
        setAbsolutePurchaseStartDate(formattedData[0].purchaseDate);  
        setAbsolutePurchaseEndDate(formattedData[formattedData.length - 1].purchaseDate);
        formattedData.sort((a: any, b: any) => new Date(a.attractionDate).getTime() - new Date(b.attractionDate).getTime());
        setAttractionStartDate(formattedData[0].attractionDate);
        setAttractionEndDate(formattedData[formattedData.length - 1].attractionDate);
        setAbsoluteAttractionStartDate(formattedData[0].attractionDate);
        setAbsoluteAttractionEndDate(formattedData[formattedData.length - 1].attractionDate);
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
      const response = await getAttractionTicketsByAttractionId(attraction.id);
      const formattedData: FormattedTicket[] = response.data.map((ticket: AttractionTicketResponse) => ({
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
          ticketAttractionDate.isAfter(dayjs(attractionStartDate).subtract(1, 'day')) &&
          ticketAttractionDate.isBefore(dayjs(attractionEndDate).add(1, 'day'))
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

  const handleAttractionDateChange = (dates: any, dateStrings: [string, string]) => {
    setAttractionStartDate(dayjs(dateStrings[0]).format('YYYY-MM-DD'));
    setAttractionEndDate(dayjs(dateStrings[1]).format('YYYY-MM-DD'));
  };

  const resetPurchaseDate = async () => {
    setPurchaseStartDate(absolutePurchaseStartDate);
    setPurchaseEndDate(absolutePurchaseEndDate);
  };

  const resetAttractionDate = async () => {
    setAttractionStartDate(absoluteAttractionStartDate);
    setAttractionEndDate(absoluteAttractionEndDate);
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchString = `
        ${ticket.id}
        ${ticket.attractionTicketListing?.nationality}
        ${ticket.attractionTicketListing?.category}
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
      {purchaseStartDate && purchaseEndDate && attractionStartDate && attractionEndDate ? (
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
              />
              <Button onClick={resetPurchaseDate} className="ml-2">Reset</Button>
            </div>
          </Flex>
          <Flex justify="flex-end" align="center" className="mb-4">
            <div className="flex items-center">
              <Text className="mr-2">Visit Date: </Text>
              <RangePicker
                onChange={handleAttractionDateChange}
                value={[dayjs(attractionStartDate), dayjs(attractionEndDate)]}
              />
              <Button onClick={resetAttractionDate} className="ml-2">Reset</Button>
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
