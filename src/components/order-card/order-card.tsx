import { OrderCardUI } from '@ui';
import { memo, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { useSelector } from '@services/store';

import type { OrderCardProps } from './type';
import type { TIngredient } from '@utils-types';

const maxIngredients = 6;

export const OrderCard = memo(function OrderCard({
  order,
}: OrderCardProps): React.JSX.Element | null {
  const location = useLocation();

  const ingredients = useSelector((state) => state.ingredients.items);

  const orderInfo = useMemo(() => {
    if (!ingredients.length) {
      return null;
    }

    const ingredientsInfo = order.ingredients.reduce<TIngredient[]>(
      (acc, ingredientId) => {
        const ingredient = ingredients.find((item) => item._id === ingredientId);

        if (ingredient) {
          acc.push(ingredient);
        }

        return acc;
      },
      []
    );

    const total = ingredientsInfo.reduce((sum, ingredient) => sum + ingredient.price, 0);

    const ingredientsToShow = ingredientsInfo.slice(0, maxIngredients);

    const remains = Math.max(ingredientsInfo.length - maxIngredients, 0);

    const date = new Date(order.createdAt);

    return {
      ...order,
      ingredientsInfo,
      ingredientsToShow,
      remains,
      total,
      date,
    };
  }, [order, ingredients]);

  if (!orderInfo) {
    return null;
  }

  return (
    <OrderCardUI
      orderInfo={orderInfo}
      maxIngredients={maxIngredients}
      locationState={{ background: location }}
    />
  );
});
