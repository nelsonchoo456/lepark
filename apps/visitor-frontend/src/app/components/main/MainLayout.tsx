import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { SCREEN_LG } from '../../config/breakpoints';
import { Content, Header, ListItemType, Logo, LogoText, MobileContent, MobileSidebar, Sidebar } from '@lepark/common-ui';
import { BottomNavBar } from './BottomNavBar';
import { FiHome, FiMoreHorizontal, FiUser } from 'react-icons/fi';
import { GrMapLocation } from 'react-icons/gr';
import { Button, Divider, Drawer, Flex, List, Menu } from 'antd';
import { usePark } from '../../park-context/ParkContext';
import { PiPlant, PiStarFill } from 'react-icons/pi';
import styled from 'styled-components';
import { IoClose, IoLeafSharp, IoMenu } from 'react-icons/io5';
import { FaQuestion, FaTent } from 'react-icons/fa6';
import { MdEvent, MdFeedback } from 'react-icons/md';
import { BiSolidLandmark } from 'react-icons/bi';
import { BsTicket } from 'react-icons/bs';
import { TbTicket } from 'react-icons/tb';
import { COLORS } from '../../config/colors';

const BottomMenu = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: 4rem;
  // height: 50%;
  background: white;
  z-index: 900; // Ensure it's under the BottomNavBar
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
  transform: translateY(100%);
  transition: transform 0.3s ease-in-out;

  &.open {
    transform: translateY(0);
  }
`;

const MainLayout = () => {
  const [showSidebar, setShowSidebar] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPark } = usePark();
  const [isOthersMenuOpen, setIsOthersMenuOpen] = useState(false); // State for "Others" menu
  const bottomMenuRef = useRef(null);

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
      icon: <FiHome style={{ fontSize: '1.5rem' }} />,
      label: 'Home',
      onClick: () => navigate('/'),
    },
    {
      key: 'discover',
      icon: <PiPlant style={{ fontSize: '1.5rem' }} />,
      label: 'Taxonomy',
      onClick: () => navigate('/discover'),
    },
    {
      key: 'map',
      icon: <GrMapLocation style={{ fontSize: '1.5rem' }} />,
      label: 'Map',
      onClick: () => navigate('/map'),
    },
    // {
    //   key: 'others',
    //   icon: <FiUser style={{ fontSize: "1.5rem" }}/>,
    //   label: 'Others',
    //   onClick: () => setIsOthersMenuOpen(true),
    // },
    // {
    //   key: 'account',
    //   icon: <FiUser style={{ fontSize: "1.5rem" }}/>,
    //   label: 'Account',
    //   onClick: () => navigate('/profile'),
    // },
  ];

  if (selectedPark) {
    navItems.push({
      key: 'others',
      icon: <IoMenu style={{ fontSize: '1.5rem' }} />,
      label: 'Others',
      onClick: () => setIsOthersMenuOpen(true),
    });
  } else {
    navItems.push({
      key: 'account',
      icon: <FiUser style={{ fontSize: '1.5rem' }} />,
      label: 'Account',
      onClick: () => navigate('/profile'),
    });
  }

  const handleCloseMenu = () => {
    setIsOthersMenuOpen(false);
  };

  const listData = [
    { title: <span style={{ fontSize: '1rem' }}>Attractions</span>, icon: <BiSolidLandmark style={{ color: '#FFC107', fontSize: '1.2rem' }} />, route: `/attractions/park/${selectedPark?.id}` },
    { title: <span style={{ fontSize: '1rem' }}>Facilities</span>, icon: <FaTent style={{ color: '#38BDF8', fontSize: '1.2rem' }} />, route: `/facility/park/${selectedPark?.id}` },
    { title: <span style={{ fontSize: '1rem' }}>Events</span>, icon: <PiStarFill style={{ color: '#6EE7B7', fontSize: '1.2rem' }} />, route: `/event/park/${selectedPark?.id}` },
    { title: <span style={{ fontSize: '1rem' }}>Sustainability Efforts</span>, icon: <IoLeafSharp style={{ color: COLORS.green[400], fontSize: '1.2rem' }} />, route: '/support' },
    { title: <span style={{ fontSize: '1rem' }}>FAQ</span>, icon: <FaQuestion style={{ fontSize: '1.2rem' }} />, route: '/support' },
    { title: <span style={{ fontSize: '1rem' }}>Feedback</span>, icon: <MdFeedback style={{ fontSize: '1.2rem' }} />, route: '/support' },
    { title: <span style={{ fontSize: '1rem' }}>Account</span>, icon: <FiUser style={{ fontSize: '1.2rem' }} />, route: '/profile' },
    { title: <span style={{ fontSize: '1rem' }}>My Tickets</span>, icon: <TbTicket style={{ fontSize: '1.2rem' }} />, route: '/support' },
  ];

  return (
    <div>
      <Header showSidebar={showSidebar}>
        <div className="px-4 flex gap-2 items-center">
          <Logo />
          {selectedPark ? <LogoText>{selectedPark.name}</LogoText> : <LogoText>Lepark</LogoText>}
        </div>
      </Header>
      <MobileSidebar>
        <div className="flex justify-center pb-4">
          <Logo size={2.5} />
        </div>
        <div className="flex flex-col">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => item.onClick && item.onClick()}
              className="flex flex-col items-center py-1 mb-4 text-center hover:text-green-200 transition-all duration-300"
            >
              <div className="p-1 rounded-full hover:bg-green-200 hover:text-white transition-all duration-300 ease-out hover:scale-110">
                {item.icon}
              </div>
              {item.label !== 'Others' && <div className="text-sm">{item.label}</div>}
            </button>
          ))}
        </div>
      </MobileSidebar>
      <MobileContent $showSidebar={showSidebar}>
        <Outlet />
      </MobileContent>
      <BottomNavBar items={navItems} showSidebar={showSidebar} />
      <BottomMenu ref={bottomMenuRef} className={isOthersMenuOpen ? 'open' : ''}>
        <Flex justify='space-between' className='p-4'>
          <div className='flex gap-4 items-center'>
            <IoMenu className='text-xl'/>
            <strong>Others</strong>
          </div>
        <Button onClick={handleCloseMenu} icon={<IoClose className='text-xl'/>} shape="circle" type='link'></Button></Flex>
        <List
          dataSource={listData}
          // className='pt-8'
          renderItem={item => (
            <List.Item 
              onClick={() => navigate(item.route)}
              style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', padding: "1rem", cursor: "pointer" }} // Set text to match text-2xl
            >
              <List.Item.Meta
                avatar={item.icon}
                title={item.title}
              />
            </List.Item>
          )}
        />
        {/* <Menu>
          <Menu.Item
            icon={<BiSolidLandmark style={{ color: COLORS.mustard[400], fontSize: '1.2rem' }} />}
            onClick={() => navigate('/settings')}
            style={{ fontSize: '1rem' }} // Setting font size for Attractions
          >
            Attractions
          </Menu.Item>
          <Menu.Item
            icon={<FaTent style={{ color: '#38BDF8', fontSize: '1.2rem' }} />}
            onClick={() => navigate('/support')}
            style={{ fontSize: '1rem' }} // Setting font size for Facilities
          >
            Facilities
          </Menu.Item>
          <Menu.Item
            icon={<PiStarFill style={{ color: '#6EE7B7', fontSize: '1.2rem' }} />}
            onClick={() => navigate('/support')}
            style={{ fontSize: '1rem' }} // Setting font size for Events
          >
            Events
          </Menu.Item>
          <Menu.Item
            icon={<FaQuestion style={{ fontSize: '1.2rem' }} />}
            onClick={() => navigate('/support')}
            style={{ fontSize: '1rem' }} // Setting font size for FAQ
          >
            FAQ
          </Menu.Item>
          <Menu.Item
            icon={<MdFeedback style={{ fontSize: '1.2rem' }} />}
            onClick={() => navigate('/support')}
            style={{ fontSize: '1rem' }} // Setting font size for Feedback
          >
            Feedback
          </Menu.Item>
          <Menu.Item
            icon={<FiUser style={{ fontSize: '1.2rem' }} />}
            onClick={() => navigate('/profile')}
            style={{ fontSize: '1rem' }} // Setting font size for Account
          >
            Account
          </Menu.Item>
          <Menu.Item
            icon={<TbTicket style={{ fontSize: '1.2rem' }} />}
            onClick={() => navigate('/support')}
            style={{ fontSize: '1rem' }} // Setting font size for My Tickets
          >
            My Tickets
          </Menu.Item>
        </Menu> */}
      </BottomMenu>
    </div>
  );
};

export default MainLayout;
