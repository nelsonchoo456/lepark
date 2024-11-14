import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Spin, message, Checkbox, Typography, Button } from 'antd';
import {
  getEventTicketsByEventId,
  EventTicketResponse,
  EventTicketCategoryEnum,
  EventTicketNationalityEnum,
  getEventById,
  EventResponse,
} from '@lepark/data-access';
import GraphContainer from './GraphContainter';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface DashboardTabProps {
  eventId: string;
}

interface EnhancedEventTicketResponse extends EventTicketResponse {
  purchaseDate: dayjs.Dayjs;
  eventDate: dayjs.Dayjs;
}

const EventDashboardTab: React.FC<DashboardTabProps> = ({ eventId }) => {
  const [loading, setLoading] = useState(false);
  const [ticketsData, setTicketsData] = useState<EnhancedEventTicketResponse[]>([]);
  const [purchaseDateRange, setPurchaseDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [eventDateRange, setEventDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
  const [absolutePurchaseStartDateRange, setAbsolutePurchaseStartDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [absoluteEventStartDateRange, setAbsoluteEventStartDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [event, setEvent] = useState<EventResponse | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const eventResponse = await getEventById(eventId);
      if (eventResponse.data) {
        setEvent(eventResponse.data);
      }
      const response = await getEventTicketsByEventId(eventId);
      const formattedData = response.data.map((ticket: EventTicketResponse) => ({
        ...ticket,
        purchaseDate: dayjs(ticket.eventTicketTransaction?.purchaseDate),
        eventDate: dayjs(ticket.eventTicketTransaction?.eventDate),
      }));
      formattedData.sort(
        (a: EnhancedEventTicketResponse, b: EnhancedEventTicketResponse) => a.purchaseDate.valueOf() - b.purchaseDate.valueOf(),
      );
      setTicketsData(formattedData);

      if (formattedData.length > 0) {
        setPurchaseDateRange([formattedData[0].purchaseDate, formattedData[formattedData.length - 1].purchaseDate]);
        setAbsolutePurchaseStartDateRange([formattedData[0].purchaseDate, formattedData[formattedData.length - 1].purchaseDate]);
        formattedData.sort(
          (a: EnhancedEventTicketResponse, b: EnhancedEventTicketResponse) => a.eventDate.valueOf() - b.eventDate.valueOf(),
        );
        setEventDateRange([formattedData[0].eventDate, formattedData[formattedData.length - 1].eventDate]);
        setAbsoluteEventStartDateRange([formattedData[0].eventDate, formattedData[formattedData.length - 1].eventDate]);
      }
    } catch (error) {
      message.error('Error fetching initial tickets data.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseDateChange = (dates: any) => {
    setPurchaseDateRange(dates);
  };

  const handleEventDateChange = (dates: any) => {
    setEventDateRange(dates);
  };

  const resetPurchaseDateRange = async () => {
    setPurchaseDateRange(absolutePurchaseStartDateRange);
  };

  const resetEventDateRange = async () => {
    setEventDateRange(absoluteEventStartDateRange);
  };

  const prepareTimeSeriesData = (dateRange: [dayjs.Dayjs, dayjs.Dayjs], dateField: 'purchaseDate' | 'eventDate') => {
    const dailyCounts: { [key: string]: { [category: string]: number } } = {};

    const allDates = [];
    let currentDate = dateRange[0];
    while (currentDate.isBefore(dateRange[1]) || currentDate.isSame(dateRange[1], 'day')) {
      const dateStr = currentDate.format('YYYY-MM-DD');
      allDates.push(dateStr);
      dailyCounts[dateStr] = {
        All: 0,
        Local: 0,
        Standard: 0,
        Adult: 0,
        Child: 0,
        Senior: 0,
        Student: 0,
      };
      currentDate = currentDate.add(1, 'day');
    }

    ticketsData.forEach((ticket) => {
      const date = ticket[dateField].format('YYYY-MM-DD');
      if (dailyCounts.hasOwnProperty(date)) {
        dailyCounts[date].All += 1;

        const nationality = ticket.eventTicketListing?.nationality || 'Standard';
        if (nationality === EventTicketNationalityEnum.LOCAL) {
          dailyCounts[date].Local += 1;
        } else {
          dailyCounts[date].Standard += 1;
        }

        const category = ticket.eventTicketListing?.category;
        if (category === EventTicketCategoryEnum.ADULT) {
          dailyCounts[date].Adult += 1;
        } else if (category === EventTicketCategoryEnum.CHILD) {
          dailyCounts[date].Child += 1;
        } else if (category === EventTicketCategoryEnum.STUDENT) {
          dailyCounts[date].Student += 1;
        } else {
          dailyCounts[date].Senior += 1;
        }
      }
    });

    return allDates.map((date) => ({
      date,
      ...dailyCounts[date],
    }));
  };

  const prepareCategoryData = () => {
    const categoryCounts = {
      [EventTicketCategoryEnum.ADULT]: 0,
      [EventTicketCategoryEnum.CHILD]: 0,
      [EventTicketCategoryEnum.SENIOR]: 0,
      [EventTicketCategoryEnum.STUDENT]: 0,
    };

    ticketsData.forEach((ticket) => {
      const category = ticket.eventTicketListing?.category;
      if (category && category in categoryCounts) {
        categoryCounts[category as keyof typeof categoryCounts] += 1;
      }
    });

    return Object.entries(categoryCounts).map(([key, value]) => ({ key, value }));
  };

  const prepareNationalityData = () => {
    const nationalityCounts = {
      Local: 0,
      Standard: 0,
    };

    ticketsData.forEach((ticket) => {
      const nationality = ticket.eventTicketListing?.nationality || 'Unknown';
      if (nationality === EventTicketNationalityEnum.LOCAL) {
        nationalityCounts.Local += 1;
      } else {
        nationalityCounts.Standard += 1;
      }
    });

    return Object.entries(nationalityCounts).map(([key, value]) => ({ key, value }));
  };

  const categoryData = prepareCategoryData();
  const nationalityData = prepareNationalityData();
  const purchaseTimeSeriesData = purchaseDateRange ? prepareTimeSeriesData(purchaseDateRange, 'purchaseDate') : [];
  const eventTimeSeriesData = eventDateRange ? prepareTimeSeriesData(eventDateRange, 'eventDate') : [];

  const categoryColors = ['#e65100', '#ff9800', '#ffc107', '#ffe082'];
  const nationalityColors = ['#0d47a1', '#2196f3'];

  const colors = {
    All: '#a3d4c7', // A distinct green for 'All'
    Local: '#0d47a1', // Dark blue
    Standard: '#2196f3', // Light blue
    Adult: '#e65100', // Dark orange
    Child: '#ff9800', // Orange
    Senior: '#ffc107', // Amber
    Student: '#ffe082', // Light amber
  };

  const categoryChartData = {
    labels: categoryData.map((entry) => entry.key),
    datasets: [
      {
        data: categoryData.map((entry) => entry.value),
        backgroundColor: categoryColors,
      },
    ],
  };

  const nationalityChartData = {
    labels: nationalityData.map((entry) => entry.key),
    datasets: [
      {
        data: nationalityData.map((entry) => entry.value),
        backgroundColor: nationalityColors,
      },
    ],
  };

  const createTimeSeriesChartData = (data: any[]) => ({
    labels: data.map((entry) => entry.date),
    datasets: selectedCategories.map((category) => ({
      label: category,
      data: data.map((entry) => entry[category] || 0),
      borderColor: colors[category as keyof typeof colors],
      backgroundColor: colors[category as keyof typeof colors],
      fill: false,
    })),
  });

  const purchaseTimeSeriesChartData = createTimeSeriesChartData(purchaseTimeSeriesData);
  const eventTimeSeriesChartData = createTimeSeriesChartData(eventTimeSeriesData);

  const handleCategoryChange = (checkedValues: string[]) => {
    setSelectedCategories(checkedValues.length > 0 ? checkedValues : ['All']);
  };

  return (
    <Card>
      {loading ? (
        <Spin />
      ) : (
        <>
          <Row gutter={[24, 16]} style={{ justifyContent: 'center', width: '100%', marginBottom: '20px' }}>
            <Col span={24}>
              <Checkbox.Group
                options={['All', 'Local', 'Standard', 'Adult', 'Child', 'Senior', 'Student']}
                value={selectedCategories}
                onChange={handleCategoryChange}
              />
            </Col>
          </Row>
          <Row gutter={[24, 16]} style={{ justifyContent: 'center', width: '100%' }}>
            <Col xs={24} lg={12}>
              <div className="flex justify-start">
                <Text className="mr-2 pt-1">Purchase Date:</Text>
                <RangePicker
                  value={purchaseDateRange}
                  onChange={handlePurchaseDateChange}
                  style={{ marginBottom: '10px' }}
                  disabledDate={(current) => {
                    // Convert to start of day to avoid timezone issues
                    const currentDate = current.startOf('day');
                    const eventEndDate = dayjs(event?.endDate).startOf('day');

                    // Disable dates after event end date
                    return currentDate.isAfter(eventEndDate);
                  }}
                />
                <Button className="ml-2" onClick={resetPurchaseDateRange}>
                  Reset
                </Button>
              </div>
              {purchaseDateRange && (
                <GraphContainer
                  title="Tickets Sold Over Time (Purchase Date)"
                  data={purchaseTimeSeriesChartData}
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
              )}
            </Col>
            <Col xs={24} lg={12}>
              <div className="flex justify-start">
                <Text className="mr-2 pt-1">Event Date:</Text>
                <RangePicker
                  value={eventDateRange}
                  onChange={handleEventDateChange}
                  style={{ marginBottom: '10px' }}
                  disabledDate={(current) => {
                    // Convert to start of day to avoid timezone issues
                    const currentDate = current.startOf('day');
                    const eventStart = dayjs(event?.startDate).startOf('day');
                    const eventEnd = dayjs(event?.endDate).startOf('day');

                    // Disable dates outside the event range
                    return currentDate.isBefore(eventStart) || currentDate.isAfter(eventEnd);
                  }}
                />
                <Button className="ml-2" onClick={resetEventDateRange}>
                  Reset
                </Button>
              </div>
              {eventDateRange && (
                <GraphContainer
                  title="Visits Over Time"
                  data={eventTimeSeriesChartData}
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
              )}
            </Col>
          </Row>
          <Row gutter={[24, 0]} style={{ justifyContent: 'center', width: '100%', marginTop: '16px' }}>
            <Col xs={24} lg={12}>
              <GraphContainer
                title="Tickets Sold by Nationality"
                data={nationalityChartData}
                type="bar"
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
                        text: 'Nationality',
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </Col>
            <Col xs={24} lg={12}>
              <GraphContainer
                title="Tickets Sold by Category"
                data={categoryChartData}
                type="bar"
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
                        text: 'Category',
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </Col>
          </Row>
        </>
      )}
    </Card>
  );
};

export default EventDashboardTab;
