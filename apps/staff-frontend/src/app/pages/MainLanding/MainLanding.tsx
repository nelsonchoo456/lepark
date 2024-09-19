import { ContentWrapper, ContentWrapperDark, LogoText } from '@lepark/common-ui';
import MainLayout from '../../components/main/MainLayout';
import { Badge, Card, Empty, Statistic } from 'antd';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import PageHeader2 from '../../components/main/PageHeader2';

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
      data: [0, 0, 0, 0, 0, 0, 0], // Sample daily visitor counts
    },
  ];

  const breadcrumbItems = [
    {
      title: "Dashboard",
      pathKey: '/',
      isMain: true,
    },
  ]

  return (
    <ContentWrapper>
      <PageHeader2 breadcrumbItems={breadcrumbItems}/>
      <div className=''>
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4">
          <Card className="w-full bg-green-50 p-4" styles={{ body: { padding: 0 }}}>
            {/* <Statistic title={<LogoText className='text-lg mr-2'>Live Visitor Count</LogoText>} /> */}
            <LogoText className='text-lg mr-2'>Live Visitor Count</LogoText>
            <div className='flex justify-center items-center h-full mt-4 opacity-50'>No data</div>
          </Card>
          <Card className="w-full bg-green-50">
            {/* <Statistic title={<LogoText className='text-lg mr-2'>Plants Needing Care</LogoText>} value={2} /> */}
            <LogoText className='text-lg mr-2'>Tasks Log</LogoText>
            <div className='flex justify-center items-center h-full mt-4 opacity-50'>No data</div>
          </Card>
          <Card className="w-full bg-green-50">
            {/* <Statistic title={<Badge dot status="warning"><LogoText className='text-lg mr-2'>Pending Tasks</LogoText></Badge>}/> */}
            <LogoText className='text-lg mr-2'>Pending Tasks</LogoText>
            <div className='flex justify-center items-center h-full mt-4 opacity-50'>No data</div>
          </Card>
        </div>
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4">
          <Card className="w-full h-86">
            <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={220} />
          </Card>
          <Card className="w-full h-86">
            <LogoText>Latest Tasks</LogoText>
            <div className='flex justify-center items-center h-full mt-20 opacity-50'>No data</div>
          </Card>
        </div>
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4 h-[18rem]">
          <Card className="w-full h-86">
            <LogoText>Predictive Visitor Count</LogoText>
            <div className='flex justify-center items-center h-full mt-20 opacity-50'>No data</div>
          </Card>
          <Card className="w-full h-86">
            <LogoText>Announcements</LogoText>
            <div className='flex justify-center items-center h-full mt-20 opacity-50'>No data</div>
          </Card>
        </div>
        
      </div>
      {/* <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <Card className="w-full h-64">
          <LogoText>Something else</LogoText>
        </Card>
        <Card className="w-full h-64">
          
          <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={220} />
        </Card>
      </div> */}
    </ContentWrapper>
  );
};

export default MainLanding;
