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
      <AnnouncementsCard>
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
      </AnnouncementsCard>
    </AnnouncementsPanel>
  );
};

export default LoginAnnouncements;
