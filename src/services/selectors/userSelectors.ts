import type { RootState } from '@services/store';
import type { TUser } from '@utils-types';

export const selectUser = (state: RootState): TUser | null => state.user.user;

export const selectIsAuthChecked = (state: RootState): boolean =>
  state.user.isAuthChecked;

export const selectUserLoading = (state: RootState): boolean => state.user.isLoading;

export const selectUserError = (state: RootState): string | null => state.user.error;
