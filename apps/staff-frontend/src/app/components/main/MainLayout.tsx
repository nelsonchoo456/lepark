import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { SCREEN_LG } from '../../config/breakpoints';
import { Content, Header, ListItemType, LogoText, Sidebar, useAuth } from '@lepark/common-ui';
import { FiHelpCircle, FiHome, FiInbox, FiMessageSquare, FiSettings, FiUser, FiUsers, FiMap, FiCamera } from 'react-icons/fi';
import { VideoCameraOutlined } from '@ant-design/icons';
import { IoLeafOutline } from 'react-icons/io5';
import { FaNetworkWired, FaToolbox } from 'react-icons/fa';
import { GrMapLocation } from 'react-icons/gr';
import { TbTrees, TbTree, TbTicket, TbCalendarEvent, TbBuildingEstate, TbDeviceAnalytics } from 'react-icons/tb';
import { Menu, message } from 'antd';
import Logo from '../logo/Logo';
import { PiPottedPlant } from 'react-icons/pi';
import { PiToolboxBold } from 'react-icons/pi';
import type { MenuProps } from 'antd';
import { getParkById, ParkResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { MdBuild, MdSensors } from 'react-icons/md';
import { GiTreehouse } from 'react-icons/gi'; // Import the new icon
import { AiOutlinePercentage } from 'react-icons/ai';
import { VscFeedback } from "react-icons/vsc";

type MenuItem = Required<MenuProps>['items'][number];

const MainLayout = () => {
  const { user, updateUser } = useAuth<StaffResponse>();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [park, setPark] = useState<ParkResponse>();

  const [showSidebar, setShowSidebar] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const [activeItems, setActiveItems] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserRole = async () => {
    if (!user) {
      message.error('User not found');
      return;
    } else {
      const role = await user.role;
      setUserRole(role);
    }
  };

  useEffect(() => {
    if (user?.parkId && user?.parkId !== undefined) {
      const fetchPark = async () => {
        const parkRes = await getParkById(user.parkId as number);
        if (parkRes.status === 200) {
          const parkData = parkRes.data;
          setPark(parkData);
        }
      };
      fetchPark();
    }
  }, [user]);

  // Resizing
  useEffect(() => {
    fetchUserRole();

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
    const pathItems = path.split('/').filter(Boolean);
    return pathItems[pathItems.length - 1];
  };

  const parkOnClick = userRole !== StaffType.SUPERADMIN ? () => navigate(`/park/${user?.parkId}`) : () => navigate('/park');
  const parkMapOnClick = userRole !== StaffType.SUPERADMIN ? () => navigate(`/park/${user?.parkId}/map`) : () => navigate('/park/map');

  useEffect(() => {
    const activeItem = location.pathname === '/' ? 'home' : getLastItemFromPath(location.pathname);
    if (userRole !== StaffType.SUPERADMIN && location.pathname.startsWith(`/park/${user?.parkId}`)) {
      setActiveItems('park');
    } else {
      setActiveItems(getLastItemFromPath(activeItem));
    }
  }, [location.pathname, userRole, user?.parkId]);

  const sensorNavItem: MenuItem = {
    key: 'sensor',
    icon: <MdSensors />,
    label: 'Sensors',
    children: [
      {
        key: 'sensor/list',
        label: 'List View',
        onClick: () => navigate('/sensor'),
      },
      {
        key: 'sensor/map',
        label: 'Map View',
        onClick: () => navigate('/sensor/map'),
      },
    ],
  };

  const hubsNavItem: MenuItem = {
    key: 'hubs',
    icon: <FaNetworkWired />,
    label: 'Hubs',
    onClick: () => navigate('/hubs'),
  };

  let parkNavItem: MenuItem = {
    key: 'park-main',
    icon: <TbTrees />,
    label: user?.role === 'superadmin' ? 'Parks' : 'Park',
    children: [
      {
        key: 'park',
        label: userRole === StaffType.SUPERADMIN ? 'List View' : 'Details',
        onClick: parkOnClick,
      },
      {
        key: 'park/map',
        label: 'Map View',
        onClick: parkMapOnClick,
      },
    ],
  };

  if (userRole !== StaffType.SUPERADMIN) {
    parkNavItem = {
      key: 'park',
      icon: <TbTrees />,
      label: user?.role === 'superadmin' ? 'Parks' : 'Park',
      onClick: parkOnClick,
    };
  }

  // Navigation
  const navItems: MenuItem[] = [
    {
      key: 'home',
      icon: <FiHome />,
      // icon: <UserOutlined />,
      label: 'Home',
      onClick: () => navigate('/'),
    },
    parkNavItem,
    {
      key: 'zone',
      icon: <TbTree />,
      label: 'Zones',
      onClick: () => navigate('/zone'),
    },
    { key: 'facilities', icon: <TbBuildingEstate />, label: 'Facilities', onClick: () => navigate('/facilities') },
    {
      key: 'plants',
      icon: <IoLeafOutline />,
      label: 'Plants',
      children: [
        {
          key: 'species',
          icon: <PiPottedPlant />,
          label: 'Species',
          onClick: () => navigate('/species'),
        },
        {
          key: 'occurrences',
          icon: <IoLeafOutline />,
          onClick: () => navigate('/occurrences'),
          label: 'Occurrences',
        },
      ],
    },
    {
      key: 'decarbonizationarea',
      icon: <GiTreehouse />,
      label: 'Decarbonization Areas',
      onClick: () => navigate('/decarbonization-area'),
    },
    userRole === StaffType.SUPERADMIN ||
    userRole === StaffType.MANAGER ||
    userRole === StaffType.ARBORIST ||
    userRole === StaffType.BOTANIST ||
    userRole === StaffType.VENDOR_MANAGER
      ? {
          key: 'iot',
          label: 'IoT',
          icon: <MdSensors />,
          children: [
            {
              key: 'sensor',
              icon: <MdSensors />,
              label: 'Sensors',
              onClick: () => navigate('/sensor'),
            },
            {
              key: 'hubs',
              icon: <FaNetworkWired />,
              label: 'Hubs',
              onClick: () => navigate('/hubs'),
            },
            {
              key: 'zones',
              icon: <TbDeviceAnalytics />,
              label: 'Zones Monitoring',
              onClick: () => navigate('/iot/zones'),
            },
            {
              key: 'iot-map',
              icon: <FiMap />,
              label: 'Map View',
              onClick: () => navigate('/sensor/map-view'),
            },
          ],
        }
      : null,
    {
      key: 'parkasset',
      icon: <PiToolboxBold />,
      label: 'Park Assets',
      onClick: () => navigate('/parkasset'),
    },
    userRole === StaffType.SUPERADMIN ||
    userRole === StaffType.MANAGER ||
    userRole === StaffType.ARBORIST ||
    userRole === StaffType.BOTANIST ||
    userRole === StaffType.VENDOR_MANAGER
      ? {
          key: 'maintenance',
          label: 'Predictive Maintenance',
          icon: <MdBuild />,
          children: [
            {
              key: 'sensor',
              icon: <MdSensors />,
              label: 'Sensors',
              onClick: () => navigate('/sensor/maintenance'),
            },
            {
              key: 'hubs',
              icon: <FaNetworkWired />,
              label: 'Hubs',
              onClick: () => navigate('/hubs/maintenance'),
            },
            {
              key: 'zones',
              icon: <PiToolboxBold />,
              label: 'Park Assets',
              onClick: () => navigate('/parkAsset/maintenance'),
            },
          ],
        }
      : null,
    userRole === 'MANAGER' || userRole === 'SUPERADMIN' || userRole === 'PARK_RANGER'
      ? {
          key: 'attractionEvents',
          icon: <TbTicket />,
          label: 'Attractions & Events',
          children: [
            {
              key: 'attraction',
              icon: <TbTicket />,
              label: 'Attractions',
              onClick: () => navigate('/attraction'),
            },
            {
              key: 'event',
              icon: <TbCalendarEvent />,
              label: 'Events',
              onClick: () => navigate('/event'),
            },
            {
              key: 'promotion',
              icon: <AiOutlinePercentage />,
              label: 'Promotions',
              onClick: () => navigate('/promotion'),
            },
          ],
        }
      : null,
    userRole === 'MANAGER' || userRole === 'SUPERADMIN' || userRole === 'PARK_RANGER'
      ? {
          key: 'crowdInsights',
          icon: <VideoCameraOutlined />,
          label: 'Crowd Insights',
          onClick: () => navigate('/crowdInsights'),
        }
      : null,
    {
      key: 'task',
      icon: <FiInbox />,
      label: 'Tasks',
      children: [
        {
          key: 'plant-tasks',
          label: 'Plant Tasks',
          onClick: () => navigate('/plant-tasks'),
        },
        {
          key: 'maintenance-tasks',
          label: 'Maintenance Tasks',
          onClick: () => navigate('/maintenance-tasks'),
        },
      ],
    },
    {
      key: 'faq',
      icon: <FiHelpCircle />,
      label: 'FAQ',
      onClick: () => navigate('/faq'),
    },

    userRole === 'SUPERADMIN' || userRole === 'MANAGER' || userRole === 'PARK_RANGER'
      ? {
          key: 'feedback',
          icon: <VscFeedback />,
          label: 'Feedback',
          onClick: () => navigate('/feedback'),
        }
      : null,
    {
      key: 'announcement',
      icon: <FiMessageSquare />,
      label: 'Announcements',
      onClick: () => navigate('/announcement'),
    },
    // userRole === 'MANAGER' ||
    // userRole === 'SUPERADMIN' ||
    // userRole === 'BOTANIST' ||
    // userRole === 'ARBORIST' ||
    // userRole === 'PARK_RANGER' ||
    // userRole === 'VENDOR_MANAGER'
    //   ? {
    //       key: 'task',
    //       icon: <FiInbox />,
    //       label: 'Tasks',
    //       children: [
    //         {
    //           key: 'plant-tasks',
    //           label: 'Plant Tasks',
    //           onClick: () => navigate('/plant-tasks'),
    //         },
    //         {
    //           key: 'maintenance-tasks',
    //           label: 'Maintenance Tasks',
    //           onClick: () => navigate('/maintenance-tasks'),
    //         },
    //       ],
    //     }
    //   : null,

    userRole === 'MANAGER' || userRole === 'SUPERADMIN'
      ? {
          key: 'staff-management',
          icon: <FiUsers />,
          label: 'Staff Management',
          onClick: () => navigate('/staff-management'),
        }
      : null,

    {
      key: 'profile',
      icon: <FiUser />,
      label: 'Account',
      onClick: () => navigate('/profile'),
    },
  ];

  return (
    <div>
      <Header items={navItems} showSidebar={showSidebar}>
        <div className="px-4 flex gap-2 items-center">
          <Logo />
          {userRole === StaffType.SUPERADMIN ? (
            <LogoText>Lepark Admin</LogoText>
          ) : user?.parkId && park ? (
            <LogoText>{park.name}</LogoText>
          ) : (
            <LogoText>Lepark Staff</LogoText>
          )}
        </div>
      </Header>
      <Sidebar>
        <div className="pb-2 px-4 flex gap-2 items-center">
          <Logo />
          {userRole === StaffType.SUPERADMIN ? (
            <LogoText>Lepark Admin</LogoText>
          ) : user?.parkId && park ? (
            <LogoText>{park.name}</LogoText>
          ) : (
            <LogoText>Lepark Staff</LogoText>
          )}
        </div>
        <Menu
          items={navItems}
          mode="inline"
          defaultOpenKeys={['home']}
          selectedKeys={[activeItems]}
          style={{ backgroundColor: 'transparent', border: 'transparent' }}
        />
      </Sidebar>
      <Content $showSidebar={showSidebar}>
        <Outlet />
      </Content>
    </div>
  );
};

export default MainLayout;
