import { useQuery } from '@tanstack/react-query';
import { fetchIssues, fetchIssueById } from '../api/issuesApi';

/**
 * A custom hook to fetch and cache a paginated and filtered list of issues.
 * This is used by the main dashboard.
 *
 * @param {object} filters - An object containing the current filter values (search, category, etc.).
 * @param {object} paginationModel - An object with the current page and pageSize.
 * @returns The state object from React Query.
 */
export const useIssues = (filters, paginationModel) => {
  return useQuery({
    queryKey: ['issues', filters, paginationModel],

    queryFn: fetchIssues,

    staleTime: 60 * 1000,

    placeholderData: (previousData) => previousData,
  });
};

/**
 * A custom hook to fetch and cache a single issue by its ID.
 * This is used by the Issue Details page.
 *
 * @param {string|number} issueId - The ID of the issue to fetch.
 * @returns The state object from React Query.
 */
export const useIssue = (issueId) => {
  return useQuery({
    queryKey: ['issue', issueId],
    queryFn: ({ queryKey }) => {
      const [_key, id] = queryKey;
      return fetchIssueById(id);
    },
    enabled: !!issueId,
    staleTime: 5 * 60 * 1000,
  });
};