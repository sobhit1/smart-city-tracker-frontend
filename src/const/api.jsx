// Base API URL
export const BASE_API_URL = 'http://localhost:8080/api';

// --- Authentication Endpoints ---
export const AUTH_ENDPOINT = `${BASE_API_URL}/auth`;
export const LOGIN_API = `${AUTH_ENDPOINT}/login`;
export const REGISTER_API = `${AUTH_ENDPOINT}/register`;
export const REFRESH_TOKEN_API = `${AUTH_ENDPOINT}/refresh`;
export const LOGOUT_API = `${AUTH_ENDPOINT}/logout`;

// --- Issues Endpoints ---
export const ISSUES_ENDPOINT = `${BASE_API_URL}/issues`;
export const getIssueByIdUrl = (issueId) => `${ISSUES_ENDPOINT}/${issueId}`;
export const getAssignIssueUrl = (issueId) => `${ISSUES_ENDPOINT}/${issueId}/assign`;
export const getUploadProofUrl = (issueId) => `${ISSUES_ENDPOINT}/${issueId}/proofs`;

// --- Admin Endpoints ---
export const ADMIN_ENDPOINT = `${BASE_API_URL}/admin`;
export const ADMIN_USERS_API = `${ADMIN_ENDPOINT}/users`;
export const ADMIN_LOGS_API = `${ADMIN_ENDPOINT}/logs`;

// --- Helper Functions ---
/**
 * Trim all string fields in an object.
 * Useful before sending login/register payload to backend.
 */
export const trimObjectStrings = (obj) => {
  const trimmed = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    trimmed[key] = typeof value === 'string' ? value.trim() : value;
  });
  return trimmed;
};