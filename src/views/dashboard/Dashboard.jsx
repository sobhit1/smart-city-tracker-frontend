import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

import { useIssues } from '../../hooks/useIssues';
import { REPORT_ISSUE_PATH } from '../../const/routes';

const categories = ['All', 'Roads', 'Waste Management', 'Streetlights', 'Water Supply', 'Parks & Trees', 'Other'];
const statuses = ['All', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];

function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    status: 'All',
    view: 'all',
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const { data, isLoading, isError, error } = useIssues(filters, paginationModel);
  const issues = data?.content || [];
  const rowCount = data?.totalElements || 0;

  const isStaffOrAdmin = user?.roles.includes('ROLE_STAFF') || user?.roles.includes('ROLE_ADMIN');

  const handleFilterChange = (event, newView) => {
    if (newView !== null) {
      setFilters(prev => ({ ...prev, view: newView }));
    } else {
      const { name, value } = event.target;
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const columns = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 250 },
    { field: 'category', headerName: 'Category', width: 180 },
    { field: 'priority', headerName: 'Priority', width: 120, renderCell: (params) => {
        const priorityColors = { highest : 'error', High: 'error', Medium: 'warning', Low: 'success' };
        return <Chip label={params.value} color={priorityColors[params.value] || 'default'} size="small" />;
    }},
    { field: 'reporter', headerName: 'Reported By', width: 150, valueGetter: (value) => value?.name || 'N/A' },
    { field: 'assignee', headerName: 'Assigned To', width: 150, valueGetter: (value) => value?.name || 'Unassigned' },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => {
        const statusColors = { OPEN: 'error', IN_PROGRESS: 'primary', RESOLVED: 'success' };
        return <Chip label={params.value} color={statusColors[params.value] || 'default'} size="small" />;
      },
    },
    {
      field: 'reportedAt',
      headerName: 'Date Reported',
      width: 180,
      valueFormatter: (value) => new Date(value).toLocaleString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Button variant="outlined" size="small" component={RouterLink} to={`/issue/${params.row.id}`}>
          View
        </Button>
      ),
    },
  ], []);


  if (isError) {
    return <Typography color="error">Error fetching issues: {error.message}</Typography>;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Issue Dashboard</Typography>
        <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to={REPORT_ISSUE_PATH}>
          Report New Issue
        </Button>
      </Box>
      
      {/* --- Filter Bar --- */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* NEW: Toggle Buttons for views */}
          <Grid item xs={12}>
            <ToggleButtonGroup
              value={filters.view}
              exclusive
              onChange={handleFilterChange}
              aria-label="issue view"
              size="small"
            >
              <ToggleButton value="all" aria-label="all issues">All Issues</ToggleButton>
              <ToggleButton value="reportedByMe" aria-label="reported by me">My Reports</ToggleButton>
              {isStaffOrAdmin && (
                <ToggleButton value="assignedToMe" aria-label="assigned to me">Assigned To Me</ToggleButton>
              )}
            </ToggleButtonGroup>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField fullWidth variant="outlined" label="Search issues..." name="search" value={filters.search} onChange={handleFilterChange} />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth sx={{ minWidth: '15vw' }}>
              <InputLabel>Category</InputLabel>
              <Select name="category" value={filters.category} label="Category" onChange={handleFilterChange}>
                {categories.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth sx={{ minWidth: '10vw' }}>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={filters.status} label="Status" onChange={handleFilterChange}>
                {statuses.map((stat) => <MenuItem key={stat} value={stat}>{stat}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* --- Issues DataGrid --- */}
      <Paper sx={{ height: '60vh', width: '100%' }}>
        <DataGrid
          rows={issues}
          columns={columns}
          loading={isLoading}
          rowCount={rowCount}
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          paginationMode="server"
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
}

export default Dashboard;