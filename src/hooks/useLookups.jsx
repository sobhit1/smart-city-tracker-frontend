import { useQuery } from '@tanstack/react-query';
import {
    fetchUsers,
    fetchCategories,
    fetchStatuses,
    fetchPriorities,
} from '../api/lookupApi';

const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

/**
 * A custom hook to fetch and cache a list of users, with an optional role filter.
 *
 * @param {string} [role] - Optional role to filter by (e.g., 'STAFF').
 * @returns The state object from React Query.
 */
export const useUsers = (role) => {
    return useQuery({
        queryKey: ['users', role || 'all'],
        queryFn: () => fetchUsers(role),
        staleTime: twentyFourHoursInMs,
    });
};

/**
 * A custom hook to fetch and cache the list of all available issue categories.
 *
 * @returns The state object from React Query.
 */
export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        staleTime: twentyFourHoursInMs,
    });
};

/**
 * A custom hook to fetch and cache the list of all available issue statuses.
 *
 * @returns The state object from React Query.
 */
export const useStatuses = () => {
    return useQuery({
        queryKey: ['statuses'],
        queryFn: fetchStatuses,
        staleTime: twentyFourHoursInMs,
    });
};

/**
 * A custom hook to fetch and cache the list of all available issue priorities.
 *
 * @returns The state object from React Query.
 */
export const usePriorities = () => {
    return useQuery({
        queryKey: ['priorities'],
        queryFn: fetchPriorities,
        staleTime: twentyFourHoursInMs,
    });
};