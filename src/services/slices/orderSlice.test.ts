import { orderBurgerApi } from '@api';
import { configureStore } from '@reduxjs/toolkit';

import { createOrder, orderReducer, resetOrder } from './orderSlice';

import type { TOrder } from '@utils-types';

jest.mock('@api', () => ({
  orderBurgerApi: jest.fn(),
}));

const mockedOrderBurgerApi = jest.mocked(orderBurgerApi);

const ingredientIds = ['bun-1', 'main-1', 'sauce-1', 'bun-1'];

const mockOrder: TOrder = {
  _id: 'order-1',
  number: 12345,
  name: 'Космический бургер',
  status: 'done',
  createdAt: '2026-10-23T10:00:00.000Z',
  updatedAt: '2026-10-23T10:00:00.000Z',
  ingredients: ingredientIds,
};

const mockResponse = {
  success: true,
  name: mockOrder.name,
  order: mockOrder,
};

describe('orderSlice', () => {
  beforeEach(() => {
    mockedOrderBurgerApi.mockReset();
  });

  test('Начальное состояние задано правильно', () => {
    const state = orderReducer(undefined, {
      type: '@@INIT',
    });

    expect(state).toEqual({
      order: null,
      isLoading: false,
      error: null,
    });
  });

  test('При отправке заказа включается состояние загрузки', async () => {
    mockedOrderBurgerApi.mockResolvedValue(mockResponse);

    const store = configureStore({
      reducer: {
        order: orderReducer,
      },
    });

    const request = store.dispatch(createOrder(ingredientIds));

    expect(store.getState().order.isLoading).toBe(true);
    expect(store.getState().order.error).toBeNull();
    expect(store.getState().order.order).toBeNull();

    await request;
  });

  test('При успешном запросе заказ сохраняется в Redux', async () => {
    mockedOrderBurgerApi.mockResolvedValue(mockResponse);

    const store = configureStore({
      reducer: {
        order: orderReducer,
      },
    });

    await store.dispatch(createOrder(ingredientIds));

    expect(store.getState().order).toEqual({
      order: mockOrder,
      isLoading: false,
      error: null,
    });

    expect(mockedOrderBurgerApi).toHaveBeenCalledTimes(1);

    expect(mockedOrderBurgerApi).toHaveBeenCalledWith(ingredientIds);
  });

  test('При ошибке сервера сохраняется сообщение об ошибке', async () => {
    mockedOrderBurgerApi.mockRejectedValue(new Error('Не удалось связаться с сервером'));

    const store = configureStore({
      reducer: {
        order: orderReducer,
      },
    });

    await store.dispatch(createOrder(ingredientIds));

    expect(store.getState().order).toEqual({
      order: null,
      isLoading: false,
      error: 'Не удалось связаться с сервером',
    });
  });

  test('Для неизвестной ошибки используется стандартное сообщение', async () => {
    mockedOrderBurgerApi.mockRejectedValue('Неизвестная ошибка');

    const store = configureStore({
      reducer: {
        order: orderReducer,
      },
    });

    await store.dispatch(createOrder(ingredientIds));

    expect(store.getState().order).toEqual({
      order: null,
      isLoading: false,
      error: 'Не удалось оформить заказ',
    });
  });

  test('После ошибки заказ можно отправить повторно', async () => {
    mockedOrderBurgerApi
      .mockRejectedValueOnce(new Error('Временная ошибка'))
      .mockResolvedValueOnce(mockResponse);

    const store = configureStore({
      reducer: {
        order: orderReducer,
      },
    });

    await store.dispatch(createOrder(ingredientIds));

    expect(store.getState().order.error).toBe('Временная ошибка');

    await store.dispatch(createOrder(ingredientIds));

    expect(store.getState().order).toEqual({
      order: mockOrder,
      isLoading: false,
      error: null,
    });

    expect(mockedOrderBurgerApi).toHaveBeenCalledTimes(2);
  });

  test('resetOrder очищает данные оформленного заказа', async () => {
    mockedOrderBurgerApi.mockResolvedValue(mockResponse);

    const store = configureStore({
      reducer: {
        order: orderReducer,
      },
    });

    await store.dispatch(createOrder(ingredientIds));

    expect(store.getState().order.order).toEqual(mockOrder);

    store.dispatch(resetOrder());

    expect(store.getState().order).toEqual({
      order: null,
      isLoading: false,
      error: null,
    });
  });
});
