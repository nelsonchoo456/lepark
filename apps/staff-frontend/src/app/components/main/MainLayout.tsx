import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { SCREEN_LG } from "../../config/breakpoints";
import { Content, Header, ListItemType, LogoText, Sidebar } from "@lepark/common-ui";
import { FiHome, FiInbox, FiSettings, FiUser } from "react-icons/fi";
import { GrMapLocation } from "react-icons/gr";
import { Menu } from "antd";
import Logo from "../logo/Logo";

const MainLayout = () => {
  const [showSidebar, setShowSidebar] = useState<boolean>(
    window.innerWidth >= SCREEN_LG
  );
  const navigate = useNavigate();

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
      icon: <FiHome />,
      // icon: <UserOutlined />,
      label: 'Home kekek',
      onClick: () => navigate('/'),
    },
    {
      key: 'map',
      icon: <GrMapLocation />,
      // icon: <UserOutlined />,
      label: 'Map',
      onClick: () => navigate('/map'),
    },
    {
      key: 'account',
      icon: <FiUser />,
      // icon: <UserOutlined />,
      label: 'Account',
    },
    {
      key: 'tasks',
      icon: <FiInbox />,
      // icon: <UploadOutlined />,
      label: 'Tasks',
    },
    {
      key: 'settings',
      icon: <FiSettings />,
      // icon: <UserOutlined />,
      label: 'Settings',
    },
  ];
  
  return (
    <div>
      <Header items={navItems} showSidebar={showSidebar} >
        <div className="px-4 flex gap-2 items-center">
          <Logo/>
          <LogoText>Leparks Admin</LogoText>
        </div>
      </Header>
      <Sidebar>
        <div className="pb-2 px-4 flex gap-2 items-center">
          <Logo/>
          <LogoText>Leparks Admin</LogoText>
        </div>
        <Menu items={navItems} style={{ backgroundColor: "transparent", border: "transparent" }}/>
      </Sidebar>
      <Content $showSidebar={showSidebar}><Outlet /></Content>
    </div>
  );
}

export default MainLayout;