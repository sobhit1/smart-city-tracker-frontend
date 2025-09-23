import { configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import notificationReducer from './notificationSlice';

/**
 * The main Redux store for the application.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
  },
});

export default store;