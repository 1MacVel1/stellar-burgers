import { Button } from '@krgaa/react-developer-burger-ui-components';
import {
  selectFeedOrders,
  selectFeedLoading,
  selectFeedError,
} from '@selectors/feedSelectors';
import { fetchFeed } from '@slices/feedSlice';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useEffect } from 'react';

import { useDispatch, useSelector } from '@services/store';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();

  const orders = useSelector(selectFeedOrders);
  const isLoading = useSelector(selectFeedLoading);
  const error = useSelector(selectFeedError);

  const handleGetFeeds = (): void => {
    void dispatch(fetchFeed());
  };

  useEffect(() => {
    void dispatch(fetchFeed());
  }, [dispatch]);

  if (isLoading && orders.length === 0) {
    return <Preloader />;
  }

  if (error && orders.length === 0) {
    return (
      <main className="mt-20">
        <p role="alert" className="text text_type_main-medium mb-5">
          Не удалось загрузить ленту заказов: {error}
        </p>

        <Button htmlType="button" type="primary" size="medium" onClick={handleGetFeeds}>
          Повторить
        </Button>
      </main>
    );
  }

  return (
    <>
      {error && (
        <p role="alert" className="text text_type_main-default mt-4">
          Не удалось обновить ленту: {error}
        </p>
      )}

      <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />
    </>
  );
};
