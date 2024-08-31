import { Card, Badge } from "antd";
import { Avatar, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { ContentWrapper, Divider, Content, Header, ListItemType, Logo, LogoText, MobileContent, MobileSidebar, Sidebar } from "@lepark/common-ui";
import { useState, useEffect } from "react";
import { SCREEN_LG } from "../../config/breakpoints";
import { Color } from "antd/es/color-picker";
import EventCard from "../MainLanding/components/EventCard";

const ProfilePage = () => {
  const [username, setUsername] = useState<string>("John Tan");
  const [email, setEmail] = useState<string>("john@gmail.com");
  const [editing, setEditing] = useState<boolean>(false);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = () => {
    setEditing(false);
    // Save functionality goes here
  };

  return (
    <div>
      <Card
        size="small"
        style={{
          backgroundImage: `url('https://images.template.net/97316/free-cute-green-aesthetic-background-u8pu8.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          overflow: 'hidden',
          position: 'relative',
        }}
        className="mb-2 w-full h-40 bg-green-400 rounded-2xl -z-10 md:w-full md:rounded md:h-64"
      >
        <div className="absolute top-0 left-0 w-full h-full p-4 bg-green-700/70 text-white flex">
          <div className="md:text-center md:mx-auto">
            <p className="font-medium text-2xl md:text-3xl">My Profile</p>
          </div>
        </div>
      </Card>

      <div className="relative flex items-center justify-between py-2 mx-4 bg-white rounded-2xl mt-[-2rem] shadow md:p-0">
        {/* Avatar container */}
        <div className="mt-[-11rem] absolute left-1/2 transform -translate-x-1/2 z-10">
          <Avatar
            size={80}
            icon={<UserOutlined />}
            className="border-4 border-white bg-green-400"
          />
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center w-full p-4 pt-10">
          
              <h2 className="text-xl font-bold">{username}</h2>
              <p className="text-gray-600">{email}</p>
              <Button type="primary" onClick={handleEdit} className="mt-4">
                Edit Profile
              </Button>
        </div>
      </div>

      <ContentWrapper>
      <div className="relative py-2 mx-4 bg-white rounded-2xl shadow ">
        <LogoText className="font-bold text-lg pl-3 pt-1">My Upcoming Events</LogoText>
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
          </div>
        </ContentWrapper>

      <ContentWrapper>
      <div className="relative py-2 mx-4 bg-white rounded-2xl shadow md:p-0">
        <LogoText className="font-bold text-lg pl-3 pt-1">Reports</LogoText>
        </div>
      </ContentWrapper>
    </div>
  );
};

export default ProfilePage;
