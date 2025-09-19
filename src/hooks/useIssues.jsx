// src/hooks/useIssues.js

import { useQuery } from '@tanstack/react-query';
// 1. Import BOTH API functions now
import { fetchIssues, fetchIssueById } from '../api/issuesApi';

/**
 * A custom React hook to fetch and manage the state of ALL issues.
 * This is used by the main dashboard.
 *
 * @param {object} filters - An object containing the current filter values.
 * @returns The state object from React Query.
 */
export const useIssues = (filters) => {
  return useQuery({
    // The key includes the filters, so the query refetches when they change.
    queryKey: ['issues', filters],
    queryFn: () => fetchIssues(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * A custom React hook to fetch and manage the state of a SINGLE issue by its ID.
 * This is used by the Issue Details page.
 *
 * @param {string} issueId - The ID of the issue to fetch.
 * @returns The state object from React Query.
 */
export const useIssue = (issueId) => {
  return useQuery({
    // The key includes the issueId, so it fetches the correct issue.
    queryKey: ['issue', issueId],
    queryFn: ({ queryKey }) => {
      const [, id] = queryKey;
      return fetchIssueById(id);
    },
    // This prevents the query from running if the issueId isn't available yet.
    enabled: !!issueId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};