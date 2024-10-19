import { ContentWrapper, ContentWrapperDark, DashboardContentWrapper, LogoText, useAuth } from '@lepark/common-ui';
import MainLayout from '../../components/main/MainLayout';
import { Badge, Card, Empty, Statistic } from 'antd';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import PageHeader2 from '../../components/main/PageHeader2_MainLanding';
import ManagerMainLanding from './Manager/ManagerMainLanding';
import { StaffResponse, StaffType } from '@lepark/data-access';
import BAMainLanding from './BotanistArborist/BAMainLanding';

const MainLanding = () => {
  const { user } = useAuth<StaffResponse>();
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

  const renderDashboard = () => {
    if (user?.role === StaffType.ARBORIST || user?.role === StaffType.BOTANIST) {
      return <BAMainLanding/>
    }
    return <ManagerMainLanding/>
  }

  return (
    <DashboardContentWrapper>
      {/* <PageHeader2 breadcrumbItems={breadcrumbItems}/> */}
      {renderDashboard()}
    </DashboardContentWrapper>
      
  );
};

export default MainLanding;
