import {
  selectUser,
  selectUserError,
  selectUserLoading,
} from '@selectors/userSelectors';
import { updateUser } from '@slices/userSlice';
import { ProfileUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';

import { useDispatch, useSelector } from '@services/store';

import type { TRegisterData } from '@api';

export const Profile = (): React.JSX.Element => {
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const error = useSelector(selectUserError);
  const isLoading = useSelector(selectUserLoading);

  const [formValue, setFormValue] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      setFormValue({
        name: user.name,
        email: user.email,
        password: '',
      });
    }
  }, [user]);

  const isFormChanged =
    formValue.name !== (user?.name ?? '') ||
    formValue.email !== (user?.email ?? '') ||
    Boolean(formValue.password);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    if (!user || isLoading) {
      return;
    }

    const changes: Partial<TRegisterData> = {};

    if (formValue.name !== user.name) {
      changes.name = formValue.name;
    }

    if (formValue.email !== user.email) {
      changes.email = formValue.email;
    }

    if (formValue.password) {
      changes.password = formValue.password;
    }

    void dispatch(updateUser(changes))
      .unwrap()
      .then(() => {
        setFormValue((previous) => ({
          ...previous,
          password: '',
        }));
      })
      .catch(() => {
        // Ошибка уже сохранена в Redux.
      });
  };

  const handleCancel = (e: SyntheticEvent): void => {
    e.preventDefault();

    setFormValue({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormValue((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
      updateUserError={error ?? undefined}
    />
  );
};
