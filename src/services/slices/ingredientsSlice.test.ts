import { getIngredientsApi } from '@api';
import { configureStore } from '@reduxjs/toolkit';

import { fetchIngredients, ingredientsReducer } from './ingredientsSlice';

import type { TIngredientsState } from './ingredientsSlice';
import type { TIngredient } from '@utils-types';

jest.mock('@api', () => ({
  getIngredientsApi: jest.fn(),
}));

const mockedGetIngredientsApi = jest.mocked(getIngredientsApi);

const mockIngredient: TIngredient = {
  _id: 'ingredient-1',
  name: 'Тестовая котлета',
  type: 'main',
  proteins: 20,
  fat: 10,
  carbohydrates: 5,
  calories: 200,
  price: 150,
  image: '',
  image_large: '',
  image_mobile: '',
};

describe('ingredientsSlice', () => {
  beforeEach(() => {
    mockedGetIngredientsApi.mockReset();
  });

  test('Начальное состояние задано правильно', () => {
    const state = ingredientsReducer(undefined, {
      type: 'UNKNOWN',
    });

    expect(state).toEqual({
      items: [],
      status: 'idle',
      error: null,
    });
  });

  test('pending включает загрузку и сбрасывает предыдущую ошибку', () => {
    const failedState: TIngredientsState = {
      items: [],
      status: 'failed',
      error: 'Предыдущая ошибка',
    };
    const action = fetchIngredients.pending('request-1', undefined);

    expect(ingredientsReducer(failedState, action)).toEqual({
      items: [],
      status: 'loading',
      error: null,
    });
  });

  test('fulfilled сохраняет ингредиенты и завершает загрузку', () => {
    const loadingState = ingredientsReducer(
      undefined,
      fetchIngredients.pending('request-1', undefined)
    );
    const action = fetchIngredients.fulfilled([mockIngredient], 'request-1', undefined);

    expect(ingredientsReducer(loadingState, action)).toEqual({
      items: [mockIngredient],
      status: 'succeeded',
      error: null,
    });
  });

  test('rejected сохраняет ошибку и завершает загрузку', () => {
    const loadingState = ingredientsReducer(
      undefined,
      fetchIngredients.pending('request-1', undefined)
    );
    const action = fetchIngredients.rejected(
      new Error('Ошибка соединения с сервером'),
      'request-1',
      undefined
    );

    expect(ingredientsReducer(loadingState, action)).toEqual({
      items: [],
      status: 'failed',
      error: 'Ошибка соединения с сервером',
    });
  });

  test('rejected использует стандартное сообщение при ошибке без текста', () => {
    const action = {
      ...fetchIngredients.rejected(null, 'request-1', undefined),
      error: { name: 'NetworkError' },
    };

    expect(ingredientsReducer(undefined, action)).toEqual({
      items: [],
      status: 'failed',
      error: 'Не удалось загрузить ингредиенты',
    });
  });

  test('После ошибки можно повторно загрузить ингредиенты', async () => {
    mockedGetIngredientsApi
      .mockRejectedValueOnce(new Error('Временная ошибка'))
      .mockResolvedValueOnce([mockIngredient]);

    const store = configureStore({
      reducer: {
        ingredients: ingredientsReducer,
      },
    });

    await store.dispatch(fetchIngredients());

    expect(store.getState().ingredients.status).toBe('failed');

    await store.dispatch(fetchIngredients());

    expect(store.getState().ingredients).toEqual({
      items: [mockIngredient],
      status: 'succeeded',
      error: null,
    });

    expect(mockedGetIngredientsApi).toHaveBeenCalledTimes(2);
  });

  test('Повторный запрос не отправляется во время загрузки', async () => {
    mockedGetIngredientsApi.mockResolvedValue([mockIngredient]);

    const store = configureStore({
      reducer: {
        ingredients: ingredientsReducer,
      },
    });

    const firstRequest = store.dispatch(fetchIngredients());

    const secondRequest = store.dispatch(fetchIngredients());

    await Promise.all([firstRequest, secondRequest]);

    expect(mockedGetIngredientsApi).toHaveBeenCalledTimes(1);
  });

  test('После успешной загрузки повторный запрос не отправляется', async () => {
    mockedGetIngredientsApi.mockResolvedValue([mockIngredient]);

    const store = configureStore({
      reducer: {
        ingredients: ingredientsReducer,
      },
    });

    await store.dispatch(fetchIngredients());

    await store.dispatch(fetchIngredients());

    expect(mockedGetIngredientsApi).toHaveBeenCalledTimes(1);

    expect(store.getState().ingredients.status).toBe('succeeded');
  });
});
