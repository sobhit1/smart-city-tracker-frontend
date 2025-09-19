import React, { useState } from 'react';
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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

import { useIssues } from '../../hooks/useIssues';
import { REPORT_ISSUE_PATH } from '../../const/routes';

const columns = [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'title', headerName: 'Title', flex: 1, minWidth: 250 },
  {
    field: 'category',
    headerName: 'Category',
    width: 160,
    minWidth: 180,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 150,
    renderCell: (params) => {
      const statusColors = {
        OPEN: 'error',
        IN_PROGRESS: 'primary',
        RESOLVED: 'success',
      };
      return (
        <Chip
          label={params.value}
          color={statusColors[params.value] || 'default'}
          size="small"
          sx={{ width: '100px' }}
        />
      );
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
      <Button
        variant="outlined"
        size="small"
        component={RouterLink}
        to={`/issue/${params.row.id}`}
      >
        View
      </Button>
    ),
  },
];

const categories = ['All', 'Roads', 'Waste Management', 'Streetlights', 'Water Supply', 'Parks & Trees', 'Other'];
const statuses = ['All', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];

function Dashboard() {
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    status: 'All',
  });

  const { data: issues, isLoading, isError, error } = useIssues(filters);

  const handleFilterChange = (event) => {
    setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  if (isError) {
    return <Typography color="error">Error fetching issues: {error.message}</Typography>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
        p: { xs: 2, sm: 3 },
        gap: 3,
      }}
    >
      {/* --- Header --- */}
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          Public Issues
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={RouterLink}
          to={REPORT_ISSUE_PATH}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Report New Issue
        </Button>
      </Box>

      {/* --- Filter Bar --- */}
      <Paper sx={{ flexShrink: 0, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search issues..."
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              sx={{minWidth: '20vw'}}
            />
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
            <FormControl fullWidth sx={{minWidth: '10vw'}}>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={filters.status} label="Status" onChange={handleFilterChange}>
                {statuses.map((stat) => <MenuItem key={stat} value={stat}>{stat}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* --- Issues DataGrid --- */}
      <Paper sx={{ width: '100%' }}>
        <DataGrid
          rows={issues || []}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          showColumnVerticalBorder
          showCellVerticalBorder
          disableRowSelectionOnClick
          disableColumnMenu
          autoHeight
        />
      </Paper>
    </Box>
  );
}

export default Dashboard;