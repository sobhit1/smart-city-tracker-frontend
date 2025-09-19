import apiClient from '../toolkit/apiClient';
import { ISSUES_ENDPOINT } from '../const/api';

const mockIssues = [
  {
    id: 'IS-101',
    title: 'Large pothole on Main Street near the central library',
    description: 'There is a large and dangerous pothole on the westbound lane of Main Street, right in front of the public library entrance.\n\nIt has been there for over a week and is getting worse. Multiple cars have been seen swerving to avoid it.',
    category: 'Roads',
    status: 'OPEN',
    reportedAt: '2025-09-18T10:30:00Z',
    reporter: { id: 1, name: 'John Citizen' },
    assignee: null,
    attachments: [
      { name: 'pothole-view.jpg', url: 'https://placehold.co/600x400/7f1d1d/ffffff?text=Pothole+View' },
      { name: 'pothole-closeup.jpg', url: 'https://placehold.co/600x400/b91c1c/ffffff?text=Close-up' }
    ],
    comments: [
      { id: 1, author: { id: 3, name: 'Admin User' }, text: 'Thank you for reporting. We have dispatched a team to inspect the issue.', createdAt: '2025-09-18T11:00:00Z' },
      { id: 2, author: { id: 1, name: 'John Citizen' }, text: 'Update: The pothole seems to have gotten larger after last night\'s rain.', createdAt: '2025-09-19T09:00:00Z' }
    ]
  },
  {
    id: 'IS-102',
    title: 'Garbage bins overflowing at City Park entrance',
    description: 'The garbage and recycling bins at the main entrance to City Park are completely full and overflowing. This has been the case for two days now and is attracting pests.',
    category: 'Waste Management',
    status: 'IN_PROGRESS',
    reportedAt: '2025-09-17T14:00:00Z',
    reporter: { id: 2, name: 'Jane Staff' },
    assignee: { id: 2, name: 'Jane Staff' },
    attachments: [],
    comments: [],
  },
  {
    id: 'IS-103',
    title: 'Streetlight out on Oak Avenue (Pole #A45)',
    description: 'The streetlight on pole #A45 on Oak Avenue is completely out. It makes the corner very dark and unsafe at night.',
    category: 'Streetlights',
    status: 'RESOLVED',
    reportedAt: '2025-09-15T22:15:00Z',
    reporter: { id: 1, name: 'John Citizen' },
    assignee: { id: 3, name: 'Admin User' },
    attachments: [],
    comments: [
      { id: 3, author: { id: 2, name: 'Jane Staff' }, text: 'Resolved. The bulb was replaced on Sept 16th.', createdAt: '2025-09-16T18:00:00Z' }
    ],
  },
  {
    id: 'IS-104',
    title: 'Broken water pipe causing a leak on Elm Street',
    description: 'A water main appears to have burst on Elm Street. Water has been flowing down the gutter for several hours.',
    category: 'Water Supply',
    status: 'OPEN',
    reportedAt: '2025-09-19T08:00:00Z',
    reporter: { id: 4, name: 'Another Citizen' },
    assignee: null,
    attachments: [],
    comments: []
  },
  {
    id: 'IS-105',
    title: 'Fallen tree blocking the sidewalk on Pine Lane',
    description: 'A large branch from a tree has fallen and is completely blocking the sidewalk on Pine Lane, forcing pedestrians to walk in the street.',
    category: 'Parks & Trees',
    status: 'IN_PROGRESS',
    reportedAt: '2025-09-18T18:45:00Z',
    reporter: { id: 1, name: 'John Citizen' },
    assignee: { id: 2, name: 'Jane Staff' },
    attachments: [
      { name: 'fallen-tree.jpg', url: 'https://placehold.co/600x400/22c55e/ffffff?text=Fallen+Tree' }
    ],
    comments: []
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

export const fetchIssueById = async (issueId) => {
  console.log('Fetching issue with ID:', issueId);
  await new Promise(resolve => setTimeout(resolve, 500));

  const issue = mockIssues.find(iss => iss.id === issueId);

  if (!issue) {
    throw new Error('Issue not found');
  }

  return {
    ...issue,
    attachments: issue.attachments || [],
    comments: issue.comments || [],
  };
};

export const createIssue = async (issueData) => {
  console.log('Submitting new issue:', issueData);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { message: 'Issue created successfully' };
};