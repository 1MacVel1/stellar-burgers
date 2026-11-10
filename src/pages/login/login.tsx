import { selectUserError } from '@selectors/userSelectors';
import { clearUserError, loginUser } from '@slices/userSlice';
import { LoginUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { Location } from 'react-router-dom';

type TLocationState = {
  from?: Location;
};

export const Login = (): React.JSX.Element => {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();

  const error = useSelector(selectUserError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    const locationState = location.state as TLocationState | null;
    const from = locationState?.from;

    const target = from ? `${from.pathname}${from.search}${from.hash}` : '/';

    void dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => {
        void navigate(target, { replace: true });
      })
      .catch(() => {
        // Ошибка отображается через Redux.
      });
  };

  return (
    <LoginUI
      errorText={error ?? undefined}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
