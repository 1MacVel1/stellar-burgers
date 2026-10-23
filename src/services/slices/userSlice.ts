import {
  getUserApi,
  loginUserApi,
  logoutApi,
  refreshToken,
  registerUserApi,
  updateUserApi,
} from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { deleteCookie, getCookie, setCookie } from '../../utils/cookie';

import type { TLoginData, TRegisterData } from '@api';
import type { TUser } from '@utils-types';

type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  isLoading: boolean;
  error: string | null;
};

const initialState: TUserState = {
  user: null,
  isAuthChecked: false,
  isLoading: false,
  error: null,
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Произошла неизвестная ошибка';

const saveTokens = (accessToken: string, refreshTokenValue: string): void => {
  setCookie('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshTokenValue);
};

const clearTokens = (): void => {
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
};

export const registerUser = createAsyncThunk<
  TUser,
  TRegisterData,
  { rejectValue: string }
>('user/register', async (data, { rejectWithValue }) => {
  try {
    const response = await registerUserApi(data);

    saveTokens(response.accessToken, response.refreshToken);

    return response.user;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const loginUser = createAsyncThunk<TUser, TLoginData, { rejectValue: string }>(
  'user/login',
  async (data, { rejectWithValue }) => {
    try {
      const response = await loginUserApi(data);

      saveTokens(response.accessToken, response.refreshToken);

      return response.user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const checkUserAuth = createAsyncThunk<
  TUser | null,
  void,
  { rejectValue: string }
>('user/checkAuth', async (_, { rejectWithValue }) => {
  const accessToken = getCookie('accessToken');
  const savedRefreshToken = localStorage.getItem('refreshToken');

  if (!accessToken && !savedRefreshToken) {
    return null;
  }

  try {
    if (!accessToken && savedRefreshToken) {
      await refreshToken();
    }

    const response = await getUserApi();

    return response.user;
  } catch (error) {
    clearTokens();

    return rejectWithValue(getErrorMessage(error));
  }
});

export const logoutUser = createAsyncThunk('user/logout', async () => {
  try {
    await logoutApi();
  } finally {
    clearTokens();
  }
});

export const updateUser = createAsyncThunk<
  TUser,
  Partial<TRegisterData>,
  { rejectValue: string }
>('user/update', async (data, { rejectWithValue }) => {
  try {
    const response = await updateUserApi(data);

    return response.user;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkUserAuth.pending, (state) => {
        state.isAuthChecked = false;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.user = null;
        state.isAuthChecked = true;
      })

      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Ошибка регистрации';
      })

      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Ошибка входа';
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
      })

      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Ошибка обновления профиля';
      });
  },
});

export const { clearUserError } = userSlice.actions;

export const userReducer = userSlice.reducer;
