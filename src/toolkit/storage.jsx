const ACCESS_TOKEN_KEY = 'accessToken';
const AUTH_USER_KEY = 'authUser';

/**
 * Saves the JWT access token to localStorage.
 * @param {string} token - The access token.
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

/**
 * Retrieves the JWT access token from localStorage.
 * @returns {string | null} The token, or null if it doesn't exist.
 */
export const getToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Removes the JWT access token from localStorage.
 */
export const removeToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

/**
 * Saves the user object to localStorage after converting it to a JSON string.
 * @param {object} user - The user object.
 */
export const setUser = (user) => {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
};

/**
 * Retrieves the user object from localStorage, parsing it from a JSON string.
 * @returns {object | null} The user object, or null if it doesn't exist or fails to parse.
 */
export const getUser = () => {
  try {
    const user = localStorage.getItem(AUTH_USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Failed to parse user data from localStorage', error);
    return null;
  }
};

/**
 * Removes the user object from localStorage.
 */
export const removeUser = () => {
  localStorage.removeItem(AUTH_USER_KEY);
};

/**
 * A helper function to clear all authentication-related data from localStorage at once.
 * This is used during the logout process.
 */
export const clearAuthStorage = () => {
  removeToken();
  removeUser();
};