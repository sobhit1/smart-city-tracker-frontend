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

function AdminDashboard() {
  const user = useSelector((state) => state.auth.user);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.fullName || 'Admin'}!
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        This is your admin dashboard. Manage users, review logs, and monitor the system.
      </Typography>

      <Grid container spacing={3}>
        {/* --- User Management Card --- */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent>
              <Typography variant="h6">User Management</Typography>
              <Typography variant="body2" color="text.secondary">
                View, add, or edit users and manage roles and permissions.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" variant="contained" component={RouterLink} to="/admin/users">
                Manage Users
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* --- Audit Logs Card --- */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent>
              <Typography variant="h6">Audit Logs</Typography>
              <Typography variant="body2" color="text.secondary">
                Review system activities and changes for auditing and compliance.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" variant="contained" component={RouterLink} to="/admin/logs">
                View Logs
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* --- System Reports Card --- */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <CardContent>
              <Typography variant="h6">System Reports</Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Monitor system performance and generate reports.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminDashboard;