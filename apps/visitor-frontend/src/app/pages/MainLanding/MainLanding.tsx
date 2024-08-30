import { ContentWrapper, Divider, LogoText } from "@lepark/common-ui";
import MainLayout from "../../components/main/MainLayout";
import { NavButton } from "../../components/buttons/NavButton";
import { PiPlantFill, PiStarFill, PiTicketFill } from "react-icons/pi";
import { FaTent } from "react-icons/fa6";
import { Badge, Card, Space } from "antd";
import EventCard from "./components/EventCard";

const MainLanding = () => {
  return (
    // <MainLayout>
      <div>
        {/* <div className="md:flex"> */}
          <Card
            size="small"
            style={{
              backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/6/63/Kallang_River_at_Bishan_Park.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'white',
              overflow: 'hidden'
            }}
            className="mb-2 w-full h-28 bg-green-400 rounded-2xl -z-10 md:w-full md:rounded md:h-64"
          >
            <div className="absolute top-0 left-0 w-full h-full p-4 bg-green-700/70 text-white flex">
              <div className="md:text-center md:mx-auto">
                <p className="font-medium">Currently at</p>
                <p className="font-medium text-2xl md:text-3xl">Bishan-AMK Park</p>
              </div>
            </div>
            
          </Card>
          {/* md:flex-1 md:rounded-none md:mt-0 md:py-0 md:mb-2 md:flex-1 md:shadow-none */}
          <div className="flex items-start justify-between py-2 mx-4 bg-white rounded-2xl mt-[-2rem] shadow overflow-hidden
            md:p-0">
            <NavButton
              key="discover"
              icon={<PiPlantFill />}
            >
              Discover
            </NavButton>
            <NavButton
              key="attractions"
              icon={<PiStarFill />}
            >
              Attractions
            </NavButton>
            <NavButton
              key="venues"
              icon={<FaTent />}
            >
              Venues
            </NavButton>
            <NavButton
              key="tickets"
              icon={<PiTicketFill />}
            >
              Tickets
            </NavButton>
          </div>

        {/* </div> */}
        <ContentWrapper>
          <div className="font-bold text-lg">Our Events</div>
          <div className="w-full overflow-scroll flex gap-2 py-2">
            <EventCard 
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
            <EventCard 
              title="Event 3" 
              url="https://thinkerten.com/wordpress/wp-content/uploads/2017/04/SBG.jpg" 
              extra={<a href="#">More</a>}
            >
              keewerewrk
            </EventCard>
          </div>
        </ContentWrapper>
        <ContentWrapper>
          <LogoText className="font-bold text-lg">Plant of the Day</LogoText>
          <Badge.Ribbon text={<LogoText className="font-bold text-lg text-white">#PoTD</LogoText>}>
            <Card
              size="small"
              title="Small size card"
              extra={<a href="#">More</a>}
              className="my-2 w-full"
            >
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
          </Badge.Ribbon>
        </ContentWrapper>
      </div>
    // </MainLayout>
  );
};

export default MainLanding;