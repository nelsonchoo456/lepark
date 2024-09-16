import { ContentWrapperDark } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';
import { IoIosInformationCircle } from 'react-icons/io';

const Settings = () => {
  const navigate = useNavigate();

  return (
    <ContentWrapperDark className='h-screen flex items-center justify-center'>
      <Result
        icon={<IoIosInformationCircle className='text-5xl mx-auto text-mustard-500/50'/>}
        title="Coming Soon"
        subTitle="Settings Page coming soon."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Return to Home Page
          </Button>
        }
      />
    </ContentWrapperDark>
  );
};

export default Settings;