import { createSlice } from '@reduxjs/toolkit';
import {
  getUser,
  getToken,
  setUser,
  setToken,
  clearAuthStorage,
} from '../toolkit/storage';

const initialState = {
  user: getUser(),
  token: getToken(),
  isAuthenticated: !!getToken(),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      const { user, token } = action.payload;

      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      setUser(user);
      setToken(token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      clearAuthStorage();
    },
  },
});

export const { setAuth, logout } = authSlice.actions;

export default authSlice.reducer;