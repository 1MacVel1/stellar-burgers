import type { RootState } from '@services/store';
import type { TOrder } from '@utils-types';

export const selectProfileOrders = (state: RootState): TOrder[] =>
  state.profileOrders.orders;

export const selectProfileOrdersLoading = (state: RootState): boolean =>
  state.profileOrders.isLoading;

export const selectProfileOrdersError = (state: RootState): string | null =>
  state.profileOrders.error;
