import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Spin, message, Checkbox, Typography } from 'antd';
import moment from 'moment';
import {
  getAttractionTicketsByAttractionId,
  AttractionTicketResponse,
  AttractionTicketCategoryEnum,
  AttractionTicketNationalityEnum,
} from '@lepark/data-access';
import GraphContainer from './GraphContainer';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface DashboardTabProps {
  attractionId: string;
}

interface EnhancedAttractionTicketResponse extends AttractionTicketResponse {
  purchaseDate: dayjs.Dayjs;
  attractionDate: dayjs.Dayjs;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ attractionId }) => {
  const [loading, setLoading] = useState(false);
  const [ticketsData, setTicketsData] = useState<EnhancedAttractionTicketResponse[]>([]);
  const [purchaseDateRange, setPurchaseDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [attractionDateRange, setAttractionDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const response = await getAttractionTicketsByAttractionId(attractionId);
      const formattedData = response.data.map((ticket: AttractionTicketResponse) => ({
        ...ticket,
        purchaseDate: dayjs(ticket.attractionTicketTransaction?.purchaseDate),
        attractionDate: dayjs(ticket.attractionTicketTransaction?.attractionDate),
      }));
      formattedData.sort((a: EnhancedAttractionTicketResponse, b: EnhancedAttractionTicketResponse) => a.purchaseDate.valueOf() - b.purchaseDate.valueOf());
      setTicketsData(formattedData);

      if (formattedData.length > 0) {
        setPurchaseDateRange([formattedData[0].purchaseDate, formattedData[formattedData.length - 1].purchaseDate]);
        formattedData.sort((a: EnhancedAttractionTicketResponse, b: EnhancedAttractionTicketResponse) => a.attractionDate.valueOf() - b.attractionDate.valueOf());
        setAttractionDateRange([formattedData[0].attractionDate, formattedData[formattedData.length - 1].attractionDate]);
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

  const handleAttractionDateChange = (dates: any) => {
    setAttractionDateRange(dates);
  };

  const prepareTimeSeriesData = (dateRange: [dayjs.Dayjs, dayjs.Dayjs], dateField: 'purchaseDate' | 'attractionDate') => {
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
        
        const nationality = ticket.attractionTicketListing?.nationality || 'Standard';
        if (nationality === AttractionTicketNationalityEnum.LOCAL) {
          dailyCounts[date].Local += 1;
        } else {
          dailyCounts[date].Standard += 1;
        }
        
        const category = ticket.attractionTicketListing?.category;
        if (category === AttractionTicketCategoryEnum.ADULT) {
          dailyCounts[date].Adult += 1;
        } else if (category === AttractionTicketCategoryEnum.CHILD) {
          dailyCounts[date].Child += 1;
        } else if (category === AttractionTicketCategoryEnum.STUDENT) {
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

  const prepareNationalityData = () => {
    const nationalityCounts = Object.values(AttractionTicketNationalityEnum).reduce((acc, nationality) => {
      acc[nationality] = 0;
      return acc;
    }, {} as { [key: string]: number });

    ticketsData.forEach((ticket) => {
      const nationality = ticket.attractionTicketListing?.nationality || 'Unknown';
      nationalityCounts[nationality] = (nationalityCounts[nationality] || 0) + 1;
    });

    return Object.entries(nationalityCounts).map(([key, value]) => ({ key, value }));
  };

  const prepareCategoryData = () => {
    const categoryCounts = {
      [AttractionTicketCategoryEnum.ADULT]: 0,
      [AttractionTicketCategoryEnum.CHILD]: 0,
      [AttractionTicketCategoryEnum.SENIOR]: 0,
      [AttractionTicketCategoryEnum.STUDENT]: 0,
    };
  
    ticketsData.forEach((ticket) => {
      const category = ticket.attractionTicketListing?.category;
      if (category && category in categoryCounts) {
        categoryCounts[category as keyof typeof categoryCounts] += 1;
      }
    });
  
    return Object.entries(categoryCounts).map(([key, value]) => ({ key, value }));
  };

  const nationalityData = prepareNationalityData();
  const categoryData = prepareCategoryData();
  const purchaseTimeSeriesData = purchaseDateRange ? prepareTimeSeriesData(purchaseDateRange, 'purchaseDate') : [];
  const attractionTimeSeriesData = attractionDateRange ? prepareTimeSeriesData(attractionDateRange, 'attractionDate') : [];

  const nationalityColors = ['#0d47a1', '#2196f3'];
  const categoryColors = ['#e65100', '#ff9800', '#ffc107', '#ffe082'];
  
  const colors = {
    All: '#a3d4c7',  // A distinct green for 'All'
    Local: '#0d47a1', // Dark blue
    Standard: '#2196f3', // Light blue
    Adult: '#e65100', // Dark orange
    Child: '#ff9800', // Orange
    Senior: '#ffc107', // Amber
    Student: '#ffe082', // Light amber
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

  const categoryChartData = {
    labels: categoryData.map((entry) => entry.key),
    datasets: [
      {
        data: categoryData.map((entry) => entry.value),
        backgroundColor: categoryColors,
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
  const attractionTimeSeriesChartData = createTimeSeriesChartData(attractionTimeSeriesData);

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
              {purchaseDateRange && (
                <div className="flex justify-start">
                  <Text className="mr-2 pt-1">Purchase Date:</Text>
                  <RangePicker
                    value={purchaseDateRange}
                  onChange={handlePurchaseDateChange}
                  style={{ marginBottom: '10px' }}
                />
                </div>
              )}
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
            </Col>
            <Col xs={24} lg={12}>
              {attractionDateRange && (
                <div className="flex justify-start">
                  <Text className="mr-2 pt-1">Visit Date:</Text>
                  <RangePicker
                    value={attractionDateRange}
                  onChange={handleAttractionDateChange}
                    style={{ marginBottom: '10px' }}
                  />
                </div>
              )}
              <GraphContainer
                title="Expected Visits Over Time"
                data={attractionTimeSeriesChartData}
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

export default DashboardTab;
