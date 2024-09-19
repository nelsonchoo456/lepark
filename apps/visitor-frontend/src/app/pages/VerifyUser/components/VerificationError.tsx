import { resendVerificationEmail } from '@lepark/data-access';
import { Button } from 'antd';
import React, { useState } from 'react';
import { FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const VerificationError: React.FC<{ message: string }> = ({ message }) => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');
  const [resendStatus, setResendStatus] = useState(false);

  const handleReturn = () => {
    navigate('/'); // Adjust the path as needed
  };

  const handleResend = async () => {
    try {
      const response = await resendVerificationEmail(token || '');
      console.log('Resend verification email', response);
      setResendStatus(true);
    } catch (error) {
      console.error('Error resending verification email', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 mt-5 text-center">
      <FaTimesCircle className="text-red-400" size={48} />
      {resendStatus ? (
        <>
          <p className="text-lg mt-2">Verification email has been resent. Please check your inbox.</p>
          <Button onClick={handleReturn} className="mt-4 px-4 py-2 ">
            Return to Lepark
          </Button>
        </>
      ) : (
        <>
          <p className="text-lg mt-2">{message}</p>
          <Button onClick={handleResend} className="mt-4 px-4 py-2 ">
            Resend Verification Email
          </Button>
          <Button onClick={handleReturn} className="mt-4 px-4 py-2">
            Return to Lepark
          </Button>
        </>
      )}
    </div>
  );
};

export default VerificationError;
