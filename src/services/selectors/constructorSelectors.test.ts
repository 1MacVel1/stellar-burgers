import { rootReducer } from '@services/rootReducer';

import {
  selectConstructorPrice,
  selectIngredientCounters,
} from './constructorSelectors';

import type { TConstructorIngredient } from '@utils-types';

const createIngredient = (
  _id: string,
  type: string,
  price: number,
  id: string
): TConstructorIngredient => ({
  _id,
  id,
  name: `Ингредиент ${_id}`,
  type,
  proteins: 10,
  fat: 10,
  carbohydrates: 10,
  calories: 100,
  price,
  image: '',
  image_large: '',
  image_mobile: '',
});

const bun = createIngredient('bun-1', 'bun', 200, 'bun-instance');

const main = createIngredient('main-1', 'main', 150, 'main-instance');

const sauce = createIngredient('sauce-1', 'sauce', 50, 'sauce-instance');

const secondMain = createIngredient('main-1', 'main', 150, 'second-main-instance');

const initialRootState = rootReducer(undefined, {
  type: '@@INIT',
});

const createState = (
  selectedBun: TConstructorIngredient | null = null,
  ingredients: TConstructorIngredient[] = []
): ReturnType<typeof rootReducer> => ({
  ...initialRootState,
  burgerConstructor: {
    bun: selectedBun,
    ingredients,
  },
});

describe('Селектор стоимости бургера', () => {
  test('Возвращает 0 для пустого конструктора', () => {
    const state = createState();

    expect(selectConstructorPrice(state)).toBe(0);
  });

  test('Учитывает стоимость булочки дважды', () => {
    const state = createState(bun);

    expect(selectConstructorPrice(state)).toBe(400);
  });

  test('Суммирует стоимость булочки и начинок', () => {
    const state = createState(bun, [main, sauce]);

    expect(selectConstructorPrice(state)).toBe(600);
  });

  test('Считает стоимость начинок без булочки', () => {
    const state = createState(null, [main, sauce]);

    expect(selectConstructorPrice(state)).toBe(200);
  });

  test('Учитывает повторяющиеся начинки', () => {
    const state = createState(bun, [main, secondMain]);

    expect(selectConstructorPrice(state)).toBe(700);
  });
});

describe('Селектор счётчиков ингредиентов', () => {
  test('Возвращает пустой объект для пустого конструктора', () => {
    const state = createState();

    expect(selectIngredientCounters(state)).toEqual({});
  });

  test('Считает булочку дважды', () => {
    const state = createState(bun);

    expect(selectIngredientCounters(state)).toEqual({
      'bun-1': 2,
    });
  });

  test('Считает разные начинки по отдельности', () => {
    const state = createState(null, [main, sauce]);

    expect(selectIngredientCounters(state)).toEqual({
      'main-1': 1,
      'sauce-1': 1,
    });
  });

  test('Объединяет повторяющиеся начинки в один счётчик', () => {
    const state = createState(null, [main, secondMain]);

    expect(selectIngredientCounters(state)).toEqual({
      'main-1': 2,
    });
  });

  test('Одновременно считает булочку и начинки', () => {
    const state = createState(bun, [main, secondMain, sauce]);

    expect(selectIngredientCounters(state)).toEqual({
      'bun-1': 2,
      'main-1': 2,
      'sauce-1': 1,
    });
  });
});
