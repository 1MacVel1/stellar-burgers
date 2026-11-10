import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@services/store';
import type { TConstructorState } from '@utils-types';

export const selectConstructorItems = (state: RootState): TConstructorState =>
  state.burgerConstructor;

export const selectConstructorPrice = createSelector(
  [selectConstructorItems],
  (constructorItems): number => {
    const bunPrice = constructorItems.bun ? constructorItems.bun.price * 2 : 0;

    const ingredientsPrice = constructorItems.ingredients.reduce(
      (total, ingredient) => total + ingredient.price,
      0
    );

    return bunPrice + ingredientsPrice;
  }
);

export const selectIngredientCounters = createSelector(
  [selectConstructorItems],
  (constructorItems): Record<string, number> => {
    const counters: Record<string, number> = {};

    if (constructorItems.bun) {
      counters[constructorItems.bun._id] = 2;
    }

    constructorItems.ingredients.forEach((ingredient) => {
      counters[ingredient._id] = (counters[ingredient._id] ?? 0) + 1;
    });

    return counters;
  }
);
