import apiClient from '../toolkit/apiClient';
import { ISSUES_ENDPOINT } from '../const/api';

const mockIssues = [
  {
    id: 'IS-101',
    title: 'Large pothole on Main Street near the central library',
    category: 'Roads',
    status: 'OPEN',
    reportedAt: '2025-09-18T10:30:00Z',
  },
  {
    id: 'IS-102',
    title: 'Garbage bins overflowing at City Park entrance',
    category: 'Waste Management',
    status: 'IN_PROGRESS',
    reportedAt: '2025-09-17T14:00:00Z',
  },
  {
    id: 'IS-103',
    title: 'Streetlight out on Oak Avenue (Pole #A45)',
    category: 'Streetlights',
    status: 'RESOLVED',
    reportedAt: '2025-09-15T22:15:00Z',
  },
  {
    id: 'IS-104',
    title: 'Broken water pipe causing a leak on Elm Street',
    category: 'Water Supply',
    status: 'OPEN',
    reportedAt: '2025-09-19T08:00:00Z',
  },
  {
    id: 'IS-105',
    title: 'Fallen tree blocking the sidewalk on Pine Lane',
    category: 'Parks & Trees',
    status: 'IN_PROGRESS',
    reportedAt: '2025-09-18T18:45:00Z',
  },
];

export const fetchIssues = async (filters = {}) => {
  console.log('Fetching issues with filters:', filters);

  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredIssues = mockIssues;
  if (filters.search) {
    filteredIssues = filteredIssues.filter(issue =>
      issue.title.toLowerCase().includes(filters.search.toLowerCase())
    );
  }
  if (filters.category && filters.category !== 'All') {
    filteredIssues = filteredIssues.filter(issue => issue.category === filters.category);
  }
  if (filters.status && filters.status !== 'All') {
    filteredIssues = filteredIssues.filter(issue => issue.status === filters.status);
  }

  return filteredIssues;
};

export const createIssue = async (issueData) => {
  console.log('Submitting new issue:', issueData);

  await new Promise(resolve => setTimeout(resolve, 1000));

  return { message: 'Issue created successfully' };
};