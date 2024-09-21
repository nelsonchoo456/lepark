import { Button } from 'antd';
import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface VerificationSuccessProps {
  message?: string;
}

const VerificationSuccess: React.FC<VerificationSuccessProps> = ({ message }) => {

  const navigate = useNavigate();

  const handleReturn = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 mt-5 text-center">
      <FaCheckCircle className="text-green-500" size={48} />
      <p className="text-lg mt-2">{message || 'Your email has been verified successfully!'}</p>
      <Button onClick={handleReturn} className="mt-4 px-4 py-2">
        Login to Lepark
      </Button>
    </div>
  );
};

export default VerificationSuccess;
