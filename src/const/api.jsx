export const BASE_API_URL = 'http://localhost:8080/api';

// --- Authentication Endpoints ---
export const AUTH_ENDPOINT = `${BASE_API_URL}/auth`;
export const LOGIN_API = `${AUTH_ENDPOINT}/login`;
export const REGISTER_API = `${AUTH_ENDPOINT}/register`;

// --- Issues Endpoints ---
export const ISSUES_ENDPOINT = `${BASE_API_URL}/issues`;
export const getIssueByIdUrl = (issueId) => `${ISSUES_ENDPOINT}/${issueId}`;
export const getAssignIssueUrl = (issueId) => `${ISSUES_ENDPOINT}/${issueId}/assign`;
export const getUploadProofUrl = (issueId) => `${ISSUES_ENDPOINT}/${issueId}/proofs`;

// --- Admin Endpoints ---
export const ADMIN_ENDPOINT = `${BASE_API_URL}/admin`;
export const ADMIN_USERS_API = `${ADMIN_ENDPOINT}/users`;
export const ADMIN_LOGS_API = `${ADMIN_ENDPOINT}/logs`;