import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from './Spinner';

export type RedirectProps = {
  /**
   * Route to redirect to when user is not authenticated. MUST be declared
   */
  redirectTo: string;
};

export const Redirect = ({ redirectTo }: RedirectProps) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(redirectTo, { replace: true });
  }, []);
  return <Spinner />;
};
