import type { RootState } from '@services/store';
import type { TOrder } from '@utils-types';

export const selectOrder = (state: RootState): TOrder | null => state.order.order;

export const selectOrderLoading = (state: RootState): boolean => state.order.isLoading;

export const selectOrderError = (state: RootState): string | null => state.order.error;
