import { expect, test } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

const bunName = 'Тестовая булочка';
const fillingName = 'Тестовая котлета';
const userName = 'Тестовый пользователь';
const accessToken = 'Bearer test-access-token';

const getConstructor = (page: Page): Locator =>
  page.getByRole('region', { name: 'Конструктор бургера' });

const getModalRoot = (page: Page): Locator => page.locator('#modals');

const addIngredient = async (page: Page, name: string): Promise<void> => {
  const ingredientLink = page.getByRole('link').getByText(name, { exact: true });

  await page
    .getByRole('listitem')
    .filter({ has: ingredientLink })
    .getByRole('button', { name: 'Добавить', exact: true })
    .click();
};

const addTestBurger = async (page: Page): Promise<void> => {
  await addIngredient(page, bunName);
  await addIngredient(page, fillingName);
};

const openIngredientModal = async (page: Page, name: string): Promise<Locator> => {
  await page.goto('/');
  await page.getByRole('link').getByText(name, { exact: true }).click();

  const modal = getModalRoot(page);

  await expect(modal.getByRole('heading', { name: 'Детали ингредиента' })).toBeVisible();

  return modal;
};

test.describe('Страница конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('tests/hars/constructor.har', {
      url: '**/api/**',
      notFound: 'abort',
    });
  });

  test('Добавляет булку и начинку из каталога в конструктор', async ({ page }) => {
    await page.goto('/');

    const constructor = getConstructor(page);

    await expect(constructor.getByText('Выберите булки', { exact: true })).toHaveCount(
      2
    );
    await expect(
      constructor.getByText('Выберите начинку', { exact: true })
    ).toBeVisible();

    await addTestBurger(page);

    await expect(
      constructor.getByText(bunName + ' (верх)', { exact: true })
    ).toBeVisible();
    await expect(
      constructor.getByText(bunName + ' (низ)', { exact: true })
    ).toBeVisible();
    await expect(constructor.getByText(fillingName, { exact: true })).toBeVisible();
  });

  test.describe('Детали ингредиента', () => {
    test('Показывает данные выбранной начинки в модальном окне', async ({ page }) => {
      const modal = await openIngredientModal(page, fillingName);

      await expect(page).toHaveURL('/ingredients/main-1');
      await expect(page.getByRole('heading', { name: 'Соберите бургер' })).toBeVisible();
      await expect(
        modal.getByRole('heading', { name: fillingName, exact: true })
      ).toBeVisible();

      const nutrition = [
        ['Калории, ккал', '325'],
        ['Белки, г', '21'],
        ['Жиры, г', '11'],
        ['Углеводы, г', '6'],
      ];

      for (const [label, value] of nutrition) {
        const item = modal
          .getByRole('listitem')
          .filter({ has: page.getByText(label, { exact: true }) });

        await expect(item.getByText(value, { exact: true })).toBeVisible();
      }
    });

    test('Закрывает окно по нажатию на крестик', async ({ page }) => {
      const modal = await openIngredientModal(page, bunName);

      await modal.getByRole('button', { name: 'Закрыть' }).click();

      await expect(modal).toBeEmpty();
      await expect(page).toHaveURL('/');
    });

    test('Закрывает окно при активации кнопки крестика с клавиатуры', async ({
      page,
    }) => {
      const modal = await openIngredientModal(page, bunName);

      await modal.getByRole('button', { name: 'Закрыть' }).press('Enter');

      await expect(modal).toBeEmpty();
      await expect(page).toHaveURL('/');
    });

    test('Закрывает окно по нажатию на затемнённый фон', async ({ page }) => {
      const modal = await openIngredientModal(page, bunName);

      await modal.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } });

      await expect(modal).toBeEmpty();
      await expect(page).toHaveURL('/');
    });

    test('Закрывает окно клавишей Escape', async ({ page }) => {
      const modal = await openIngredientModal(page, bunName);

      await page.keyboard.press('Escape');

      await expect(modal).toBeEmpty();
      await expect(page).toHaveURL('/');
    });

    test('По прямой ссылке показывает детали на отдельной странице', async ({
      page,
    }) => {
      await page.goto('/ingredients/bun-1');

      await expect(
        page.getByRole('heading', { name: bunName, exact: true })
      ).toBeVisible();
      await expect(page.getByText('Калории, ккал', { exact: true })).toBeVisible();
      await expect(getModalRoot(page)).toBeEmpty();
      await expect(page.getByRole('heading', { name: 'Соберите бургер' })).toHaveCount(
        0
      );
    });
  });

  test.describe('Оформление заказа', () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((token) => {
        localStorage.setItem('refreshToken', 'test-refresh-token');
        document.cookie = 'accessToken=' + encodeURIComponent(token) + '; path=/';
      }, accessToken);
    });

    test('Показывает номер заказа, очищает конструктор и закрывает подтверждение', async ({
      page,
    }) => {
      await page.goto('/');
      await expect(page.getByRole('link', { name: userName })).toBeVisible();
      await addTestBurger(page);

      const constructor = getConstructor(page);
      const [orderRequest] = await Promise.all([
        page.waitForRequest('/api/orders'),
        constructor.getByRole('button', { name: 'Оформить заказ' }).click(),
      ]);

      expect(orderRequest.method()).toBe('POST');
      expect(orderRequest.headers().authorization).toBe(accessToken);
      expect(orderRequest.postDataJSON()).toEqual({
        ingredients: ['bun-1', 'main-1', 'bun-1'],
      });

      const modal = getModalRoot(page);

      await expect(
        modal.getByRole('heading', { name: '12345', exact: true })
      ).toBeVisible();
      await expect(
        modal.getByText('Ваш заказ начали готовить', { exact: true })
      ).toBeVisible();
      await expect(constructor.getByText('Выберите булки', { exact: true })).toHaveCount(
        2
      );
      await expect(
        constructor.getByText('Выберите начинку', { exact: true })
      ).toBeVisible();
      await expect(constructor.getByText(fillingName, { exact: true })).toHaveCount(0);

      await modal.getByRole('button', { name: 'Закрыть' }).click();

      await expect(modal).toBeEmpty();
    });

    test('Показывает ошибку сервера и сохраняет собранный бургер', async ({ page }) => {
      await page.routeFromHAR('tests/hars/order-error.har', {
        url: '**/api/orders',
        notFound: 'abort',
      });
      await page.goto('/');
      await expect(page.getByRole('link', { name: userName })).toBeVisible();
      await addTestBurger(page);

      const constructor = getConstructor(page);

      await constructor.getByRole('button', { name: 'Оформить заказ' }).click();

      await expect(constructor.getByRole('alert')).toContainText(
        'Тестовая ошибка сервера'
      );
      await expect(
        constructor.getByText(bunName + ' (верх)', { exact: true })
      ).toBeVisible();
      await expect(
        constructor.getByText(bunName + ' (низ)', { exact: true })
      ).toBeVisible();
      await expect(constructor.getByText(fillingName, { exact: true })).toBeVisible();
      await expect(getModalRoot(page)).toBeEmpty();
    });
  });
});
