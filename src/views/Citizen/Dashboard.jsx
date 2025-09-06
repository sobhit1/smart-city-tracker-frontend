import React from 'react';
import { useSelector } from 'react-redux';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import { REPORT_ISSUE_PATH, MY_ISSUES_PATH } from '../../const/routes';
import { Link as RouterLink } from 'react-router-dom';

function CitizenDashboard() {
  const user = useSelector((state) => state.auth.user);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.fullName || 'Citizen'}!
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        This is your dashboard. From here, you can report new issues and track your existing reports.
      </Typography>

      <Grid container spacing={3}>
        {/* --- Report Issue Card --- */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent>
              <Typography variant="h6">Report an Issue</Typography>
              <Typography variant="body2" color="text.secondary">
                Submit a new issue to notify municipal staff about problems in your locality.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="contained"
                component={RouterLink}
                to={REPORT_ISSUE_PATH}
              >
                Report Now
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* --- My Issues Card --- */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent>
              <Typography variant="h6">My Issues</Typography>
              <Typography variant="body2" color="text.secondary">
                View all the issues you have reported and track their resolution status.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="contained"
                component={RouterLink}
                to={MY_ISSUES_PATH}
              >
                View My Issues
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* --- Placeholder for future cards --- */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <CardContent>
              <Typography variant="h6">Coming Soon</Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                More features will be available soon.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CitizenDashboard;