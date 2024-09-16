import {
  AnnouncementsCard,
  AnnouncementsPanel,
  Divider,
  LogoText,
} from '@lepark/common-ui';
import { getRandomParkImage } from '@lepark/data-access';
import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { IoCallOutline } from 'react-icons/io5';

const LoginAnnouncements = () => {
  const [parkImages, setParkImages] = useState<string[]>([]);

  useEffect(() => {
    fetchRandomParkImage();
  },[])

  const fetchRandomParkImage = async () => {
    const imageRes = await getRandomParkImage();
    if (imageRes.status === 200) {
      const imageData = imageRes.data;
      setParkImages(imageData)
    }
  }

  return (
    <AnnouncementsPanel>
      <AnnouncementsCard className="relative overflow-hidden">
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url('${parkImages && parkImages.length > 0 ? parkImages[0] : ""}')`,
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
