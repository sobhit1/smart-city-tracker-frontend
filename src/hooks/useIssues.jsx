import { useQuery } from '@tanstack/react-query';
import { fetchIssues, fetchIssueById } from '../api/issuesApi';

export const useIssues = (filters) => {
  return useQuery({
    queryKey: ['issues', filters],
    queryFn: () => fetchIssues(filters),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useIssue = (issueId) => {
  return useQuery({
    queryKey: ['issue', issueId],
    queryFn: ({ queryKey }) => {
      const [, id] = queryKey;
      return fetchIssueById(id);
    },
    enabled: !!issueId,
    staleTime: 5 * 60 * 1000,
  });
};