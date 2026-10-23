import { createSlice, nanoid } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  TIngredient,
  TConstructorIngredient,
  TConstructorState,
} from '@utils-types';

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      reducer(state, action: PayloadAction<TConstructorIngredient>) {
        const ingredient = action.payload;

        if (ingredient.type === 'bun') {
          state.bun = ingredient;
        } else {
          state.ingredients.push(ingredient);
        }
      },

      prepare(ingredient: TIngredient) {
        return {
          payload: {
            ...ingredient,
            id: nanoid(),
          },
        };
      },
    },

    removeIngredient(state, action: PayloadAction<string>) {
      state.ingredients = state.ingredients.filter(
        (ingredient) => ingredient.id !== action.payload
      );
    },

    moveIngredient(
      state,
      action: PayloadAction<{
        fromIndex: number;
        toIndex: number;
      }>
    ) {
      const { fromIndex, toIndex } = action.payload;

      const ingredients = state.ingredients;

      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= ingredients.length ||
        toIndex >= ingredients.length ||
        fromIndex === toIndex
      ) {
        return;
      }

      const [movedIngredient] = ingredients.splice(fromIndex, 1);

      ingredients.splice(toIndex, 0, movedIngredient);
    },

    clearConstructor(state) {
      state.bun = null;
      state.ingredients = [];
    },
  },
});

export const { addIngredient, removeIngredient, moveIngredient, clearConstructor } =
  constructorSlice.actions;

export const constructorReducer = constructorSlice.reducer;
