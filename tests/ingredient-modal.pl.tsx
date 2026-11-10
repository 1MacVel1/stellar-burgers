import { expect, test } from '@playwright/test';

const mockIngredient = {
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

test.beforeEach(async ({ page }) => {
  await page.route('**/api/ingredients', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [mockIngredient],
      }),
    });
  });
});

test('Нажатие на ингредиент открывает модальное окно', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText(mockIngredient.name)).toBeVisible();

  await page.getByText(mockIngredient.name).click();

  await expect(page).toHaveURL(/\/ingredients\/bun-1$/);

  await expect(page.getByRole('heading', { name: 'Детали ингредиента' })).toBeVisible();

  await expect(page.getByRole('heading', { name: mockIngredient.name })).toBeVisible();

  await expect(page.getByText('Калории, ккал')).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Соберите бургер' })).toBeVisible();
});

test('Кнопка закрытия возвращает на главную страницу', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText(mockIngredient.name)).toBeVisible();

  await page.getByText(mockIngredient.name).click();

  await expect(page.getByRole('heading', { name: 'Детали ингредиента' })).toBeVisible();

  await page.getByRole('button', { name: 'Закрыть' }).click();

  await expect(page).toHaveURL('http://localhost:4000/');

  await expect(
    page.getByRole('heading', { name: 'Детали ингредиента' })
  ).not.toBeVisible();
});

test('Escape закрывает модальное окно ингредиента', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText(mockIngredient.name)).toBeVisible();

  await page.getByText(mockIngredient.name).click();

  await expect(page.getByRole('heading', { name: 'Детали ингредиента' })).toBeVisible();

  await page.keyboard.press('Escape');

  await expect(page).toHaveURL('http://localhost:4000/');

  await expect(
    page.getByRole('heading', { name: 'Детали ингредиента' })
  ).not.toBeVisible();
});

test('Прямая ссылка открывает отдельную страницу ингредиента', async ({ page }) => {
  await page.goto('/ingredients/bun-1');

  await expect(page.getByRole('heading', { name: mockIngredient.name })).toBeVisible();

  await expect(page.getByText('Калории, ккал')).toBeVisible();

  await expect(page.getByText('Белки, г')).toBeVisible();

  await expect(page.getByText('Жиры, г')).toBeVisible();

  await expect(page.getByText('Углеводы, г')).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Соберите бургер' })).not.toBeVisible();
});
