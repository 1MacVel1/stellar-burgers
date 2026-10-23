import { getOrdersApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { logoutUser } from './userSlice';

import type { TOrder } from '@utils-types';

type TProfileOrdersState = {
  orders: TOrder[];
  isLoading: boolean;
  error: string | null;
};

const initialState: TProfileOrdersState = {
  orders: [],
  isLoading: false,
  error: null,
};

export const fetchProfileOrders = createAsyncThunk<
  TOrder[],
  void,
  { rejectValue: string }
>('profileOrders/fetch', async (_, { rejectWithValue }) => {
  try {
    return await getOrdersApi();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Не удалось загрузить историю заказов';

    return rejectWithValue(message);
  }
});

const profileOrdersSlice = createSlice({
  name: 'profileOrders',
  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(fetchProfileOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })

      .addCase(fetchProfileOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Ошибка загрузки истории заказов';
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.orders = [];
        state.error = null;
      })

      .addCase(logoutUser.rejected, (state) => {
        state.orders = [];
        state.error = null;
      });
  },
});

export const profileOrdersReducer = profileOrdersSlice.reducer;
