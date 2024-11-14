import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Input,
  InputNumber,
  Switch,
  message,
  Modal,
  Tabs,
  DatePicker,
  Empty,
  Col,
  Row,
  Typography,
  Tag,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { EventTicketListingResponse, EventResponse, StaffResponse, StaffType, UpdateEventTicketListingData } from '@lepark/data-access';
import {
  getEventTicketsByListingId,
  getEventTicketTransactionById,
  getEventTicketListingsByEventId,
  updateEventTicketListingDetails,
} from '@lepark/data-access';
import { useRestrictEventTicketListing } from '../../../hooks/Events/useRestrictEventTicketListing';
import GraphContainer from '../components/GraphContainter';
import PageHeader2 from '../../../components/main/PageHeader2';
import { RiEdit2Line } from 'react-icons/ri';
import { RiArrowLeftLine } from 'react-icons/ri';
import TicketListingTicketSalesTable from './TicketListingTicketSalesTable';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Text } = Typography;
const TicketListingDetails: React.FC = () => {
  const { ticketListingId } = useParams<{ ticketListingId: string }>();
  const { ticketListing, event, loading, refreshTicketListing } = useRestrictEventTicketListing(ticketListingId);
  const [editedTicketListing, setEditedTicketListing] = useState<EventTicketListingResponse | null>(null);
  const [inEditMode, setInEditMode] = useState(false);
  const [promptModalVisible, setPromptModalVisible] = useState(false);
  const [existingActiveListing, setExistingActiveListing] = useState<EventTicketListingResponse | null>(null);
  const [ticketSalesData, setTicketSalesData] = useState<any>(null);
  const [purchaseDateRange, setPurchaseDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [eventDateRange, setEventDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [ticketData, setTicketData] = useState<any[]>([]);
  const [eventDateSalesData, setEventDateSalesData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('1');
  const [absolutePurchaseStartDateRange, setAbsolutePurchaseStartDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [absoluteVisitStartDateRange, setAbsoluteVisitStartDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const { user } = useAuth<StaffResponse>();

  const canEdit = user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER;

  useEffect(() => {
    if (!loading && ticketListing) {
      fetchInitialData();
      setEditedTicketListing(ticketListing);
    }
  }, [loading, ticketListing]);

  useEffect(() => {
    if (purchaseDateRange && eventDateRange) {
      fetchTicketSalesData();
      fetchEventDateSalesData();
    }
  }, [purchaseDateRange, eventDateRange]);

  const fetchInitialData = async () => {
    try {
      const response = await getEventTicketsByListingId(ticketListingId as string);
      const tickets = response.data;

      const ticketData = await Promise.all(
        tickets.map(async (ticket) => {
          const transactionResponse = await getEventTicketTransactionById(ticket.eventTicketTransactionId);
          return {
            ...ticket,
            purchaseDate: dayjs(transactionResponse.data.purchaseDate),
            eventDate: dayjs(transactionResponse.data.eventDate),
          };
        })
      );

      ticketData.sort((a: any, b: any) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
      setTicketData(ticketData);

      if (ticketData.length > 0) {
        setPurchaseDateRange([ticketData[0].purchaseDate, ticketData[ticketData.length - 1].purchaseDate]);
        setAbsolutePurchaseStartDateRange([ticketData[0].purchaseDate, ticketData[ticketData.length - 1].purchaseDate]);
        ticketData.sort((a: any, b: any) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
        setEventDateRange([ticketData[0].eventDate, ticketData[ticketData.length - 1].eventDate]);
        setAbsoluteVisitStartDateRange([ticketData[0].eventDate, ticketData[ticketData.length - 1].eventDate]);
      }

      fetchTicketSalesData();
      fetchEventDateSalesData();
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchTicketSalesData = async () => {
    if (!purchaseDateRange) return;
    try {
      const response = await getEventTicketsByListingId(ticketListingId as string);
      const tickets = response.data;

      const ticketData = await Promise.all(
        tickets.map(async (ticket) => {
          const transactionResponse = await getEventTicketTransactionById(ticket.eventTicketTransactionId);
          return {
            ...ticket,
            purchaseDate: transactionResponse.data.purchaseDate,
          };
        }),
      );

      const filteredTickets = ticketData.filter((ticket) => {
        const ticketDate = dayjs(ticket.purchaseDate);
        return ticketDate.isBetween(purchaseDateRange[0], purchaseDateRange[1], 'day', '[]');
      });

      const groupedData = filteredTickets.reduce((acc, ticket) => {
        const date = dayjs(ticket.purchaseDate).format('YYYY-MM-DD');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const labels = Object.keys(groupedData).sort();
      const data = labels.map((date) => groupedData[date]);

      setTicketSalesData({
        labels,
        datasets: [
          {
            label: 'Tickets Sold',
            data,
            fill: false,
            borderColor: '#a3d4c7',
            backgroundColor: '#a3d4c7',
            tension: 0.1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching ticket sales data:', error);
    }
  };

  const fetchEventDateSalesData = async () => {
    if (!eventDateRange) return;
    try {
      const response = await getEventTicketsByListingId(ticketListingId as string);
      const tickets = response.data;

      const ticketData = await Promise.all(
        tickets.map(async (ticket) => {
          const transactionResponse = await getEventTicketTransactionById(ticket.eventTicketTransactionId);
          return {
            ...ticket,
            eventDate: transactionResponse.data.eventDate,
          };
        }),
      );

      const filteredTickets = ticketData.filter((ticket) => {
        const eventDate = dayjs(ticket.eventDate);
        return eventDate.isBetween(eventDateRange[0], eventDateRange[1], 'day', '[]');
      });

      const groupedData = filteredTickets.reduce((acc, ticket) => {
        const date = dayjs(ticket.eventDate).format('YYYY-MM-DD');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const labels = Object.keys(groupedData).sort();
      const data = labels.map((date) => groupedData[date]);

      setEventDateSalesData({
        labels,
        datasets: [
          {
            label: 'Tickets Sold',
            data,
            fill: false,
            borderColor: '#a3d4c7',
            backgroundColor: '#a3d4c7',
            tension: 0.1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching event date sales data:', error);
    }
  };

  const handlePurchaseDateRangeChange = (dates: any) => {
    setPurchaseDateRange(dates);
  };

  const handleEventDateRangeChange = (dates: any) => {
    setEventDateRange(dates);
  };

  const resetPurchaseDateRange = async () => {
    setPurchaseDateRange(absolutePurchaseStartDateRange);
  };

  const resetVisitDateRange = async () => {
    setEventDateRange(absoluteVisitStartDateRange);
  };

  const toggleEditMode = () => {
    if (inEditMode && ticketListing) {
      setEditedTicketListing(ticketListing);
    }
    setInEditMode(!inEditMode);
  };

  const handleInputChange = (key: string, value: any) => {
    setEditedTicketListing((prev) => {
      if (prev === null) return null;

      // Handle price input
      if (key === 'price') {
        const regex = /^\d*\.?\d{0,2}$/;
        if (regex.test(value) || value === '') {
          return {
            ...prev,
            [key]: value,
          };
        }
        return prev;
      }

      // Handle all other inputs, including description
      return {
        ...prev,
        [key]: value,
      };
    });

    // Check for existing active listing when changing to active
    if (key === 'isActive' && value === true) {
      checkExistingActiveListing();
    }
  };

  const checkExistingActiveListing = async () => {
    if (!editedTicketListing || !event) return;

    try {
      const response = await getEventTicketListingsByEventId(event.id);
      const existingListing = response.data.find(
        (listing) =>
          listing.id !== editedTicketListing.id &&
          listing.category === editedTicketListing.category &&
          listing.nationality === editedTicketListing.nationality &&
          listing.isActive,
      );

      if (existingListing) {
        setExistingActiveListing(existingListing);
        setPromptModalVisible(true);
      }
    } catch (error) {
      console.error('Error checking existing active listings:', error);
    }
  };

  const validateInputs = () => {
    if (editedTicketListing === null) return false;
    const { category, nationality, description, isActive, price } = editedTicketListing;
    return category && nationality && description && isActive !== undefined && price !== undefined;
  };

  const handleSave = async () => {
    if (validateInputs()) {
      if (editedTicketListing?.isActive && existingActiveListing) {
        setPromptModalVisible(true);
        return;
      }
      await updateTicketListing();
    } else {
      message.warning('All fields are required.');
    }
  };

  const updateTicketListing = async () => {
    try {
      const updatedTicketListingData: UpdateEventTicketListingData = {
        category: ticketListing?.category,
        nationality: ticketListing?.nationality,
        description: editedTicketListing?.description,
        price: parseFloat(editedTicketListing?.price.toString() || '0'),
        isActive: editedTicketListing?.isActive,
        eventId: ticketListing?.eventId,
      };

      if (!ticketListingId) {
        message.error('No ticket listing ID provided.');
        return;
      }
      const response = await updateEventTicketListingDetails(ticketListingId, updatedTicketListingData);
      refreshTicketListing(response.data);
      setInEditMode(false);
      message.success('Ticket listing updated successfully!');
    } catch (error) {
      console.error(error);
      message.error('Failed to update ticket listing.');
    }
  };

  const handleMakeInactiveAndUpdate = async () => {
    if (existingActiveListing && editedTicketListing) {
      try {
        // Make the existing listing inactive
        await updateEventTicketListingDetails(existingActiveListing.id, {
          ...existingActiveListing,
          isActive: false,
        });

        // Update the current listing
        await updateTicketListing();

        setPromptModalVisible(false);
        setExistingActiveListing(null);
      } catch (error) {
        console.error('Error updating ticket listings:', error);
        message.error('Failed to update ticket listings');
      }
    }
  };

  const handleCancelPrompt = () => {
    setPromptModalVisible(false);
    setExistingActiveListing(null);
    setEditedTicketListing((prev) => (prev ? { ...prev, isActive: false } : null));
  };

  const breadcrumbItems = [
    {
      title: 'Event Management',
      pathKey: '/event',
      isMain: true,
    },
    {
      title: event?.title || 'Event Details',
      pathKey: `/event/${event?.id}?tab=tickets`,
    },
    {
      title: 'Ticket Listing Details',
      pathKey: `/event/${event?.id}/ticketlisting/${ticketListing?.id}`,
      isCurrent: true,
    },
  ];

  const getDescriptionItems = () => [
    {
      key: 'eventTitle',
      label: 'Event',
      children: event?.title || 'Loading...',
    },
    {
      key: 'category',
      label: 'Category',
      children: ticketListing?.category,
    },
    {
      key: 'nationality',
      label: 'Nationality',
      children: ticketListing?.nationality,
    },
    {
      key: 'description',
      label: 'Description',
      children: inEditMode ? (
        <Input.TextArea value={editedTicketListing?.description} onChange={(e) => handleInputChange('description', e.target.value)} />
      ) : (
        ticketListing?.description
      ),
    },
    {
      key: 'price',
      label: 'Price',
      children: inEditMode ? (
        <InputNumber
          value={editedTicketListing?.price}
          onChange={(value) => handleInputChange('price', value)}
          min={0}
          step={0.01}
          precision={2}
        />
      ) : (
        `$${ticketListing?.price.toFixed(2)}`
      ),
    },
    {
        key: 'isActive',
        label: 'Status',
        children: (
          <div style={{ minWidth: '100px' }}>
            {' '}
            {/* Add a minimum width */}
            {!inEditMode ? (
              <Tag color={ticketListing?.isActive ? 'green' : 'red'}>{ticketListing?.isActive ? 'Active' : 'Inactive'}</Tag>
            ) : (
              <Select
                value={editedTicketListing?.isActive}
                onChange={(value) => handleInputChange('isActive', value)}
                style={{ width: '100%' }}
              >
                <Select.Option value={true}>Active</Select.Option>
                <Select.Option value={false}>Inactive</Select.Option>
              </Select>
            )}
          </div>
        ),
      },
  ];

  const renderContent = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!ticketListing) {
      return (
        <ContentWrapperDark>
          <PageHeader2 breadcrumbItems={breadcrumbItems} />
          <Card>
            <div>No ticket listing found or an error occurred.</div>
          </Card>
        </ContentWrapperDark>
      );
    }

    return (
      <>
        <PageHeader2 breadcrumbItems={breadcrumbItems} />
        <Card>
          <Descriptions
            labelStyle={{ width: '30%' }}
            bordered
            column={1}
            size="middle"
            items={getDescriptionItems()}
            title={
              <div className="w-full flex justify-between">
                {!inEditMode ? (
                  <>
                    <div>Ticket Listing Details</div>
                    {canEdit && <Button icon={<RiEdit2Line className="text-lg" />} type="text" onClick={toggleEditMode} />}
                  </>
                ) : (
                  <>
                    <Button icon={<RiArrowLeftLine className="text-lg" />} type="text" onClick={toggleEditMode}>
                      Return
                    </Button>
                    <div className="text-secondary">Edit Ticket Listing</div>
                    <Button type="primary" onClick={handleSave}>
                      Save
                    </Button>
                  </>
                )}
              </div>
            }
          />
        </Card>
      </>
    );
  };

  return (
    <>
      <ContentWrapperDark>
        {renderContent()}
        <Card>
          <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
            <TabPane tab="Ticket Sales Over Time" key="1">
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <div className="flex justify-start">
                      <Text className="mr-2 pt-1">Purchase Date: </Text>
                      {purchaseDateRange && (
                        <RangePicker
                          value={purchaseDateRange}
                          onChange={handlePurchaseDateRangeChange}
                          style={{ marginBottom: '20px' }}
                          disabledDate={(current) => {
                            // Convert to start of day to avoid timezone issues
                            const currentDate = current.startOf('day');
                            const eventEnd = dayjs(event?.endDate).startOf('day');

                            // Disable dates after event end date
                            return currentDate.isAfter(eventEnd);
                          }}
                        />
                      )}
                      <Button className='ml-2' onClick={resetPurchaseDateRange}>Reset</Button>
                    </div>
                  {ticketSalesData && ticketSalesData.datasets[0].data.length > 0 ? (
                    <GraphContainer
                      title="Tickets Sold Over Time (Purchase Date)"
                      data={ticketSalesData}
                      type="line"
                      options={{
                        maintainAspectRatio: true,
                        responsive: true,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Number of Tickets',
                            },
                            ticks: {
                              stepSize: 1,
                              precision: 0,
                            },
                          },
                          x: {
                            title: {
                              display: true,
                              text: 'Purchase Date',
                            },
                            ticks: {
                              maxRotation: 45,
                              minRotation: 45,
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            display: true,
                            position: 'top',
                          },
                        },
                      }}
                    />
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No ticket sales data available for this ticket listing" />
                  )}
                </Col>
                <Col xs={24} lg={12}>
                    <div className="flex justify-start">
                      <Text className="mr-2 pt-1">Event Date: </Text>
                      {eventDateRange && (
                        <RangePicker
                          value={eventDateRange}
                          onChange={handleEventDateRangeChange}
                          style={{ marginBottom: '20px' }}
                          disabledDate={(current) => {
                            // Convert to start of day to avoid timezone issues
                            const currentDate = current.startOf('day');
                            const eventStart = dayjs(event?.startDate).startOf('day');
                            const eventEnd = dayjs(event?.endDate).startOf('day');
                            
                            // Disable dates outside the event range
                            return currentDate.isBefore(eventStart) || currentDate.isAfter(eventEnd);
                          }}
                        />
                      )}
                      <Button className='ml-2' onClick={resetVisitDateRange}>Reset</Button>
                    </div>
                  {eventDateSalesData && eventDateSalesData.datasets[0].data.length > 0 ? (
                    <GraphContainer
                      title="Expected Visits Over Time"
                      data={eventDateSalesData}
                      type="line"
                      options={{
                        maintainAspectRatio: true,
                        responsive: true,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Number of Visitors',
                            },
                            ticks: {
                              stepSize: 1,
                              precision: 0,
                            },
                          },
                          x: {
                            title: {
                              display: true,
                              text: 'Event Date',
                            },
                            ticks: {
                              maxRotation: 45,
                              minRotation: 45,
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            display: true,
                            position: 'top',
                          },
                        },
                      }}
                    />
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No visit date sales data available for this ticket listing" />
                  )}
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="Ticket Sales Table" key="2">
              <TicketListingTicketSalesTable ticketListingId={ticketListingId as string} />
            </TabPane>
          </Tabs>
        </Card>
      </ContentWrapperDark>
      <Modal
        title="Existing Active Listing"
        visible={promptModalVisible}
        onOk={handleMakeInactiveAndUpdate}
        onCancel={handleCancelPrompt}
        okText="Deactivate and Update"
        cancelText="Cancel"
      >
        <p>An active listing with the same category and nationality already exists.</p>
        <p>Do you want to deactivate the existing listing and update this one?</p>
      </Modal>
    </>
  );
};

export default TicketListingDetails;
