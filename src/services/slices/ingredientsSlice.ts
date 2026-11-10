import { getIngredientsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TIngredient } from '@utils-types';

export type TIngredientsStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export type TIngredientsState = {
  items: TIngredient[];
  status: TIngredientsStatus;
  error: string | null;
};

const initialState: TIngredientsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchIngredients = createAsyncThunk<TIngredient[], void>(
  'ingredients/fetchIngredients',
  () => getIngredientsApi(),
  {
    condition: (_, { getState }) => {
      const state = getState() as { ingredients: TIngredientsState };

      return (
        state.ingredients.status === 'idle' || state.ingredients.status === 'failed'
      );
    },
  }
);

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Не удалось загрузить ингредиенты';
      });
  },
});

export const ingredientsReducer = ingredientsSlice.reducer;
