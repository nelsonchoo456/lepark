import { ContentWrapper, Divider, LogoText, QrScanner2 } from '@lepark/common-ui';
import { usePark } from '../../park-context/ParkContext';
import MainLayout from '../../components/main/MainLayout';
import { NavButton } from '../../components/buttons/NavButton';
import { PiPlant, PiPlantFill, PiStarFill, PiTicketFill } from 'react-icons/pi';
import { FaHouseUser, FaLocationDot, FaTent } from 'react-icons/fa6';
import {BsHouseDoor} from 'react-icons/bs';
import { Badge, Button, Card, Empty, Space } from 'antd';
import EventCard from './components/EventCard';
import { Link, useNavigate } from 'react-router-dom';
import withParkGuard from '../../park-context/withParkGuard';
import { BsCalendar4Event } from 'react-icons/bs';
import { MdArrowForward, MdArrowOutward, MdArrowRight } from 'react-icons/md';
import ParkHeader from './components/ParkHeader';
import { GiTreehouse } from 'react-icons/gi';
import { useEffect, useState } from 'react';
import { fetchTotalSequestration, calculateHDBPoweredDays } from '../Decarb/DecarbFunctions';
import { FiExternalLink } from 'react-icons/fi';
import { AiOutlinePercentage } from 'react-icons/ai';
import { BiSolidDiscount } from 'react-icons/bi';

const MainLanding = () => {
    const navigate = useNavigate();
  const { selectedPark } = usePark();
  const [totalSequestration, setTotalSequestration] = useState<number | null>(null);
  const [poweredDays, setPoweredDays] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedPark?.id) {
        try {
          const currentDate = '2024-08-28'; // Hardcoded to 28 August 2024
          const sequestration = await fetchTotalSequestration(selectedPark.id, currentDate);
          setTotalSequestration(Math.round(sequestration));
          const days = calculateHDBPoweredDays(sequestration);
          setPoweredDays(days);
        } catch (error) {
          console.error('Error fetching sequestration data:', error);
        }
      }
    };

    fetchData();
  }, [selectedPark]);

  return (
    <div>
      <ParkHeader>
        <FaLocationDot className="text-highlightGreen-200 text-4xl mt-2 md:hidden" />
        <div className="md:text-center md:mx-auto">
          <p className="font-light">Exploring</p>
          <p className="font-medium text-2xl -mt-1 md:text-3xl">{selectedPark?.name}</p>
        </div>
      </ParkHeader>

      {/* md:flex-1 md:rounded-none md:mt-0 md:py-0 md:mb-2 md:flex-1 md:shadow-none */}
      <div
        className="flex items-start justify-between py-2 mx-4 bg-white rounded-2xl mt-[-2rem] shadow overflow-hidden relative z-10
            md:p-0"
      >
        <NavButton
          key="discover"
          icon={<PiPlantFill />}
          onClick={() => {
            navigate(`/discover/park/${selectedPark?.id}`);
          }}
        >
          Species
        </NavButton>
        <NavButton
          key="attractions"
          icon={<PiStarFill />}
          onClick={() => {
            navigate(`/attractions/park/${selectedPark?.id}`);
          }}
        >
          Attractions
        </NavButton>
        <NavButton key="venues" icon={<FaTent />}>
          Venues
        </NavButton>
        <NavButton
          key="promotions"
          icon={<BiSolidDiscount />}
          onClick={() => {
            navigate(`/promotions`);
          }}
        >
          Promotions
        </NavButton>
      </div>

      {/* </div> */}
      <QrScanner2/>
      <ContentWrapper>
        <div className="flex items-center">
          <LogoText className="text-xl">Our Events</LogoText>
          <div className="flex flex-1 items-center md:flex-row-reverse md:ml-4">
            <div className="h-[1px] flex-1 bg-green-100/50 mx-2"></div>
            <Button
              icon={<MdArrowForward className="text-2xl" />}
              shape="circle"
              type="primary"
              size="large"
              className="md:bg-transparent md:text-green-500 md:shadow-none"
            />
          </div>
        </div>
        <div className="w-full overflow-scroll flex gap-2 py-2 min-h-[13rem]">
          <div className="opacity-40 flex flex-col justify-center items-center text-center w-full">
            <BsCalendar4Event className="text-4xl" />
            <br />
            No Events here.
            <br />
            Check back soon for Events!
          </div>
          {/* <EventCard
            title="Event 1"
            url="https://media.cntraveler.com/photos/5a90b75389971c2c547af152/16:9/w_2560,c_limit/National-Orchid-Garden_2018_National-Orchid-Garden-(2)-Pls-credit-NParks-for-the-photos).jpg"
            extra={<a href="#">More</a>}
          >
            keewewk
          </EventCard>
          <EventCard
            title="Event 4"
            url="https://image-tc.galaxy.tf/wijpeg-bg2v4hnwseq2v8akq9py9df8w/singapore-botanic-gardens_standard.jpg?crop=57%2C0%2C867%2C650"
            extra={<a href="#">More</a>}
          >
            rwrewrkeek
          </EventCard>
          <EventCard
            title="Event 2"
            url="https://cdn.apartmenttherapy.info/image/upload/f_jpg,q_auto:eco,c_fill,g_auto,w_1500,ar_16:9/at%2Freal-estate%2Flongwood-gardens"
            extra={<a href="#">More</a>}
          >
            keewerewk
          </EventCard>
          <EventCard title="Event 3" url="https://thinkerten.com/wordpress/wp-content/uploads/2017/04/SBG.jpg" extra={<a href="#">More</a>}>
            keewerewrk
          </EventCard> */}
        </div>
        <br />
      <div className="flex justify-between items-center">
    <LogoText className="font-bold text-lg">Sustainability</LogoText>
    <Link to="/decarb" className="text-green-600 hover:text-green-700 flex items-center">
      <Space>
        Learn More
        <FiExternalLink />
      </Space>
    </Link>
  </div>
          <br/>


  <div className="flex justify-between items-center h-48">
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <PiPlant className="text-4xl mb-2" />
      <div className="flex flex-row items-center">
        <p>In the past year, this park has absorbed <span className="font-bold text-lg ml-1">{totalSequestration} kg</span> of CO2</p>
      </div>
    </div>
    <div className="w-px h-full bg-gray-200 mx-4"></div>
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <BsHouseDoor className="text-4xl mb-2" />
      <p>Equivalent to powering a 4 room HDB for</p>
      <p className="font-bold text-lg">{poweredDays} days</p>
    </div>
  </div>

        <LogoText className="font-bold text-lg">Plant of the Day</LogoText>
        <Badge.Ribbon text={<LogoText className="font-bold text-lg text-white">#PoTD</LogoText>}>
          <Card size="small" title="" extra={<a href="#">More</a>} className="my-2 w-full">
            <div className="opacity-40 flex flex-col justify-center items-center text-center w-full h-48">
              <PiPlant className="text-4xl" />
              <br />
              No Plant of the Day yet.
              <br />
              Check back soon for Plant of the Day!
            </div>
          </Card>
        </Badge.Ribbon>
      </ContentWrapper>
    </div>
    // </MainLayout>
  );
};

export default withParkGuard(MainLanding);
