import { useQuery } from '@tanstack/react-query';
import { fetchIssues } from '../api/issuesApi';

/**
 * A custom React hook to fetch and manage the state of issues.
 * It uses React Query (@tanstack/react-query) to handle caching,
 * background refetching, and server state management.
 *
 * @param {object} filters - An object containing the current filter values (e.g., search, category, status).
 * @returns {object} The state object from React Query, which includes:
 * - `data`: The array of issues fetched from the API.
 * - `isLoading`: A boolean that is true while the data is being fetched.
 * - `isError`: A boolean that is true if an error occurred.
 * - `error`: The error object if one occurred.
 */
export const useIssues = (filters) => {
  return useQuery({
    // The query key is a unique identifier for this specific query.
    // By including the `filters` object in the key, React Query will
    // automatically refetch the data whenever the filters change.
    queryKey: ['issues', filters],

    // The query function is the async function that will be executed to fetch the data.
    // It receives the queryKey as an argument, which we can use to pass the filters.
    queryFn: () => fetchIssues(filters),

    // `staleTime` tells React Query to use the cached data for this amount of time (in ms)
    // before considering it "stale" and potentially refetching it in the background.
    staleTime: 5 * 60 * 1000, // 5 minutes

    // `refetchOnWindowFocus`: If the user navigates away from the browser tab and then
    // returns, React Query will automatically refetch the data to ensure it's fresh.
    refetchOnWindowFocus: true,
  });
};