import {
  selectConstructorItems,
  selectConstructorPrice,
} from '@selectors/constructorSelectors';
import {
  selectOrder,
  selectOrderError,
  selectOrderLoading,
} from '@selectors/orderSelectors';
import { selectIsAuthChecked, selectUser } from '@selectors/userSelectors';
import { clearConstructor } from '@slices/constructorSlice';
import { createOrder, resetOrder } from '@slices/orderSlice';
import { BurgerConstructorUI } from '@ui';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

export const BurgerConstructor = (): React.JSX.Element => {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();

  const constructorItems = useSelector(selectConstructorItems);
  const price = useSelector(selectConstructorPrice);

  const user = useSelector(selectUser);
  const isAuthChecked = useSelector(selectIsAuthChecked);

  const orderModalData = useSelector(selectOrder);
  const orderRequest = useSelector(selectOrderLoading);
  const orderError = useSelector(selectOrderError);

  const onOrderClick = (): void => {
    const bun = constructorItems.bun;

    if (!bun || orderRequest || !isAuthChecked) {
      return;
    }

    if (!user) {
      void navigate('/login', {
        state: {
          from: location,
        },
      });

      return;
    }

    const ingredientIds = [
      bun._id,
      ...constructorItems.ingredients.map((ingredient) => ingredient._id),
      bun._id,
    ];

    void dispatch(createOrder(ingredientIds))
      .unwrap()
      .then(() => {
        dispatch(clearConstructor());
      })
      .catch(() => {
        // Ошибка сохраняется в Redux.
      });
  };

  const closeOrderModal = (): void => {
    if (orderRequest) {
      return;
    }

    dispatch(resetOrder());
  };

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      orderError={orderError}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
