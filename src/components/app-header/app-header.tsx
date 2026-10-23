import { selectUser } from '@selectors/userSelectors';
import { AppHeaderUI } from '@ui';

import { useSelector } from '@services/store';

export const AppHeader = (): React.JSX.Element => {
  const user = useSelector(selectUser);

  return <AppHeaderUI userName={user?.name} />;
};
