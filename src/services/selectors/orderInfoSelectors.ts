import type { RootState } from '@services/store';
import type { TOrder } from '@utils-types';

export const selectOrderInfo = (state: RootState): TOrder | null =>
  state.orderInfo.order;

export const selectOrderInfoLoading = (state: RootState): boolean =>
  state.orderInfo.isLoading;

export const selectOrderInfoError = (state: RootState): string | null =>
  state.orderInfo.error;
