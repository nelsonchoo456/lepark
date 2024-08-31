import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { SCREEN_LG } from "../../config/breakpoints";
import { Content, Header, ListItemType, Logo, LogoText, MobileContent, MobileSidebar, Sidebar } from "@lepark/common-ui";
import { BottomNavBar } from "./BottomNavBar";
import { FiHome, FiMoreHorizontal, FiUser } from "react-icons/fi";
import { GrMapLocation } from "react-icons/gr";
import { Menu } from "antd";

const MainLayout = () => {
  const [showSidebar, setShowSidebar] = useState<boolean>(
    window.innerWidth >= SCREEN_LG
  );
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= SCREEN_LG);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Navigation
  const navItems: ListItemType[] = [
    {
      key: 'home',
      icon: <FiHome style={{ fontSize: "1.5rem" }} />,
      label: 'Home',
      onClick: () => navigate('/'),
    },
    {
      key: 'map',
      icon: <GrMapLocation style={{ fontSize: "1.5rem" }}/>,
      label: 'Map',
      onClick: () => navigate('/map'),
    },
    {
      key: 'account',
      icon: <FiUser style={{ fontSize: "1.5rem" }}/>,
      label: 'Account',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'others',
      icon: <FiMoreHorizontal style={{ fontSize: "1.5rem" }}/>,
      label: '',
      onClick: () => navigate('/'),
    },
  ]

  return (
    <div>
      <Header showSidebar={showSidebar} >
        <div className="px-4 flex gap-2 items-center">
          <Logo/>
          <LogoText>Leparks</LogoText>
        </div>
      </Header>
      <MobileSidebar >
        <div className="flex justify-center pb-4"><Logo size={2.5}/></div>
        <div className="flex flex-col">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => item.onClick && item.onClick()}
              className="flex flex-col items-center py-1 mb-4 text-center hover:text-green-200 transition-all duration-300"
            >
              <div className="p-1 rounded-full hover:bg-green-200 hover:text-white transition-all duration-300 ease-out hover:scale-110" >
                {item.icon}
              </div>
              {item.label !== "Others" &&
                <div className="text-sm">
                  {item.label}
                </div>
              }
            </button>
          ))}
        </div>
      </MobileSidebar>
      <MobileContent $showSidebar={showSidebar}><Outlet /></MobileContent>
      <BottomNavBar items={navItems} showSidebar={showSidebar} />
    </div>
  );
}

export default MainLayout;