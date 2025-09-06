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
import { Link as RouterLink } from 'react-router-dom';

function StaffDashboard() {
  const user = useSelector((state) => state.auth.user);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.fullName || 'Staff Member'}!
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        This is your staff dashboard. Manage and track your assigned issues from here.
      </Typography>

      <Grid container spacing={3}>
        {/* --- Assigned Issues Card --- */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent>
              <Typography variant="h6">Assigned Issues</Typography>
              <Typography variant="body2" color="text.secondary">
                View all issues assigned to you and update their progress.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" variant="contained" component={RouterLink} to="/staff/issues">
                View Issues
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* --- Pending Tasks Card --- */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent>
              <Typography variant="h6">Pending Tasks</Typography>
              <Typography variant="body2" color="text.secondary">
                Check and complete pending tasks related to issue resolution.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" variant="contained" component={RouterLink} to="/staff/tasks">
                View Tasks
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* --- Placeholder for future features --- */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <CardContent>
              <Typography variant="h6">Coming Soon</Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Additional features for staff will be added soon.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default StaffDashboard;