import type { RootState } from '@services/store';
import type { TIngredient } from '@utils-types';

export const selectIngredients = (state: RootState): TIngredient[] =>
  state.ingredients.items;

export const selectIngredientsStatus = (
  state: RootState
): RootState['ingredients']['status'] => state.ingredients.status;

export const selectIngredientsLoading = (state: RootState): boolean =>
  state.ingredients.status === 'loading';

export const selectIngredientsError = (
  state: RootState
): RootState['ingredients']['error'] => state.ingredients.error;
