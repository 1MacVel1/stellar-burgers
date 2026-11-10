import {
  selectIngredients,
  selectIngredientsStatus,
  selectIngredientsError,
} from '@selectors/ingredientsSelectors';
import { Preloader, IngredientDetailsUI } from '@ui';
import { useParams } from 'react-router-dom';

import { useSelector } from '@services/store';

export const IngredientDetails = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();

  const ingredients = useSelector(selectIngredients);
  const status = useSelector(selectIngredientsStatus);
  const error = useSelector(selectIngredientsError);

  const ingredientData = ingredients.find((ingredient) => ingredient._id === id);

  if (status === 'idle' || status === 'loading') {
    return <Preloader />;
  }

  if (status === 'failed') {
    return (
      <p role="alert" className="text text_type_main-medium">
        Не удалось загрузить ингредиент: {error}
      </p>
    );
  }

  if (!ingredientData) {
    return <p className="text text_type_main-medium">Ингредиент не найден</p>;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
