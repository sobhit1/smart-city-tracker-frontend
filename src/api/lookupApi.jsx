import apiClient from '../toolkit/apiClient';
import { USERS_API, CATEGORIES_API, STATUSES_API, PRIORITIES_API } from '../const/api';

/**
 * Fetches a list of users from the backend, with an optional filter by role.
 * This is used to populate dropdowns for "Assignee" and "Reporter".
 *
 * @param {string} [role] - Optional role to filter by (e.g., 'STAFF').
 * @returns {Promise<Array<object>>} A promise that resolves to an array of user objects.
 */
export const fetchUsers = async (role) => {
    const params = {};
    if (role) {
        params.role = role;
    }
    const response = await apiClient.get(USERS_API, { params });
    return response.data;
};

/**
 * Fetches the list of all available issue categories from the backend.
 *
 * @returns {Promise<Array<object>>} A promise that resolves to an array of category objects.
 */
export const fetchCategories = async () => {
    const response = await apiClient.get(CATEGORIES_API);
    return response.data;
};

/**
 * Fetches the list of all available issue statuses from the backend.
 *
 * @returns {Promise<Array<object>>} A promise that resolves to an array of status objects.
 */
export const fetchStatuses = async () => {
    const response = await apiClient.get(STATUSES_API);
    return response.data;
};

/**
 * Fetches the list of all available issue priorities from the backend.
 * The backend will return these sorted by their logical order.
 *
 * @returns {Promise<Array<object>>} A promise that resolves to an array of priority objects.
 */
export const fetchPriorities = async () => {
    const response = await apiClient.get(PRIORITIES_API);
    return response.data;
};