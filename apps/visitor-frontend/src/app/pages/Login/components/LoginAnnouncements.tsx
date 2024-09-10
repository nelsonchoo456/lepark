import {
  AnnouncementsCard,
  AnnouncementsPanel,
  Divider,
  LogoText,
} from '@lepark/common-ui';
import { Button } from 'antd';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { IoCallOutline } from 'react-icons/io5';

const LoginAnnouncements = () => {
  return (
    <AnnouncementsPanel>
      <AnnouncementsCard className="relative overflow-hidden">
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url('https://media.timeout.com/images/105739621/750/562/image.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            overflow: 'hidden',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
        <div className="w-full h-full bg-green-600 overflow-hidden absolute top-0 left-0 opacity-75"/>
        {/* <div className='z-10 w-full bg-white p-4 mb-4 rounded bg-opacity-80'>
          Image from Botanic Gardens
        </div> */}
        <div className='z-10 w-full bg-white p-4 rounded bg-opacity-80'>
          <Divider className="mb-2">
            <LogoText>Announcements</LogoText>
          </Divider>
          <div className="w-full flex justify-center text-secondary">
            No announcements here.
          </div>
          <br />
          <Divider className="mb-2">
            <LogoText>Resources</LogoText>
          </Divider>
          <div className="w-full flex gap-2">
            <Button>About</Button>
            <Button>
              <IoCallOutline className="icon" />
              Contact
            </Button>
            <Button>
              <IoIosInformationCircleOutline className="icon" />
              Information
            </Button>
          </div>
        </div>
      </AnnouncementsCard>
    </AnnouncementsPanel>
  );
};

export default LoginAnnouncements;
