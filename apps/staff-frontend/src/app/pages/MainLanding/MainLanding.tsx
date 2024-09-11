import { ContentWrapper, ContentWrapperDark, LogoText } from '@lepark/common-ui';
import MainLayout from '../../components/main/MainLayout';
import { Badge, Card, Statistic } from 'antd';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const MainLanding = () => {
  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
    },
    stroke: {
      curve: 'smooth', // Smooth curve for the line
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Days of the week
      title: {
        text: 'Day of the Week',
      },
    },
    yaxis: {
      title: {
        text: 'Visitor Count',
      },
    },
    title: {
      text: 'Visitor Count the Past Week',
      align: 'center',
    },
    dataLabels: {
      enabled: false, // Disable data labels to keep chart clean
    },
    fill: {
      type: 'gradient', // Enable gradient fill
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
      },
    },
    colors: ['#34a853'], // Color of the line
  };

  const chartSeries = [
    {
      name: 'Visitors',
      data: [150, 200, 170, 210, 300, 400, 380], // Sample daily visitor counts
    },
  ];

  return (
    <ContentWrapper>
      <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4">
        <Card className="w-full bg-green-50 p-4" styles={{ body: { padding: 0 }}}>
          <Statistic title={<LogoText className='text-lg mr-2'>Live Visitor Count</LogoText>} value={93} />
        </Card>
        <Card className="w-full bg-green-50">
          <Statistic title={<Badge dot><LogoText className='text-lg mr-2'>Plants Needing Care</LogoText></Badge>} value={2} />
        </Card>
        <Card className="w-full bg-green-50">
        <Statistic title={<Badge dot status="warning"><LogoText className='text-lg mr-2'>Plants Needing Monitoring</LogoText></Badge>} value={4} />
        </Card>
      </div>
      <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4">
        <Card className="w-full h-64">
        <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={220} />
        </Card>
        <Card className="w-full h-64">
          <LogoText>Latest Tasks</LogoText>
        </Card>
      </div>
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <Card className="w-full h-64">
          <LogoText>Something else</LogoText>
        </Card>
        <Card className="w-full h-64">
          
          <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={220} />
        </Card>
      </div>
    </ContentWrapper>
  );
};

export default MainLanding;
