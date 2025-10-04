import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  FormHelperText,
} from '@mui/material';
import {
  Report as ReportIcon,
  TipsAndUpdates as TipsAndUpdatesIcon,
  PriorityHigh as PriorityHighIcon,
  MyLocation as MyLocationIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { createIssue } from '../../api/issuesApi';
import { useCategories } from '../../hooks/useLookups';
import { showNotification } from '../../state/notificationSlice';
import { DASHBOARD_PATH } from '../../const/routes';

const schema = yup.object().shape({
  title: yup.string().required('Issue title is required').min(10, 'Title must be at least 10 characters long'),
  description: yup.string().required('Description is required').min(20, 'Description must be at least 20 characters long'),
  category: yup.string().required('Please select a category').notOneOf([''], 'Please select a category'),
  location: yup.object().shape({
    lat: yup.number().required(),
    lng: yup.number().required(),
  }).nullable().required('Please select a location on the map.'),
  files: yup.array().min(1, 'Please upload at least one image.').max(5, 'You can upload a maximum of 5 images.'),
});

const tips = [
  'Be specific about the location and nature of the issue',
  'Include clear photos when possible to help with identification',
  'Provide detailed descriptions to help prioritize the issue',
  'Check if similar issues have already been reported'
];

function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

function ReportIssue() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mapCenter, setMapCenter] = useState([18.61, 73.72]);

  const { data: categoriesData, isLoading: areCategoriesLoading } = useCategories();
  const categories = categoriesData?.map(c => c.name) || [];

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      location: null,
      files: [],
    },
  });

  const selectedLocation = watch('location');
  const selectedFiles = watch('files');
  
  const { mutate: createIssueMutation, isPending: loading } = useMutation({
      mutationFn: createIssue,
      onSuccess: () => {
          dispatch(showNotification({ message: 'Issue reported successfully!', severity: 'success' }));
          queryClient.invalidateQueries({ queryKey: ['issues'] });
          navigate(DASHBOARD_PATH);
      },
      onError: (error) => {
          const errorMessage = error.response?.data?.message || 'Failed to report issue. Please try again.';
          dispatch(showNotification({ message: errorMessage, severity: 'error' }));
      }
  });

  const onSubmit = (data) => {
    createIssueMutation(data);
  };
  
  const handleGetCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = { lat: latitude, lng: longitude };
        setValue('location', newPos, { shouldValidate: true });
        setMapCenter([latitude, longitude]);
      },
      (error) => {
        dispatch(showNotification({ message: 'Could not get your location. Please select manually.', severity: 'error' }));
      }
    );
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = [...selectedFiles, ...files].slice(0, 5);
    setValue('files', newFiles, { shouldValidate: true });
  };

  const handleRemoveFile = (indexToRemove) => {
    const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    setValue('files', newFiles, { shouldValidate: true });
  };


  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#1D2125',
        py: 4,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="xl" sx={{ py: 0, px: { xs: 3, sm: 4, md: 5 }, flexGrow: 1 }}>
          {/* Header Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'primary.main', mb: 2, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}>
              Report a New Issue
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 700, fontSize: { xs: '0.9rem', sm: '1rem' }, lineHeight: 1.6 }}>
              Help improve your community by reporting issues that need attention
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Left section: Form */}
            <Grid item xs={12} lg={8} display="flex" flexDirection="column">
              <Paper elevation={0} sx={{ borderRadius: 3, backgroundColor: '#22272B', border: '1px solid', borderColor: 'divider', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: { xs: 3, sm: 4, md: 5 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ backgroundColor: 'primary.main', borderRadius: 2, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2.5 }}>
                      <ReportIcon sx={{ color: 'white', fontSize: 22 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                      Issue Details
                    </Typography>
                  </Box>

                  <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Grid container spacing={4} sx={{ flexGrow: 1 }}>
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
                                minWidth: { xs: '60vw', md: '50vw' },
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: '#1D2125',
                                  height: '56px',
                                  '&:hover fieldset': { borderColor: '#85B8FF' },
                                },
                                '& .MuiInputLabel-root': {
                                  fontSize: '1rem',
                                },
                                '& .MuiOutlinedInput-input': {
                                  fontSize: '1rem',
                                  padding: '16px 14px',
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
                          sx={{
                            minHeight: '56px',
                            '& .MuiInputLabel-root': {
                              fontSize: '1rem',
                            },
                          }}
                        >
                          <InputLabel>Category</InputLabel>
                          <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                label="Category"
                                disabled={areCategoriesLoading}
                                sx={{
                                  minWidth: { xs: '60vw', md: '25vw' },
                                  height: '56px',
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#85B8FF',
                                  },
                                  '& .MuiSelect-select': {
                                    fontSize: '1rem',
                                    padding: '16px 14px',
                                  },
                                }}
                              >
                                {categories.map((cat) => (
                                  <MenuItem key={cat} value={cat} sx={{ fontSize: '1rem' }}>
                                    {cat}
                                  </MenuItem>
                                ))}
                              </Select>
                            )}
                          />
                          {errors.category && (
                            <FormHelperText
                              sx={{
                                pl: 2,
                                pt: 1,
                                fontSize: '0.875rem'
                              }}
                            >
                              {errors.category.message}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>

                      {/* Issue Description */}
                      <Grid item xs={12}>
                        <Controller
                          name="description"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              multiline
                              rows={8}
                              label="Description"
                              placeholder="Provide a detailed description of the issue..."
                              error={!!errors.description}
                              helperText={errors.description?.message}
                              required
                              sx={{
                                minWidth: { xs: '60vw', sm: '70vw', md: '80vw' },
                                mt: 1,
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: '#1D2125',
                                  '&:hover fieldset': { borderColor: '#85B8FF' },
                                },
                                '& .MuiInputLabel-root': {
                                  fontSize: '1rem',
                                },
                                '& .MuiOutlinedInput-input': {
                                  fontSize: '1rem',
                                  lineHeight: 1.6,
                                },
                              }}
                            />
                          )}
                        />
                      </Grid>

                      {/* Location Picker */}
                      <Grid item xs={12}>
                        <Box sx={{
                          minWidth: { xs: '60vw', md: '40vw' },
                          border: 1,
                          borderColor: errors.location ? 'error.main' : 'divider',
                          borderRadius: 2,
                          p: 2,
                        }}>
                          <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                            px: 1
                          }}>
                            <Typography
                              variant="subtitle1"
                              component="label"
                              sx={{
                                fontWeight: 500,
                                fontSize: '1rem',
                                color: 'text.secondary'
                              }}
                            >
                              Select Location*
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<MyLocationIcon />}
                              onClick={handleGetCurrentLocation}
                              sx={{
                                minHeight: '32px',
                                fontSize: '0.875rem',
                                fontWeight: 500
                              }}
                            >
                              Use Current Location
                            </Button>
                          </Box>
                          <Box sx={{
                            height: 350,
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider'
                          }}>
                            <MapContainer
                              center={mapCenter}
                              zoom={15}
                              style={{ height: '100%', width: '100%' }}
                              key={mapCenter.join(',')}
                            >
                              <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              />
                              {selectedLocation && <Marker position={[selectedLocation.lat, selectedLocation.lng]} />}
                              <LocationPicker onLocationSelect={(latlng) => setValue('location', latlng, { shouldValidate: true })} />
                            </MapContainer>
                          </Box>
                          {errors.location && (
                            <FormHelperText error sx={{ px: 1, pt: 1, fontSize: '0.875rem' }}>
                              {errors.location.message}
                            </FormHelperText>
                          )}
                        </Box>
                      </Grid>

                      {/* File Upload */}
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<AttachFileIcon />}
                          fullWidth
                          sx={{
                            minWidth: { xs: '60vw', md: '38vw' },
                            height: '64px',
                            borderStyle: 'dashed',
                            justifyContent: 'center',
                            borderColor: errors.files ? 'error.main' : 'divider',
                            fontSize: '1rem',
                            fontWeight: 500,
                            borderWidth: 2,
                            '&:hover': {
                              borderWidth: 2,
                              borderColor: errors.files ? 'error.main' : 'primary.main',
                            }
                          }}
                        >
                          Attach Photos/Videos (up to 5)
                          <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                        </Button>
                        {errors.files && (
                          <FormHelperText error sx={{ mt: 1, fontSize: '0.875rem' }}>
                            {errors.files.message}
                          </FormHelperText>
                        )}
                        {selectedFiles.length > 0 && (
                          <Grid container spacing={2} sx={{ mt: 2 }}>
                            {selectedFiles.map((file, index) => (
                              <Grid item key={index}>
                                <Box sx={{ position: 'relative' }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveFile(index)}
                                    sx={{
                                      position: 'absolute',
                                      top: -8,
                                      right: -8,
                                      zIndex: 1,
                                      bgcolor: 'rgba(0,0,0,0.8)',
                                      width: 24,
                                      height: 24,
                                      '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' }
                                    }}
                                  >
                                    <CloseIcon fontSize="small" sx={{ color: 'white', fontSize: '16px' }} />
                                  </IconButton>
                                  <Box
                                    component="img"
                                    src={URL.createObjectURL(file)}
                                    sx={{
                                      height: 88,
                                      width: 88,
                                      objectFit: 'cover',
                                      borderRadius: 2,
                                      border: '1px solid',
                                      borderColor: 'divider'
                                    }}
                                  />
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        )}
                      </Grid>

                      {/* Action Buttons */}
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            mt: 4,
                            display: 'flex',
                            flexDirection: { xs: 'column-reverse', sm: 'row' },
                            justifyContent: 'flex-end',
                            gap: 3,
                            pt: 2,
                          }}
                        >
                          <Button
                            variant="outlined"
                            component={RouterLink}
                            to={DASHBOARD_PATH}
                            disabled={loading}
                            size="large"
                            sx={{
                              minWidth: { xs: '100%', sm: 140 },
                              height: '48px',
                              fontWeight: 500,
                              fontSize: '1rem',
                              borderRadius: 2,
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
                              minWidth: { xs: '100%', sm: 180 },
                              height: '48px',
                              fontWeight: 600,
                              fontSize: '1rem',
                              borderRadius: 2,
                              '&:hover': { backgroundColor: '#4178D6' },
                            }}
                          >
                            {loading ? 'Submitting...' : 'Submit Issue'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </form>
                </Box>
              </Paper>
            </Grid>

            {/* Right section: Tips */}
            <Grid item xs={12} lg={4}>
              <Card
                sx={{
                  backgroundColor: '#22272B',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  height: { lg: 'fit-content' },
                  position: { lg: 'sticky' },
                  top: { lg: '2rem' },
                }}
              >
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TipsAndUpdatesIcon sx={{ mr: 2, color: '#FAA53D', fontSize: '1.5rem' }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                      }}
                    >
                      Reporting Tips
                    </Typography>
                  </Box>
                  <List dense sx={{ p: 0 }}>
                    {tips.map((tip, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          px: 0,
                          py: 1.5,
                          alignItems: 'flex-start'
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                          <PriorityHighIcon
                            sx={{ fontSize: 18, color: 'primary.main' }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={tip}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: {
                              color: 'text.primary',
                              fontSize: '0.9rem',
                              lineHeight: 1.5
                            },
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