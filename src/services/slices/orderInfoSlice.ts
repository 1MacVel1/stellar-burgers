import { getOrderByNumberApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TOrder } from '@utils-types';

type TOrderInfoState = {
  order: TOrder | null;
  isLoading: boolean;
  error: string | null;
  currentRequestId: string | null;
};

const initialState: TOrderInfoState = {
  order: null,
  isLoading: false,
  error: null,
  currentRequestId: null,
};

export const fetchOrderByNumber = createAsyncThunk<
  TOrder,
  number,
  { rejectValue: string }
>('orderInfo/fetchByNumber', async (number, { rejectWithValue }) => {
  try {
    const response = await getOrderByNumberApi(number);

    const order = response.orders?.[0];

    if (!response.success || !order) {
      throw new Error('Заказ не найден');
    }

    return order;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Не удалось загрузить заказ';

    return rejectWithValue(message);
  }
});

const orderInfoSlice = createSlice({
  name: 'orderInfo',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderByNumber.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.order = null;
        state.currentRequestId = action.meta.requestId;
      })

      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }

        state.order = action.payload;
        state.isLoading = false;
        state.currentRequestId = null;
      })

      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }

        state.isLoading = false;
        state.error = action.payload ?? 'Не удалось загрузить заказ';
        state.currentRequestId = null;
      });
  },
});

export const orderInfoReducer = orderInfoSlice.reducer;
