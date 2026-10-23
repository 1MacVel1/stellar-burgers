import { Button } from '@krgaa/react-developer-burger-ui-components';
import { selectOrderInfo, selectOrderInfoError } from '@selectors/orderInfoSelectors';
import { fetchOrderByNumber } from '@slices/orderInfoSlice';
import { OrderInfoUI, Preloader } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { TIngredient } from '@utils-types';

type TIngredientWithCount = TIngredient & {
  count: number;
};

export const OrderInfo = (): React.JSX.Element => {
  const dispatch = useDispatch();

  const { number } = useParams();

  const orderNumber = Number(number);

  const isValidNumber =
    Boolean(number && /^\d+$/.test(number)) &&
    Number.isSafeInteger(orderNumber) &&
    orderNumber > 0;

  const ingredients = useSelector((state) => state.ingredients.items);

  const ingredientsStatus = useSelector((state) => state.ingredients.status);

  const feedOrder = useSelector((state) =>
    state.feed.orders.find((order) => order.number === orderNumber)
  );

  const profileOrder = useSelector((state) =>
    state.profileOrders.orders.find((order) => order.number === orderNumber)
  );

  const selectedOrder = useSelector(selectOrderInfo);
  const error = useSelector(selectOrderInfoError);

  const cachedOrder = feedOrder ?? profileOrder;

  const orderData =
    (selectedOrder?.number === orderNumber ? selectedOrder : null) ??
    cachedOrder ??
    null;

  useEffect(() => {
    if (!isValidNumber || cachedOrder) {
      return;
    }

    void dispatch(fetchOrderByNumber(orderNumber));
  }, [dispatch, orderNumber, isValidNumber, cachedOrder]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) {
      return null;
    }

    const date = new Date(orderData.createdAt);

    const ingredientsInfo = orderData.ingredients.reduce<
      Record<string, TIngredientWithCount>
    >((acc, ingredientId) => {
      const ingredient = ingredients.find((item) => item._id === ingredientId);

      if (!ingredient) {
        return acc;
      }

      if (acc[ingredientId]) {
        acc[ingredientId].count += 1;
      } else {
        acc[ingredientId] = {
          ...ingredient,
          count: 1,
        };
      }

      return acc;
    }, {});

    const total = Object.values(ingredientsInfo).reduce(
      (sum, ingredient) => sum + ingredient.price * ingredient.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);

  const handleRetry = (): void => {
    if (isValidNumber) {
      void dispatch(fetchOrderByNumber(orderNumber));
    }
  };

  if (!isValidNumber) {
    return <p className="text text_type_main-medium">Некорректный номер заказа.</p>;
  }

  if (!orderData && error) {
    return (
      <div>
        <p role="alert" className="text text_type_main-default mb-5">
          Не удалось загрузить заказ: {error}
        </p>

        <Button htmlType="button" type="primary" size="medium" onClick={handleRetry}>
          Повторить
        </Button>
      </div>
    );
  }

  if (!ingredients.length && ingredientsStatus === 'failed') {
    return (
      <p role="alert" className="text text_type_main-default">
        Не удалось загрузить ингредиенты заказа.
      </p>
    );
  }

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
