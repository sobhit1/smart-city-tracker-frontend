// src/views/issues/IssueDetails.jsx

import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Typography, Button, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useIssue } from '../../hooks/useIssues';
import Loader from '../../components/Loader';
import { DASHBOARD_PATH } from '../../const/routes';

import IssueContent from '../../components/issues/IssueContent';
import DetailsSidebar from '../../components/issues/DetailsSidebar';
import CommentsSection from '../../components/issues/CommentsSection';

function IssueDetails() {
  const { issueId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { data: issue, isLoading, isError, error } = useIssue(issueId);

  const isAdmin = user?.roles.includes('ROLE_ADMIN');
  const isStaff = user?.roles.includes('ROLE_STAFF');
  const currentUserId = { 'John Citizen': 1, 'Jane Staff': 2, 'Admin User': 3 }[user?.fullName] || 0;

  if (isLoading) return <Loader />;
  if (isError) return <Typography color="error">Error fetching issue: {error.message}</Typography>;
  if (!issue) return <Typography>Issue not found.</Typography>;

  const canEditIssue = isAdmin || (isStaff && issue.assignee?.id === currentUserId) || (issue.reporter.id === currentUserId);
  const canChangeStatus = isAdmin || (isStaff && issue.assignee?.id === currentUserId);
  const canUploadProof = isStaff || isAdmin;
  const canDeleteIssue = isAdmin;
  const canAssignIssue = isAdmin;
  const canDeleteAnyComment = isAdmin;
  const canDeleteAttachments = isAdmin;

  const currentUser = {
      id: currentUserId,
      fullName: user.fullName,
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Button component={RouterLink} to={DASHBOARD_PATH} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>

      <Grid container spacing={4}>
        {/* --- Left Column: Main Content --- */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <IssueContent
              issue={issue}
              canEdit={canEditIssue}
              canUploadProof={canUploadProof}
              canDeleteAttachments={canDeleteAttachments}
            />
            <CommentsSection
                issueComments={issue.comments}
                currentUser={currentUser}
                canDeleteAnyComment={canDeleteAnyComment}
            />
          </Box>
        </Grid>

        {/* --- Right Column: Metadata Sidebar --- */}
        <Grid item xs={12} md={4}>
          <DetailsSidebar
            issue={issue}
            canChangeStatus={canChangeStatus}
            canAssignIssue={canAssignIssue}
            canDeleteIssue={canDeleteIssue}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default IssueDetails;