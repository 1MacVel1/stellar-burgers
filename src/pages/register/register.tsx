import { selectUserError } from '@selectors/userSelectors';
import { clearUserError, registerUser } from '@slices/userSlice';
import { RegisterUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

export const Register = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const error = useSelector(selectUserError);

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    void dispatch(
      registerUser({
        name: userName,
        email,
        password,
      })
    )
      .unwrap()
      .then(() => {
        void navigate('/', { replace: true });
      })
      .catch(() => {
        // Текст ошибки берётся из Redux.
      });
  };

  return (
    <RegisterUI
      errorText={error ?? undefined}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
