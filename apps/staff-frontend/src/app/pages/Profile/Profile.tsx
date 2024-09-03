import { Card, Badge } from "antd";
import { Input, Avatar, Button } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { ContentWrapper, Divider, Content, Header, ListItemType, Logo, LogoText, CustButton } from "@lepark/common-ui";
import { useState, useEffect } from "react";
import { SCREEN_LG } from "../../config/breakpoints";
import { Color } from "antd/es/color-picker";
// import EventCard from "../MainLanding/components/EventCard";
// import EditPasswordModal from "./EditPasswordModal";
// import EditEmailModal from "./EditEmailModal";


const ProfilePage = () => {
    const [username, setUsername] = useState<string>("Staff Mary");
    const [contactNumber, setContactNumber] = useState<string>("12345678");
    const [role, setRole] = useState<string>("MANAGER");
    const [editing, setEditing] = useState<boolean>(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState<boolean>(false);
    const [isEmailModalVisible, setIsEmailModalVisible] = useState<boolean>(false);
  
  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleSave = () => {
    setEditing(false);
    // Save new profile edits functionality goes here
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleEditPassword = () => {
    setIsPasswordModalVisible(true);
  }

  const handleEditEmail = () => {
    setIsEmailModalVisible(true);
  }

  const handlePasswordModalCancel = () => {
    setIsPasswordModalVisible(false);
  };

  const handleEmailModalCancel = () => {
    setIsEmailModalVisible(false);
  };

  const handleLogout = () => {
    // Logout functionality goes here
  };

  return (
    <div className="pb-20">
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
          <Button 
            onClick={handleLogout} 
            icon={<LogoutOutlined />} 
            className="bg-green-200 text-white top-5 right-4 absolute"
          >
            Logout
          </Button>
        </div>
      </Card>

      <div className="relative flex items-center justify-between py-2 mx-4 bg-white rounded-2xl mt-[-2rem] shadow md:p-0">
        {/* Avatar container */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10 mt-[-3rem]">
          <Avatar
            size={80}
            icon={<UserOutlined />}
            className="border-4 border-white bg-green-400"
          />
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center w-full p-4 pt-10">
          {editing ? (
            <div className="w-full flex flex-col items-center">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mb-2"
              />
              <Input
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="mb-4"
              />
              <CustButton type="primary" onClick={handleSave} className="mb-2">
                Save
              </CustButton>
              <CustButton onClick={handleCancel} className="mb-2">
                Cancel
              </CustButton>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
            <h2 className="text-xl font-bold">{username}</h2>
            <p className="text-gray-600">{contactNumber}</p>
            <div className="w-full flex flex-col sm:flex-row sm:justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-4">
              <CustButton type="primary" onClick={handleEditProfile} className="w-auto sm:w-auto">
                Edit Profile
              </CustButton>
              {/* <CustButton type="primary" onClick={handleEditPassword} className="w-auto sm:w-auto">
                Change Password
              </CustButton>
              <EditPasswordModal open={isPasswordModalVisible} onClose={handlePasswordModalCancel} />
              <CustButton type="primary" onClick={handleEditEmail} className="w-auto sm:w-auto">
                Change Email
              </CustButton>
              <EditEmailModal open={isEmailModalVisible} onClose={handleEmailModalCancel} /> */}
            </div>
          </div>
        )}
      </div>
    </div>

      {/* <ContentWrapper>
      <div className="relative py-2 bg-white rounded-2xl shadow ">
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
        </ContentWrapper> */}

      <ContentWrapper>
        <div className="relative py-2 bg-white rounded-2xl shadow md:p-0">
          <LogoText className="font-bold text-lg pl-3 pt-1">Favourite Species</LogoText>
        </div>
      </ContentWrapper> 

    </div>
  );
};

export default ProfilePage;
