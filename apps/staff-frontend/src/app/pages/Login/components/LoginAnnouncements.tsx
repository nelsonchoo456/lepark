import { AnnouncementsCard, AnnouncementsPanel, Divider, LogoText } from '@lepark/common-ui';
import { AnnouncementResponse, getNParksAnnouncements } from '@lepark/data-access';
import { Button, Modal, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { IoCallOutline } from 'react-icons/io5';

const { Paragraph } = Typography;

const LoginAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<{
    about: boolean;
    contact: boolean;
    information: boolean;
  }>({
    about: false,
    contact: false,
    information: false,
  });

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
      return <div className="w-full min-h-[100px] flex justify-center items-center text-secondary">Unable to load announcements.</div>;
    }

    if (!announcements || announcements.length === 0) {
      return <div className="w-full min-h-[100px] flex justify-center items-center text-secondary">No announcements here.</div>;
    }

    return (
      <div className="w-full">
        {announcements
          .filter((announcement) => announcement.status === 'ACTIVE')
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

  const showModal = (type: 'about' | 'contact' | 'information') => {
    setIsModalVisible((prevState) => ({
      ...prevState,
      [type]: true,
    }));
  };

  const handleCancel = (type: 'about' | 'contact' | 'information') => {
    setIsModalVisible((prevState) => ({
      ...prevState,
      [type]: false,
    }));
  };

  return (
    <AnnouncementsPanel>
      <Modal title="About Us" visible={isModalVisible.about} onCancel={() => handleCancel('about')} footer={null}>
        <p>
          Learn about our platform, mission, and vision. We aim to enhance park operations and visitor engagement through innovative
          solutions.
        </p>
      </Modal>
      <Modal title="Contact Us" visible={isModalVisible.contact} onCancel={() => handleCancel('contact')} footer={null}>
        <p>
          For inquiries, reach out to us at <a>contact@nparks.gov.sg</a>
        </p>
      </Modal>
      <Modal title="Information" visible={isModalVisible.information} onCancel={() => handleCancel('information')} footer={null}>
        <p>
          Lepark is an <strong>enterprise management system</strong> developed for the National Parks Board (NParks) in Singapore. NParks is responsible for
          conserving, managing, and developing Singapore’s urban greenery, including parks, nature reserves, and green spaces, to foster
          biodiversity and support sustainable urban living.
        </p><br/>
        <p>
          By using Lepark, NParks strives to improve operational efficiency, promote eco-friendly practices, and engage visitors in
          Singapore’s commitment to a green and vibrant environment.
        </p>
      </Modal>
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
          {/* <Button onClick={() => showModal('about')}>About</Button> */}
          <Button onClick={() => showModal('contact')}>
            <IoCallOutline className="icon" />
            Contact
          </Button>
          <Button onClick={() => showModal('information')}>
            <IoIosInformationCircleOutline className="icon" />
            Information
          </Button>
        </div>
      </AnnouncementsCard>
    </AnnouncementsPanel>
  );
};

export default LoginAnnouncements;
