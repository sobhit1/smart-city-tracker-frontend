// --- Base API URL ---
// export const BASE_API_URL = 'http://localhost:8080/api';
export const BASE_API_URL = 'https://smart-city-tracker-backend.onrender.com/api';

// --- Authentication Endpoints ---
export const AUTH_ENDPOINT = `${BASE_API_URL}/auth`;
export const LOGIN_API = `${AUTH_ENDPOINT}/login`;
export const REGISTER_API = `${AUTH_ENDPOINT}/register`;
export const REFRESH_TOKEN_API = `${AUTH_ENDPOINT}/refresh`;
export const LOGOUT_API = `${AUTH_ENDPOINT}/logout`;

// --- Issues Endpoints ---
export const ISSUES_ENDPOINT = `${BASE_API_URL}/issues`;

// --- User Management Endpoints ---
export const USERS_API = `${BASE_API_URL}/users`;

// --- Lookup Data Endpoints (for dropdowns, filters, etc.) ---
export const CATEGORIES_API = `${BASE_API_URL}/categories`;
export const STATUSES_API = `${BASE_API_URL}/statuses`;
export const PRIORITIES_API = `${BASE_API_URL}/priorities`;