import {
  AnnouncementsCard,
  AnnouncementsPanel,
  Divider,
  LogoText,
} from '@lepark/common-ui';
import { AnnouncementResponse, getNParksAnnouncements } from '@lepark/data-access';
import { Button, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { IoCallOutline } from 'react-icons/io5';

const { Paragraph } = Typography;

const LoginAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await getNParksAnnouncements();
        setAnnouncements(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch announcements');
        console.error('Error fetching announcements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const renderAnnouncements = () => {
    if (loading) {
      return (
        <div className="w-full min-h-[100px] flex justify-center items-center">
          <Spin />
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="w-full min-h-[100px] flex justify-center items-center text-secondary">
          Unable to load announcements.
        </div>
      );
    }
  
    if (!announcements || announcements.length === 0) {
      return (
        <div className="w-full min-h-[100px] flex justify-center items-center text-secondary">
          No announcements here.
        </div>
      );
    }
  
    return (
      <div className="w-full">
        {announcements
          .filter(announcement => announcement.status === 'ACTIVE')
          .slice(0, 3)
          .map((announcement) => (
            <div key={announcement.id} className="mb-4 p-3 bg-gray-50/80 rounded-lg">
              <div className="font-medium text-green-600">{announcement.title}</div>
              <Paragraph
                ellipsis={{
                  rows: 2,
                }}
                className="text-sm text-gray-600 mb-0"
              >
                {announcement.content}
              </Paragraph>
            </div>
          ))}
      </div>
    );
  };

  return (
    <AnnouncementsPanel>
      <AnnouncementsCard>
        <Divider className="mb-2">
          <LogoText>Announcements</LogoText>
        </Divider>
        {renderAnnouncements()}
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