import { Spinner } from './Spinner';
import { useAuth } from './AuthContext';
import { Redirect } from './Redirect';
import { PropsWithChildren } from 'react';

export type ProtectedRouteProps = {
  redirectTo: string;
};

/**
 * Page wrapper that renders children only if the user state has been set.
 * Otherwise, will redirect to the route passed into the `redirectTo` prop.
 *
 * @note There is no authentication being performed by this component. This component is merely a wrapper that checks for the presence of the login flag in cookies.
 */
export const ProtectedRoute = ({ redirectTo, children }: PropsWithChildren<ProtectedRouteProps>): React.ReactElement => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }

  if (!user) {
    return <Redirect redirectTo={redirectTo} />;
  }

  return <>{children}</>;
};
