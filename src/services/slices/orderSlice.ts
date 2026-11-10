import { orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TOrder } from '@utils-types';

type TOrderState = {
  order: TOrder | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: TOrderState = {
  order: null,
  isLoading: false,
  error: null,
};

export const createOrder = createAsyncThunk<TOrder, string[], { rejectValue: string }>(
  'order/create',
  async (ingredientIds, { rejectWithValue }) => {
    try {
      const response = await orderBurgerApi(ingredientIds);

      return response.order;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось оформить заказ';

      return rejectWithValue(message);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,

  reducers: {
    resetOrder: (state) => {
      state.order = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.order = null;
      })

      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload;
      })

      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Не удалось оформить заказ';
      });
  },
});

export const { resetOrder } = orderSlice.actions;

export const orderReducer = orderSlice.reducer;
