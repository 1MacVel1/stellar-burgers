import type { RootState } from '@services/store';
import type { TOrder } from '@utils-types';

export const selectFeed = (state: RootState): RootState['feed'] => state.feed;

export const selectFeedOrders = (state: RootState): TOrder[] => state.feed.orders;

export const selectFeedLoading = (state: RootState): boolean => state.feed.isLoading;

export const selectFeedError = (state: RootState): string | null => state.feed.error;
