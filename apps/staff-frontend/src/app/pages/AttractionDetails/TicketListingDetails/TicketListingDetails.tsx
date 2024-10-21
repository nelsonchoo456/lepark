import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Typography, Tag, message, Button, Input, Select, Modal, DatePicker, Empty, Tabs, Row, Col } from 'antd';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import {
  getAttractionTicketListingById,
  updateAttractionTicketListingDetails,
  getAttractionById,
  UpdateAttractionTicketListingData,
  getAttractionTicketListingsByAttractionId,
  getAttractionTicketsByListingId,
  getAttractionTicketTransactionById,
} from '@lepark/data-access';
import {
  AttractionTicketListingResponse,
  AttractionResponse,
  AttractionTicketCategoryEnum,
  AttractionTicketNationalityEnum,
} from '@lepark/data-access';
import { RiEdit2Line, RiArrowLeftLine } from 'react-icons/ri';
import { StaffType, StaffResponse } from '@lepark/data-access';
import PageHeader2 from '../../../components/main/PageHeader2';
import { useRestrictAttractionTicketListing } from '../../../hooks/Attractions/useRestrictAttractionTicketListing';
import TextArea from 'antd/es/input/TextArea';
import moment from 'moment';
import GraphContainer from '../components/GraphContainer';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import TicketListingTicketSalesTable from './TicketListingTicketSalesTable';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Text } = Typography;

const TicketListingDetails: React.FC = () => {
  const { ticketListingId } = useParams<{ ticketListingId: string }>();
  const { ticketListing, attraction, loading, refreshTicketListing } = useRestrictAttractionTicketListing(ticketListingId);
  const [editedTicketListing, setEditedTicketListing] = useState<AttractionTicketListingResponse | null>(null);
  const [inEditMode, setInEditMode] = useState(false);
  const [promptModalVisible, setPromptModalVisible] = useState(false);
  const [existingActiveListing, setExistingActiveListing] = useState<AttractionTicketListingResponse | null>(null);
  const [ticketSalesData, setTicketSalesData] = useState<any>(null);
  const [purchaseDateRange, setPurchaseDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [attractionDateRange, setAttractionDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [ticketData, setTicketData] = useState<any[]>([]);
  const [attractionDateSalesData, setAttractionDateSalesData] = useState<any>(null);
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
    if (purchaseDateRange && attractionDateRange) {
      fetchTicketSalesData();
      fetchAttractionDateSalesData();
    }
  }, [purchaseDateRange, attractionDateRange]);

  const fetchInitialData = async () => {
    try {
      const response = await getAttractionTicketsByListingId(ticketListingId as string);
      const tickets = response.data;

      const ticketData = await Promise.all(
        tickets.map(async (ticket) => {
          const transactionResponse = await getAttractionTicketTransactionById(ticket.attractionTicketTransactionId);
          return {
            ...ticket,
            purchaseDate: dayjs(transactionResponse.data.purchaseDate),
            attractionDate: dayjs(transactionResponse.data.attractionDate),
          };
        })
      );

      ticketData.sort((a: any, b: any) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
      setTicketData(ticketData);

      if (ticketData.length > 0) {
        setPurchaseDateRange([ticketData[0].purchaseDate, ticketData[ticketData.length - 1].purchaseDate]);
        setAbsolutePurchaseStartDateRange([ticketData[0].purchaseDate, ticketData[ticketData.length - 1].purchaseDate]);
        ticketData.sort((a: any, b: any) => new Date(a.attractionDate).getTime() - new Date(b.attractionDate).getTime());
        setAttractionDateRange([ticketData[0].attractionDate, ticketData[ticketData.length - 1].attractionDate]);
        setAbsoluteVisitStartDateRange([ticketData[0].attractionDate, ticketData[ticketData.length - 1].attractionDate]);
      }

      fetchTicketSalesData();
      fetchAttractionDateSalesData();
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchTicketSalesData = async () => {
    if (!purchaseDateRange) return;
    try {
      const response = await getAttractionTicketsByListingId(ticketListingId as string);
      const tickets = response.data;

      const ticketData = await Promise.all(
        tickets.map(async (ticket) => {
          const transactionResponse = await getAttractionTicketTransactionById(ticket.attractionTicketTransactionId);
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

  const fetchAttractionDateSalesData = async () => {
    if (!attractionDateRange) return;
    try {
      const response = await getAttractionTicketsByListingId(ticketListingId as string);
      const tickets = response.data;

      const ticketData = await Promise.all(
        tickets.map(async (ticket) => {
          const transactionResponse = await getAttractionTicketTransactionById(ticket.attractionTicketTransactionId);
          return {
            ...ticket,
            attractionDate: transactionResponse.data.attractionDate,
          };
        }),
      );

      const filteredTickets = ticketData.filter((ticket) => {
        const attractionDate = dayjs(ticket.attractionDate);
        return attractionDate.isBetween(attractionDateRange[0], attractionDateRange[1], 'day', '[]');
      });

      const groupedData = filteredTickets.reduce((acc, ticket) => {
        const date = dayjs(ticket.attractionDate).format('YYYY-MM-DD');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const labels = Object.keys(groupedData).sort();
      const data = labels.map((date) => groupedData[date]);

      setAttractionDateSalesData({
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
      console.error('Error fetching attraction date sales data:', error);
    }
  };

  const handlePurchaseDateRangeChange = (dates: any) => {
    setPurchaseDateRange(dates);
  };

  const handleAttractionDateRangeChange = (dates: any) => {
    setAttractionDateRange(dates);
  };

  const resetPurchaseDateRange = async () => {
    setPurchaseDateRange(absolutePurchaseStartDateRange);
  };

  const resetVisitDateRange = async () => {
    setAttractionDateRange(absoluteVisitStartDateRange);
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
    if (!editedTicketListing || !attraction) return;

    try {
      const response = await getAttractionTicketListingsByAttractionId(attraction.id);
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
      const updatedTicketListingData: UpdateAttractionTicketListingData = {
        category: ticketListing?.category,
        nationality: ticketListing?.nationality,
        description: editedTicketListing?.description,
        price: parseFloat(editedTicketListing?.price.toString() || '0'),
        isActive: editedTicketListing?.isActive,
        attractionId: ticketListing?.attractionId,
      };

      if (!ticketListingId) {
        message.error('No ticket listing ID provided.');
        return;
      }
      const response = await updateAttractionTicketListingDetails(ticketListingId, updatedTicketListingData);
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
        await updateAttractionTicketListingDetails(existingActiveListing.id, {
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

  const getDescriptionItems = () => [
    {
      key: 'attractionTitle',
      label: 'Attraction',
      children: attraction?.title || 'Loading...',
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
        <TextArea
          value={editedTicketListing?.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          autoSize={{ minRows: 3, maxRows: 5 }}
        />
      ) : (
        <div style={{ whiteSpace: 'pre-wrap' }}>{ticketListing?.description}</div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      children: inEditMode ? (
        <div className="flex items-center">
          <span className="mr-2">$</span>
          <Input
            type="number"
            value={editedTicketListing?.price}
            onChange={(e) => {
              const value = e.target.value;
              const regex = /^(\d+(\.\d{0,2})?)?$/;
              if (regex.test(value)) {
                handleInputChange('price', value);
              } else {
                e.target.value = value.replace(/[^\d.]/g, '');
                const parts = e.target.value.split('.');
                if (parts[1] && parts[1].length > 2) {
                  parts[1] = parts[1].slice(0, 2);
                }
                const newValue = parts.join('.');
                handleInputChange('price', newValue);
              }
            }}
            step="0.01"
            min="0"
            style={{ width: '100%' }}
          />
        </div>
      ) : (
        `$${parseFloat(ticketListing?.price.toString() || '0').toFixed(2)}`
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

  const breadcrumbItems = [
    {
      title: 'Attraction Management',
      pathKey: '/attraction',
      isMain: true,
    },
    {
      title: attraction?.title || 'Attraction Details',
      pathKey: `/attraction/${attraction?.id}?tab=tickets`,
    },
    {
      title: 'Ticket Listing Details',
      pathKey: `/attraction/${attraction?.id}/ticketlisting/${ticketListing?.id}`,
      isCurrent: true,
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
                    <Text className="mr-2 pt-1">Visit Date: </Text>
                    {attractionDateRange && (
                      <RangePicker
                        value={attractionDateRange}
                        onChange={handleAttractionDateRangeChange}
                        style={{ marginBottom: '20px' }}
                      />
                    )}
                    <Button className='ml-2' onClick={resetVisitDateRange}>Reset</Button>
                  </div>
                  {attractionDateSalesData && attractionDateSalesData.datasets[0].data.length > 0 ? (
                    <GraphContainer
                      title="Expected Visits Over Time"
                      data={attractionDateSalesData}
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
                              text: 'Visit Date',
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
