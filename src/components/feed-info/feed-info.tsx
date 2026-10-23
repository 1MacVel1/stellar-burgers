import { selectFeed } from '@selectors/feedSelectors';
import { FeedInfoUI } from '@ui';

import { useSelector } from '@services/store';

import type { TOrder } from '@utils-types';

const getOrdersByStatus = (orders: TOrder[], statuses: string[]): number[] =>
  orders
    .filter((order) => statuses.includes(order.status))
    .map((order) => order.number)
    .slice(0, 20);

export const FeedInfo = (): React.JSX.Element => {
  const feed = useSelector(selectFeed);

  const readyOrders = getOrdersByStatus(feed.orders, ['done']);

  const pendingOrders = getOrdersByStatus(feed.orders, ['pending', 'created']);

  return (
    <FeedInfoUI readyOrders={readyOrders} pendingOrders={pendingOrders} feed={feed} />
  );
};
