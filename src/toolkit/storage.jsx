const ACCESS_TOKEN_KEY = 'accessToken';
const AUTH_USER_KEY = 'authUser';

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

export const getToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const setUser = (user) => {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
};

export const getUser = () => {
  try {
    const user = localStorage.getItem(AUTH_USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Failed to parse user data from localStorage', error);
    return null;
  }
};

export const removeUser = () => {
  localStorage.removeItem(AUTH_USER_KEY);
};

export const clearAuthStorage = () => {
  removeToken();
  removeUser();
};