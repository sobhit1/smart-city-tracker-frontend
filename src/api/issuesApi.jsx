import apiClient from '../toolkit/apiClient';
import { ISSUES_ENDPOINT } from '../const/api';

// --- Mock Data ---
// A realistic set of fake issues to simulate a response from the backend.
// This allows us to build the UI without waiting for the API to be ready.
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

/**
 * Fetches a list of issues from the backend.
 * Currently, it returns mock data to simulate an API call.
 *
 * @param {object} filters - An object containing filter parameters (e.g., { search, category, status }).
 * @returns {Promise<Array<object>>} A promise that resolves to an array of issue objects.
 */
export const fetchIssues = async (filters = {}) => {
  console.log('Fetching issues with filters:', filters);
  // In a real implementation, you would use the apiClient:
  // const response = await apiClient.get(ISSUES_ENDPOINT, { params: filters });
  // return response.data;

  // --- Simulate network delay for mock data ---
  await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 second delay

  // Basic filtering logic for the mock data
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