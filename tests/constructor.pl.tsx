import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

const mockBun = {
  _id: 'bun-1',
  name: 'Тестовая булочка',
  type: 'bun',
  proteins: 10,
  fat: 5,
  carbohydrates: 20,
  calories: 200,
  price: 200,
  image: '',
  image_large: '',
  image_mobile: '',
};

const mockMain = {
  _id: 'main-1',
  name: 'Тестовая котлета',
  type: 'main',
  proteins: 20,
  fat: 10,
  carbohydrates: 5,
  calories: 300,
  price: 150,
  image: '',
  image_large: '',
  image_mobile: '',
};

const mockOrder = {
  _id: 'order-1',
  number: 12345,
  name: 'Тестовый бургер',
  status: 'done',
  createdAt: '2026-10-23T10:00:00.000Z',
  updatedAt: '2026-10-23T10:00:00.000Z',
  ingredients: ['bun-1', 'main-1', 'bun-1'],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('refreshToken', 'test-refresh-token');

    document.cookie = 'accessToken=Bearer%20test-token; path=/';
  });

  await page.route('**/api/ingredients', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [mockBun, mockMain],
      }),
    });
  });

  await page.route('**/api/auth/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user: {
          name: 'Тестовый пользователь',
          email: 'test@example.com',
        },
      }),
    });
  });
});

const openConstructorPage = async (page: Page): Promise<void> => {
  const authResponse = page.waitForResponse('**/api/auth/user');

  await page.goto('/');

  await authResponse;

  await expect(page.getByText(mockBun.name)).toBeVisible();
};

const addTestBurger = async (page: Page): Promise<void> => {
  await page
    .locator('li')
    .filter({ hasText: mockBun.name })
    .getByRole('button', { name: 'Добавить' })
    .click();

  await page
    .locator('li')
    .filter({ hasText: mockMain.name })
    .getByRole('button', { name: 'Добавить' })
    .click();
};

test('Добавление ингредиентов в конструктор', async ({ page }) => {
  await openConstructorPage(page);

  await addTestBurger(page);

  await expect(page.getByText('Тестовая булочка (верх)')).toBeVisible();

  await expect(page.getByText('Тестовая булочка (низ)')).toBeVisible();

  await expect(page.getByText('Выберите начинку')).not.toBeVisible();
});

test('Успешное оформление заказа очищает конструктор', async ({ page }) => {
  let submittedIngredients: string[] = [];

  await page.route('**/api/orders', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    const requestBody = route.request().postDataJSON() as {
      ingredients: string[];
    };

    submittedIngredients = requestBody.ingredients;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        name: mockOrder.name,
        order: mockOrder,
      }),
    });
  });

  await openConstructorPage(page);

  await addTestBurger(page);

  await page.getByRole('button', { name: 'Оформить заказ' }).click();

  await expect(page.getByText('Ваш заказ начали готовить')).toBeVisible();

  expect(submittedIngredients).toEqual(['bun-1', 'main-1', 'bun-1']);

  await expect(page.getByText('Выберите булки')).toHaveCount(2);

  await expect(page.getByText('Выберите начинку')).toBeVisible();

  await page.getByRole('button', { name: 'Закрыть' }).click();

  await expect(page.getByText('Ваш заказ начали готовить')).not.toBeVisible();
});

test('Ошибка заказа не очищает конструктор', async ({ page }) => {
  await page.route('**/api/orders', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        message: 'Тестовая ошибка сервера',
      }),
    });
  });

  await openConstructorPage(page);

  await addTestBurger(page);

  await page.getByRole('button', { name: 'Оформить заказ' }).click();

  await expect(page.getByRole('alert')).toContainText('Тестовая ошибка сервера');

  await expect(page.getByText('Тестовая булочка (верх)')).toBeVisible();

  await expect(page.getByText('Тестовая булочка (низ)')).toBeVisible();

  await expect(page.getByText('Выберите начинку')).not.toBeVisible();
});
