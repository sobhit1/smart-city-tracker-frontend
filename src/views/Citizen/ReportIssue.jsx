import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  CircularProgress,
  Container,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ReportIcon from '@mui/icons-material/Report';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

import { createIssue } from '../../api/issuesApi';
import { showNotification } from '../../state/notificationSlice';
import { CITIZEN_DASHBOARD_PATH } from '../../const/routes';

const categories = ['Roads', 'Waste Management', 'Streetlights', 'Water Supply', 'Parks & Trees', 'Other'];

const schema = yup.object().shape({
  title: yup.string().required('Issue title is required').min(10, 'Title must be at least 10 characters long'),
  description: yup.string().required('Description is required').min(20, 'Description must be at least 20 characters long'),
  category: yup.string().required('Please select a category').notOneOf([''], 'Please select a category'),
});

const tips = [
  'Be specific about the location and nature of the issue',
  'Include clear photos when possible to help with identification',
  'Provide detailed descriptions to help prioritize the issue',
  'Check if similar issues have already been reported'
];

function ReportIssue() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await createIssue(data);
      dispatch(showNotification({ message: 'Issue reported successfully!', severity: 'success' }));
      navigate(CITIZEN_DASHBOARD_PATH);
    } catch (error) {
      const errorMessage = error.message || 'Failed to report issue. Please try again.';
      dispatch(showNotification({ message: errorMessage, severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#1D2125',
        py: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3 }, flexGrow: 1 }}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}
            >
              Report a New Issue
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', maxWidth: 600 }}
            >
              Help improve your community by reporting issues that need attention
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Left section: Form */}
            <Grid item xs={12} md={8} display="flex" flexDirection="column">
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  backgroundColor: '#22272B',
                  border: '1px solid',
                  borderColor: 'divider',
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        backgroundColor: 'primary.main',
                        borderRadius: 1,
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}
                    >
                      <ReportIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Issue Details
                    </Typography>
                  </Box>

                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
                  >
                    <Grid container spacing={3} sx={{ flexGrow: 1 }}>
                      {/* Issue Title */}
                      <Grid item xs={12}>
                        <Controller
                          name="title"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Issue Title"
                              placeholder="e.g., Large pothole on Main Street near City Hall"
                              error={!!errors.title}
                              helperText={errors.title?.message}
                              required
                              sx={{
                                minWidth: { xs: 250, md: 400 },
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: '#1D2125',
                                  '&:hover fieldset': { borderColor: '#85B8FF' },
                                },
                              }}
                            />
                          )}
                        />
                      </Grid>

                      {/* Category */}
                      <Grid item xs={12} sm={6}>
                        <FormControl
                          fullWidth
                          error={!!errors.category}
                          required
                          sx={{ minWidth: { xs: 250, md: 250 } }}
                        >
                          <InputLabel>Category</InputLabel>
                          <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                label="Category"
                                sx={{
                                  minWidth: { xs: '100%', sm: 200, md: 250 },
                                  backgroundColor: '#1D2125',
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#85B8FF',
                                  },
                                }}
                              >
                                {categories.map((cat) => (
                                  <MenuItem key={cat} value={cat}>
                                    {cat}
                                  </MenuItem>
                                ))}
                              </Select>
                            )}
                          />
                          {errors.category && (
                            <Typography
                              variant="caption"
                              color="error.main"
                              sx={{ pl: 2, pt: 0.5 }}
                            >
                              {errors.category.message}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>

                      {/* Location */}
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="outlined"
                          startIcon={<AddLocationAltIcon />}
                          fullWidth
                          disabled
                          sx={{
                            minWidth: 250,
                            height: '56px',
                            borderStyle: 'dashed',
                            color: 'text.secondary',
                            borderColor: 'divider',
                            backgroundColor: '#1D2125',
                            fontSize: '0.95rem',
                            '&.Mui-disabled': {
                              borderColor: 'divider',
                              color: 'text.secondary',
                            },
                          }}
                        >
                          Add Location
                        </Button>
                      </Grid>

                      {/* File Upload */}
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          startIcon={<AttachFileIcon />}
                          fullWidth
                          disabled
                          sx={{
                            minWidth: { xs: 250, md: 300 },
                            height: '56px',
                            borderStyle: 'dashed',
                            color: 'text.secondary',
                            borderColor: 'divider',
                            backgroundColor: '#1D2125',
                            '&.Mui-disabled': {
                              borderColor: 'divider',
                              color: 'text.secondary',
                            },
                          }}
                        >
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500, mb: 0.5 }}
                            >
                              Attach Photos/Videos
                            </Typography>
                          </Box>
                        </Button>
                      </Grid>
                    </Grid>

                    {/* Issue Description (double size) */}
                    <Grid item xs={12}>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={10}
                            label="Description"
                            placeholder="Provide a detailed description of the issue..."
                            error={!!errors.description}
                            helperText={errors.description?.message}
                            required
                            sx={{
                              marginTop: 3,
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: '#1D2125',
                                '&:hover fieldset': { borderColor: '#85B8FF' },
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Action Buttons aligned at bottom */}
                    <Box
                      sx={{
                        mt: 'auto',
                        display: 'flex',
                        flexDirection: { xs: 'column-reverse', sm: 'row' },
                        justifyContent: 'flex-end',
                        gap: 2,
                        pt: 3,
                      }}
                    >
                      <Button
                        variant="outlined"
                        component={RouterLink}
                        to={CITIZEN_DASHBOARD_PATH}
                        disabled={loading}
                        size="large"
                        sx={{
                          minWidth: { xs: '100%', sm: 120, md: 150 },
                          height: '40px',
                          fontWeight: 500,
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        color="primary"
                        size="large"
                        startIcon={
                          loading ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <ReportIcon />
                          )
                        }
                        sx={{
                          minWidth: { xs: '100%', sm: 160, md: 200 },
                          height: '40px',
                          fontWeight: 600,
                          '&:hover': { backgroundColor: '#4178D6' },
                        }}
                      >
                        {loading ? 'Submitting...' : 'Submit Issue'}
                      </Button>
                    </Box>
                  </form>
                </Box>
              </Paper>
            </Grid>

            {/* Right section: Tips */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  backgroundColor: '#22272B',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TipsAndUpdatesIcon sx={{ mr: 1.5, color: '#FAA53D' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Reporting Tips
                    </Typography>
                  </Box>
                  <List dense>
                    {tips.map((tip, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <PriorityHighIcon
                            sx={{ fontSize: 16, color: 'primary.main' }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={tip}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: { color: 'text.primary' },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default ReportIssue;