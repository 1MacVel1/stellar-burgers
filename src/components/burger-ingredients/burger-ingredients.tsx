import {
  selectIngredients,
  selectIngredientsLoading,
  selectIngredientsError,
} from '@selectors/ingredientsSelectors';
import { fetchIngredients } from '@slices/ingredientsSlice';
import { BurgerIngredientsUI, Preloader } from '@ui';
import { useMemo, useState, useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { useDispatch, useSelector } from '@services/store';

import type { TIngredient, TTabMode } from '@utils-types';

export const BurgerIngredients = (): React.JSX.Element => {
  const dispatch = useDispatch();

  const ingredients = useSelector(selectIngredients);
  const isLoading = useSelector(selectIngredientsLoading);
  const error = useSelector(selectIngredientsError);

  const [currentTab, setCurrentTab] = useState<TTabMode>('bun');

  const titleBunRef = useRef<HTMLHeadingElement>(null);
  const titleMainRef = useRef<HTMLHeadingElement>(null);
  const titleSaucesRef = useRef<HTMLHeadingElement>(null);

  const [bunsRef, inViewBuns] = useInView({
    threshold: 0,
  });

  const [mainsRef, inViewFilling] = useInView({
    threshold: 0,
  });

  const [saucesRef, inViewSauces] = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inViewBuns) {
      setCurrentTab('bun');
    } else if (inViewSauces) {
      setCurrentTab('sauce');
    } else if (inViewFilling) {
      setCurrentTab('main');
    }
  }, [inViewBuns, inViewFilling, inViewSauces]);

  const onTabClick = (tab: string): void => {
    setCurrentTab(tab as TTabMode);

    if (tab === 'bun') {
      titleBunRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    if (tab === 'main') {
      titleMainRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    if (tab === 'sauce') {
      titleSaucesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const buns = useMemo(
    () => ingredients.filter((item: TIngredient) => item.type === 'bun'),
    [ingredients]
  );

  const mains = useMemo(
    () => ingredients.filter((item: TIngredient) => item.type === 'main'),
    [ingredients]
  );

  const sauces = useMemo(
    () => ingredients.filter((item: TIngredient) => item.type === 'sauce'),
    [ingredients]
  );

  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <div className="mt-10">
        <p role="alert" className="text text_type_main-medium">
          Не удалось загрузить ингредиенты: {error}
        </p>
        <button
          type="button"
          className="text text_type_main-default mt-5"
          onClick={() => {
            void dispatch(fetchIngredients());
          }}
        >
          Повторить загрузку
        </button>
      </div>
    );
  }

  if (!ingredients.length) {
    return <p className="text text_type_main-medium mt-10">Ингредиенты отсутствуют</p>;
  }

  return (
    <BurgerIngredientsUI
      currentTab={currentTab}
      buns={buns}
      mains={mains}
      sauces={sauces}
      titleBunRef={titleBunRef}
      titleMainRef={titleMainRef}
      titleSaucesRef={titleSaucesRef}
      bunsRef={bunsRef}
      mainsRef={mainsRef}
      saucesRef={saucesRef}
      onTabClick={onTabClick}
    />
  );
};
