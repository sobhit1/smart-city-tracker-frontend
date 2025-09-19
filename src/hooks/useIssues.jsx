import { useQuery } from '@tanstack/react-query';
import { fetchIssues } from '../api/issuesApi';

export const useIssues = (filters) => {
  return useQuery({
    queryKey: ['issues', filters],

    queryFn: () => fetchIssues(filters),

    staleTime: 5 * 60 * 1000,

    refetchOnWindowFocus: true,
  });
};