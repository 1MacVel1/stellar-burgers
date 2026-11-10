import { Button } from '@krgaa/react-developer-burger-ui-components';
import {
  selectProfileOrders,
  selectProfileOrdersLoading,
  selectProfileOrdersError,
} from '@selectors/profileOrdersSelectors';
import { fetchProfileOrders } from '@slices/profileOrdersSlice';
import { Preloader } from '@ui';
import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

import { useDispatch, useSelector } from '@services/store';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();

  const orders = useSelector(selectProfileOrders);
  const isLoading = useSelector(selectProfileOrdersLoading);
  const error = useSelector(selectProfileOrdersError);

  useEffect(() => {
    void dispatch(fetchProfileOrders());
  }, [dispatch]);

  const handleRetry = (): void => {
    void dispatch(fetchProfileOrders());
  };

  if (isLoading && orders.length === 0) {
    return <Preloader />;
  }

  if (error && orders.length === 0) {
    return (
      <main className="mt-20">
        <p role="alert" className="text text_type_main-medium mb-5">
          Не удалось загрузить историю заказов: {error}
        </p>

        <Button htmlType="button" type="primary" size="medium" onClick={handleRetry}>
          Повторить
        </Button>
      </main>
    );
  }

  return (
    <>
      {error && (
        <p role="alert" className="text text_type_main-default mt-4">
          Не удалось обновить историю: {error}
        </p>
      )}

      <ProfileOrdersUI orders={orders} />
    </>
  );
};
