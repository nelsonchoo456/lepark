import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { AttractionTicketListingResponse } from '@lepark/data-access';

interface TicketPurchaseChartProps {
  ticketListings: AttractionTicketListingResponse[];
}

const TicketPurchaseChart: React.FC<TicketPurchaseChartProps> = ({ ticketListings }) => {
  const [chartData, setChartData] = useState<{ dates: string[], series: number[] }>({
    dates: [],
    series: [],
  });

//   useEffect(() => {
//     // Sort ticketListings by date
//     const sortedListings = [...ticketListings].sort((a, b) => 
//       new Date(a.date).getTime() - new Date(b.date).getTime()
//     );

//     // Aggregate total tickets sold per date
//     const aggregatedData = sortedListings.reduce((acc, listing) => {
//       const date = new Date(listing.date).toISOString().split('T')[0];
//       if (!acc[date]) {
//         acc[date] = 0;
//       }
//       acc[date] += listing.ticketsSold;
//       return acc;
//     }, {} as Record<string, number>);

//     // Calculate cumulative sum
//     let cumulativeSum = 0;
//     const dates = Object.keys(aggregatedData);
//     const series = dates.map(date => {
//       cumulativeSum += aggregatedData[date];
//       return cumulativeSum;
//     });

//     setChartData({ dates, series });
//   }, [ticketListings]);

  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
    },
    stroke: {
      curve: 'smooth',
    },
    xaxis: {
      categories: chartData.dates,
      type: 'datetime',
    },
    yaxis: {
      title: {
        text: 'Total Tickets Sold',
      },
    },
    tooltip: {
      x: {
        format: 'dd MMM yyyy'
      },
    },
  };

  const series = [{
    name: 'Total Tickets Sold',
    data: chartData.series,
  }];

  return (
    <Chart
      options={options}
      series={series}
      type="line"
      height={350}
    />
  );
};

export default TicketPurchaseChart;