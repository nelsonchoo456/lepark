import { ContentWrapper, Divider, LogoText } from "@lepark/common-ui";
import MainLayout from "../../components/main/MainLayout";
import { NavButton } from "../../components/buttons/NavButton";
import { PiPlantFill, PiStarFill, PiTicketFill } from "react-icons/pi";
import { FaTent } from "react-icons/fa6";
import { Card, Space } from "antd";

const MainLanding = () => {
  return (
    <MainLayout>
      <ContentWrapper>
      <div className="flex items-start justify-between gap-2 py-4">
        <NavButton className="text-green-500 font-semibold bg-green-100 hover:bg-green-200" key="discover" icon={<PiPlantFill/>}>Discover</NavButton> 
        <NavButton className="text-green-500 font-semibold bg-green-100 hover:bg-green-200" key="attractions" icon={<PiStarFill/>}>Attractions</NavButton>
        <NavButton className="text-green-500 font-semibold bg-green-100 hover:bg-green-200" key="venues" icon={<FaTent/>}>Venues</NavButton>
        <NavButton className="text-green-500 font-semibold bg-green-100 hover:bg-green-200" key="tickets" icon={<PiTicketFill/>}>Tickets</NavButton> 
      </div>
      <Divider>Events</Divider>
      <div className="w-full overflow-scroll flex gap-2 my-2">
        <Card size="small" title="Small size card" extra={<a href="#">More</a>} style={{ width: "10rem", height: "13rem" }}>
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </Card>
        <Card size="small" title="Small size card" extra={<a href="#">More</a>} style={{ width: "10rem", height: "13rem" }}>
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </Card>
        <Card size="small" title="Small size card" extra={<a href="#">More</a>} style={{ width: "10rem", height: "13rem" }}>
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </Card>
      </div>
      <Divider><LogoText>#PoTD</LogoText></Divider>
      <Card size="small" title="Small size card" extra={<a href="#">More</a>} style={{ width: "100%", height: "13rem" }} className="my-2">
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </Card>
      </ContentWrapper>
    </MainLayout>
  );
};

export default MainLanding;