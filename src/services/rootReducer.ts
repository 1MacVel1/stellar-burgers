import { combineReducers } from '@reduxjs/toolkit';

import { constructorReducer } from './slices/constructorSlice';
import { feedReducer } from './slices/feedSlice';
import { ingredientsReducer } from './slices/ingredientsSlice';
import { orderInfoReducer } from './slices/orderInfoSlice';
import { orderReducer } from './slices/orderSlice';
import { profileOrdersReducer } from './slices/profileOrdersSlice';
import { userReducer } from './slices/userSlice';

export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  burgerConstructor: constructorReducer,
  user: userReducer,
  order: orderReducer,
  feed: feedReducer,
  orderInfo: orderInfoReducer,
  profileOrders: profileOrdersReducer,
});
