import { getFeedsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TOrder, TOrdersData } from '@utils-types';

type TFeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  isLoading: boolean;
  error: string | null;
};

const initialState: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null,
};

export const fetchFeed = createAsyncThunk<TOrdersData, void, { rejectValue: string }>(
  'feed/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getFeedsApi();

      return {
        orders: response.orders,
        total: response.total,
        totalToday: response.totalToday,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось загрузить ленту заказов';

      return rejectWithValue(message);
    }
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.isLoading = false;

        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })

      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;

        state.error = action.payload ?? 'Ошибка загрузки заказов';
      });
  },
});

export const feedReducer = feedSlice.reducer;
