import { selectIsAuthChecked, selectUser } from '@selectors/userSelectors';
import { Preloader } from '@ui';
import { Navigate, useLocation } from 'react-router-dom';

import { useSelector } from '@services/store';

import type { ReactElement } from 'react';
import type { Location } from 'react-router-dom';

type TProtectedRouteProps = {
  children: ReactElement;
  onlyUnAuth?: boolean;
};

type TLocationState = {
  from?: Location;
};

export const ProtectedRoute = ({
  children,
  onlyUnAuth = false,
}: TProtectedRouteProps): React.JSX.Element => {
  const user = useSelector(selectUser);
  const isAuthChecked = useSelector(selectIsAuthChecked);

  const location = useLocation();

  const locationState = location.state as TLocationState | null;
  const from = locationState?.from;

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (onlyUnAuth && user) {
    const target = from ? `${from.pathname}${from.search}${from.hash}` : '/';

    return <Navigate to={target} replace />;
  }

  if (!onlyUnAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
