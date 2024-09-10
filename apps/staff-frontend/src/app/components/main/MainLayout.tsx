import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { SCREEN_LG } from "../../config/breakpoints";
import { Content, Header, ListItemType, LogoText, Sidebar } from "@lepark/common-ui";
import { FiHome, FiInbox, FiSettings, FiUser, FiUsers } from "react-icons/fi";
import { IoLeafOutline } from "react-icons/io5";
import { GrMapLocation } from "react-icons/gr";
import { TbTrees, TbTree } from "react-icons/tb";
import { Menu } from "antd";
import Logo from "../logo/Logo";
import { PiPottedPlant } from "react-icons/pi";
import type { MenuProps } from 'antd';
type MenuItem = Required<MenuProps>['items'][number];

const MainLayout = () => {
  const [showSidebar, setShowSidebar] = useState<boolean>(
    window.innerWidth >= SCREEN_LG
  );
  const [activeItems, setActiveItems] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Resizing
  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= SCREEN_LG);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Setting Active Nav Item
  const getLastItemFromPath = (path: string): string => {
		const pathItems = path.split("/").filter(Boolean);
		return pathItems[pathItems.length - 1];
	};

  useEffect(() => {
    setActiveItems(getLastItemFromPath(location.pathname))
  }, [location.pathname])

  // Navigation
  const navItems: MenuItem[] = [
    {
      key: 'home',
      icon: <FiHome />,
      // icon: <UserOutlined />,
      label: 'Home',
      onClick: () => navigate('/'),
    },
    {
      key: 'park',
      icon: <TbTrees />,
      label: 'Parks',
      onClick: () => navigate('/park'),
      // children: [
      //   {
      //     key: 'park/create',
      //     label: 'Create',
      //     onClick: () => navigate('/park/create'),
      //   }
      // ]
    },
    {
      key: 'zone',
      icon: <TbTree />,
      label: 'Zones',
      onClick: () => navigate('/zone'),
    },
    {
      key: 'species',
      icon: <PiPottedPlant />,
      // icon: <UserOutlined />,
      label: 'Species',
      onClick: () => navigate('/species'),
    },
    {
      key: 'occurrence',
      icon: <IoLeafOutline />,
      // icon: <UserOutlined />,
      onClick: () => navigate('/occurrences'),
      label: 'Occurrences',
      // children: [
      //   {
      //     key: 'occurence/create',
      //     label: 'Create',
      //     onClick: () => navigate('/occurrence/create'),
      //   }
      // ]
    },
    {
      key: 'staffManagement',
      icon: <FiUsers />,
      // icon: <UploadOutlined />,
      label: 'Staff Management',
      onClick: () => navigate('/staff-management'),
    },
    {
      key: 'map',
      icon: <GrMapLocation />,
      // icon: <UserOutlined />,
      label: 'Map',
      onClick: () => navigate('/map'),
    },
    // {
    //   key: 'account',
    //   icon: <FiUser />,
    //   // icon: <UserOutlined />,
    //   label: 'Account',
    //   onClick: () => navigate('/profile'),
    // },
    {
      key: 'tasks',
      icon: <FiInbox />,
      // icon: <UploadOutlined />,
      label: 'Tasks',
    },
    {
      key: 'profile',
      icon: <FiUser/>,
      label: 'Account',
      onClick: () => navigate('/profile'),
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
        <Menu items={navItems} mode="inline" defaultOpenKeys={['home']} selectedKeys={[activeItems]} style={{ backgroundColor: "transparent", border: "transparent" }}/>
      </Sidebar>
      <Content $showSidebar={showSidebar}><Outlet /></Content>
    </div>
  );
}

export default MainLayout;
