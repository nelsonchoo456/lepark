import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { SCREEN_LG } from '../../config/breakpoints';
import { Content, Header, ListItemType, LogoText, Sidebar, useAuth } from '@lepark/common-ui';
import { FiHome, FiInbox, FiSettings, FiUser, FiUsers } from 'react-icons/fi';
import { IoLeafOutline } from 'react-icons/io5';
import { GrMapLocation } from 'react-icons/gr';
import { TbTrees, TbTree, TbTicket, TbCalendarEvent } from 'react-icons/tb';
import { Menu, message } from 'antd';
import Logo from '../logo/Logo';
import { PiPottedPlant } from 'react-icons/pi';
import type { MenuProps } from 'antd';
import { StaffResponse, StaffType } from '@lepark/data-access';
type MenuItem = Required<MenuProps>['items'][number];

const MainLayout = () => {
  const { user, updateUser } = useAuth<StaffResponse>();
  const [userRole, setUserRole] = useState<string | null>(null);

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

  let parkNavItem: MenuItem = {
    key: 'park',
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
    // {
    //   key: 'park',
    //   icon: <TbTrees />,
    //   label: user?.role === 'superadmin' ? 'Parks' : 'Park',
    //   children: [
    //     {
    //       key: 'park',
    //       label: userRole === StaffType.SUPERADMIN ? 'List View' : 'Details',
    //       onClick: parkOnClick,
    //     },
    //     {
    //       key: 'park/map',
    //       label: 'Map View',
    //       onClick: parkMapOnClick,
    //     }
    //   ]
    // },
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
      key: 'occurrences',
      icon: <IoLeafOutline />,
      // icon: <UserOutlined />,
      onClick: () => navigate('/occurrences'),
      label: 'Occurrences',
      // children: [
      //   {
      //     key: 'occurrence/create',
      //     label: 'Create',
      //     onClick: () => navigate('/occurrence/create'),
      //   }
      // ]
    },
    userRole === 'MANAGER' || userRole === 'SUPERADMIN'
      ? {
          key: 'staff-management',
          icon: <FiUsers />,
          // icon: <UploadOutlined />,
          label: 'Staff Management',
          onClick: () => navigate('/staff-management'),
        }
      : null,
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
    userRole === 'MANAGER' ||
    userRole === 'SUPERADMIN' ||
    userRole === 'BOTANIST' ||
    userRole === 'ARBORIST' ||
    userRole === 'PARK_RANGER' ||
    userRole === 'VENDOR_MANAGER'
      ? {
          key: 'task',
          icon: <FiInbox />,
          // icon: <UploadOutlined />,
          label: 'Tasks',
          children: [
            {
              key: 'plant-task',
              label: 'Plant Tasks',
              onClick: () => navigate('/plant-task'),
            },
            {
              key: 'maintenance-task',
              label: 'Maintenance Tasks',
              onClick: () => navigate('/maintenance-task'),
            },
          ],
        }
      : null,
    {
      key: 'profile',
      icon: <FiUser />,
      label: 'Account',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <FiSettings />,
      // icon: <UserOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    userRole === 'MANAGER' ||
    userRole === 'SUPERADMIN' ||
    userRole === 'PARK_RANGER'
      ? {
          key: 'attraction',
          icon: <TbTicket />,
          label: 'Attractions',
          onClick: () => navigate('/attraction'),
        }
      : null,
      userRole === 'MANAGER' ||
      userRole === 'SUPERADMIN' ||
      userRole === 'PARK_RANGER'
        ? {
            key: 'event',
            icon: <TbCalendarEvent />,
            label: 'Events',
            onClick: () => navigate('/event'),
          }
        : null,
  ];

  return (
    <div>
      <Header items={navItems} showSidebar={showSidebar}>
        <div className="px-4 flex gap-2 items-center">
          <Logo />
          <LogoText>Lepark Admin</LogoText>
        </div>
      </Header>
      <Sidebar>
        <div className="pb-2 px-4 flex gap-2 items-center">
          <Logo />
          <LogoText>Lepark Admin</LogoText>
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
