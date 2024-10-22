import { LogoText } from '@lepark/common-ui';
import { AnnouncementResponse } from '@lepark/data-access';
import { Card, Typography, Empty, Button, Flex } from 'antd';
import { MdOutlineAnnouncement } from 'react-icons/md';
import { sectionHeader, sectionHeaderIconStyles } from '../Manager/ManagerMainLanding';
import { useNavigate } from 'react-router-dom';

interface AnnouncementsCardProps {
  announcements: AnnouncementResponse[];
}
const AnnouncementsCard = ({ announcements }: AnnouncementsCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="w-full h-86 flex-[1] overflow-y-scroll" styles={{ body: { padding: '1rem' } }}>
      <div className={sectionHeader} onClick={() => navigate("/announcement")}>
        <div className={`${sectionHeaderIconStyles} bg-red-400 text-white`}>
          <MdOutlineAnnouncement />
        </div>
        <LogoText className="text-lg mb-2">Announcements</LogoText>
      </div>
      {announcements?.length > 0 ? (
        announcements.map((announcement: AnnouncementResponse) => (
          <div className="w-full hover:bg-green-50/20 px-2 pt-2 border-b-[1px] cursor-pointer hover:bg-green-50/50" key={announcement.id}>
            <strong className="text-green-400 hover:text-green-200">{announcement.title}</strong>
            <Typography.Paragraph
              ellipsis={{
                rows: 1,
              }}
            >
              {announcement.content}
            </Typography.Paragraph>
          </div>
        ))
      ) : (
        <Empty />
      )}
      <Button type="text" className='text-green-400' block onClick={() => navigate('/announcement')}>View More</Button>
    </Card>
  );
};

export default AnnouncementsCard;
