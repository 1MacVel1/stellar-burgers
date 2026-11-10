import {
  addIngredient,
  clearConstructor,
  constructorReducer,
  moveIngredient,
  removeIngredient,
} from './constructorSlice';

import type { TIngredient } from '@utils-types';

const bun: TIngredient = {
  _id: 'bun-1',
  name: 'Тестовая булка',
  type: 'bun',
  proteins: 10,
  fat: 5,
  carbohydrates: 20,
  calories: 150,
  price: 100,
  image: '',
  image_large: '',
  image_mobile: '',
};

const secondBun: TIngredient = {
  ...bun,
  _id: 'bun-2',
  name: 'Другая булка',
  price: 200,
};

const sauce: TIngredient = {
  ...bun,
  _id: 'sauce-1',
  name: 'Тестовый соус',
  type: 'sauce',
  price: 30,
};

const main: TIngredient = {
  ...bun,
  _id: 'main-1',
  name: 'Тестовая котлета',
  type: 'main',
  price: 150,
};

describe('constructorSlice', () => {
  test('возвращает начальное состояние', () => {
    const state = constructorReducer(undefined, { type: 'unknown' });

    expect(state).toEqual({
      bun: null,
      ingredients: [],
    });
  });

  test('добавляет булку', () => {
    const state = constructorReducer(undefined, addIngredient(bun));

    expect(state.bun?._id).toBe(bun._id);
    expect(state.ingredients).toHaveLength(0);
  });

  test('заменяет предыдущую булку новой', () => {
    const firstState = constructorReducer(undefined, addIngredient(bun));

    const secondState = constructorReducer(firstState, addIngredient(secondBun));

    expect(secondState.bun?._id).toBe(secondBun._id);
    expect(secondState.ingredients).toHaveLength(0);
  });

  test('добавляет начинку', () => {
    const state = constructorReducer(undefined, addIngredient(sauce));

    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0]._id).toBe(sauce._id);
  });

  test('создаёт уникальные ID для одинаковых ингредиентов', () => {
    const firstState = constructorReducer(undefined, addIngredient(sauce));

    const secondState = constructorReducer(firstState, addIngredient(sauce));

    expect(secondState.ingredients).toHaveLength(2);

    expect(secondState.ingredients[0].id).not.toBe(secondState.ingredients[1].id);
  });

  test('удаляет только выбранный экземпляр ингредиента', () => {
    let state = constructorReducer(undefined, addIngredient(sauce));

    state = constructorReducer(state, addIngredient(sauce));

    const firstId = state.ingredients[0].id;
    const secondId = state.ingredients[1].id;

    state = constructorReducer(state, removeIngredient(firstId));

    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0].id).toBe(secondId);
  });

  test('изменяет порядок ингредиентов', () => {
    let state = constructorReducer(undefined, addIngredient(sauce));

    state = constructorReducer(state, addIngredient(main));

    state = constructorReducer(
      state,
      moveIngredient({
        fromIndex: 0,
        toIndex: 1,
      })
    );

    expect(state.ingredients[0]._id).toBe(main._id);
    expect(state.ingredients[1]._id).toBe(sauce._id);
  });

  test('очищает конструктор', () => {
    let state = constructorReducer(undefined, addIngredient(bun));

    state = constructorReducer(state, addIngredient(main));

    state = constructorReducer(state, clearConstructor());

    expect(state).toEqual({
      bun: null,
      ingredients: [],
    });
  });
});
