import { getIngredientsApi } from '@api';
import { configureStore } from '@reduxjs/toolkit';

import { fetchIngredients, ingredientsReducer } from './ingredientsSlice';

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
      type: '@@INIT',
    });

    expect(state).toEqual({
      items: [],
      status: 'idle',
      error: null,
    });
  });

  test('При запуске запроса устанавливается статус loading', async () => {
    mockedGetIngredientsApi.mockResolvedValue([mockIngredient]);

    const store = configureStore({
      reducer: {
        ingredients: ingredientsReducer,
      },
    });

    const request = store.dispatch(fetchIngredients());

    expect(store.getState().ingredients.status).toBe('loading');
    expect(store.getState().ingredients.error).toBeNull();

    await request;
  });

  test('При успешном запросе ингредиенты сохраняются в Redux', async () => {
    mockedGetIngredientsApi.mockResolvedValue([mockIngredient]);

    const store = configureStore({
      reducer: {
        ingredients: ingredientsReducer,
      },
    });

    await store.dispatch(fetchIngredients());

    expect(store.getState().ingredients).toEqual({
      items: [mockIngredient],
      status: 'succeeded',
      error: null,
    });

    expect(mockedGetIngredientsApi).toHaveBeenCalledTimes(1);
  });

  test('При ошибке запроса устанавливается статус failed', async () => {
    mockedGetIngredientsApi.mockRejectedValue(new Error('Ошибка соединения с сервером'));

    const store = configureStore({
      reducer: {
        ingredients: ingredientsReducer,
      },
    });

    await store.dispatch(fetchIngredients());

    expect(store.getState().ingredients).toEqual({
      items: [],
      status: 'failed',
      error: 'Ошибка соединения с сервером',
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
