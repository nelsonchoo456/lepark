import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Spin, message, Checkbox } from 'antd';
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

interface DashboardTabProps {
  attractionId: string;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ attractionId }) => {
  const [loading, setLoading] = useState(false);
  const [ticketsData, setTicketsData] = useState<AttractionTicketResponse[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);

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
      const response = await getAttractionTicketsByAttractionId(attractionId);
      const formattedData = response.data.map((ticket: AttractionTicketResponse) => ({
        ...ticket,
        purchaseDate: dayjs(ticket.attractionTicketTransaction?.purchaseDate).format('YYYY-MM-DD'),
      }));
      formattedData.sort((a: any, b: any) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
      setTicketsData(formattedData);

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
        const response = await getAttractionTicketsByAttractionId(attractionId);
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
        setTicketsData(filteredData);
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

  const prepareTimeSeriesData = () => {
    const dailyCounts: { [key: string]: { [category: string]: number } } = {};
  
    const allDates = [];
    let currentDate = dayjs(startDate);
    const endDateObj = dayjs(endDate);
    while (currentDate.isBefore(endDateObj) || currentDate.isSame(endDateObj, 'day')) {
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
      const date = dayjs(ticket.attractionTicketTransaction?.purchaseDate).format('YYYY-MM-DD');
      if (dailyCounts.hasOwnProperty(date)) {
        dailyCounts[date].All += 1;
        
        // Increment nationality count
        const nationality = ticket.attractionTicketListing?.nationality || 'Standard';
        if (nationality === AttractionTicketNationalityEnum.LOCAL) {
          dailyCounts[date].Local += 1;
        } else {
          dailyCounts[date].Standard += 1;
        }
        
        // Increment category count
        const category = ticket.attractionTicketListing?.category;
        if (category) {
          switch (category) {
            case AttractionTicketCategoryEnum.ADULT:
              dailyCounts[date].Adult += 1;
              break;
            case AttractionTicketCategoryEnum.CHILD:
              dailyCounts[date].Child += 1;
              break;
            case AttractionTicketCategoryEnum.SENIOR:
              dailyCounts[date].Senior += 1;
              break;
            case AttractionTicketCategoryEnum.STUDENT:
              dailyCounts[date].Student += 1;
              break;
          }
        }
      }
    });
  
    const result = allDates.map((date) => ({
      date,
      ...dailyCounts[date],
    }));
  
    return result;
  };

  const nationalityData = prepareNationalityData();
  const categoryData = prepareCategoryData();
  const timeSeriesData = prepareTimeSeriesData();

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

  const timeSeriesChartData = {
    labels: timeSeriesData.map((entry) => entry.date),
    datasets: selectedCategories.map((category) => ({
      label: category,
      data: timeSeriesData.map((entry) => entry[category as keyof typeof entry] || 0),
      borderColor: colors[category as keyof typeof colors],
      backgroundColor: colors[category as keyof typeof colors],
      fill: false,
    })),
  };


  const handleCategoryChange = (checkedValues: string[]) => {
    setSelectedCategories(checkedValues.length > 0 ? checkedValues : ['All']);
  };

  return (
    <Card>
      {startDate && endDate ? (
        <Row gutter={12} style={{ marginBottom: '10px', justifyContent: 'right' }}>
          <Col>
            <RangePicker
              onChange={handleDateChange}
              defaultValue={[dayjs(startDate), dayjs(endDate)]}
              value={[dayjs(startDate), dayjs(endDate)]}
              style={{ marginLeft: '16px' }}
            />
          </Col>
        </Row>
      ) : (
        loading && <Spin />
      )}
      {loading ? (
        <Spin />
      ) : (
        <>
          <Row gutter={[24, 16]} style={{ justifyContent: 'center', width: '100%' }}>
            <Col span={14}>
              <Checkbox.Group
                options={['All', 'Local', 'Standard', 'Adult', 'Child', 'Senior', 'Student']}
                value={selectedCategories}
                onChange={handleCategoryChange}
              />
              <GraphContainer
                title="Tickets Sold Over Time"
                data={timeSeriesChartData}
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
