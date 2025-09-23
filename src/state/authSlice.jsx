import { createSlice } from '@reduxjs/toolkit';
import { getUser, getToken, setUser, setToken, clearAuthStorage } from '../toolkit/storage';

const initialState = {
  user: getUser(), 
  token: getToken(), 
  isAuthenticated: !!getToken(),
};

/**
 * Redux slice for managing authentication state.
 */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      const { accessToken, fullName, userName, roles } = action.payload;

      const user = { fullName, userName, roles };
      const token = accessToken;

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