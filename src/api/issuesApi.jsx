import apiClient from '../toolkit/apiClient';
import { ISSUES_ENDPOINT } from '../const/api';

// --- READ / FETCH APIs ---

/**
 * Fetches a paginated and filtered list of issues from the live backend.
 * @param {object} queryKey - An object from React Query containing the query key.
 * The key is expected to be ['issues', filters, paginationModel].
 */
export const fetchIssues = async ({ queryKey }) => {
  const [_key, filters, paginationModel] = queryKey;

  const params = {
    page: paginationModel.page,
    size: paginationModel.pageSize,
    search: filters.search || null,
    category: filters.category === 'All' ? null : filters.category,
    status: filters.status === 'All' ? null : filters.status,
    reportedBy: filters.view === 'reportedByMe' ? 'me' : null,
    assignedTo: filters.view === 'assignedToMe' ? 'me' : null,
  };

  Object.keys(params).forEach(key => (params[key] == null) && delete params[key]);

  const response = await apiClient.get(ISSUES_ENDPOINT, { params });
  return response.data;
};

/**
 * Fetches a single issue by its ID from the live backend.
 */
export const fetchIssueById = async (issueId) => {
  if (!issueId) return null;
  const response = await apiClient.get(`${ISSUES_ENDPOINT}/${issueId}`);
  return response.data;
};


// --- CREATE / UPDATE / DELETE (MUTATION) APIs ---

/**
 * Creates a new issue by sending multipart data to the backend.
 */
export const createIssue = async (issueData) => {
  const formData = new FormData();

  const issueJson = JSON.stringify({
    title: issueData.title,
    description: issueData.description,
    category: issueData.category,
    latitude: issueData.location.lat,
    longitude: issueData.location.lng,
  });
  formData.append('issueData', new Blob([issueJson], { type: 'application/json' }));

  issueData.files.forEach(file => {
    formData.append('files', file);
  });

  const response = await apiClient.post(ISSUES_ENDPOINT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Updates an existing issue.
 */
export const updateIssue = async ({ issueId, updateData }) => {
  const response = await apiClient.put(`${ISSUES_ENDPOINT}/${issueId}`, updateData);
  return response.data;
};

/**
 * Deletes an issue.
 */
export const deleteIssue = async (issueId) => {
  const response = await apiClient.delete(`${ISSUES_ENDPOINT}/${issueId}`);
  return response.data;
};

/**
 * Adds a comment to an issue.
 */
export const addComment = async ({ issueId, commentData, files }) => {
  const formData = new FormData();
  formData.append('commentData', new Blob([JSON.stringify(commentData)], { type: 'application/json' }));

  if (files && files.length > 0) {
    files.forEach(file => formData.append('files', file));
  }

  const response = await apiClient.post(`${ISSUES_ENDPOINT}/${issueId}/comments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Updates an existing comment.
 */
export const updateComment = async ({ issueId, commentId, text }) => {
  const response = await apiClient.put(`${ISSUES_ENDPOINT}/${issueId}/comments/${commentId}`, { text });
  return response.data;
};

/**
 * Deletes a comment.
 */
export const deleteComment = async ({ issueId, commentId }) => {
  const response = await apiClient.delete(`${ISSUES_ENDPOINT}/${issueId}/comments/${commentId}`);
  return response.data;
};

/**
 * Adds attachments to an existing issue.
 */
export const addAttachmentsToIssue = async ({ issueId, files }) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  const response = await apiClient.post(`${ISSUES_ENDPOINT}/${issueId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Deletes an attachment.
 */
export const deleteAttachment = async ({ issueId, attachmentId }) => {
  const response = await apiClient.delete(`${ISSUES_ENDPOINT}/${issueId}/attachments/${attachmentId}`);
  return response.data;
};