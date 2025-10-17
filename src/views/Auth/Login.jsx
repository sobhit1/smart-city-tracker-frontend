import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  CircularProgress,
  Paper,
  Avatar,
  IconButton,
  InputAdornment,
  Chip,
  Stack,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';

import { useLogin } from '../../api/authApi';
import { setAuth } from '../../state/authSlice';
import { showNotification } from '../../state/notificationSlice';
import { REGISTER_PATH, DASHBOARD_PATH } from '../../const/routes';

const schema = yup.object().shape({
  userName: yup.string().required('Username is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="#">
        Smart City Issue Tracker
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      userName: '',
      password: ''
    }
  });

  const { mutate: loginMutation, isPending: loading } = useLogin({
    onSuccess: (data) => {
      dispatch(setAuth(data));
      navigate(DASHBOARD_PATH);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      dispatch(showNotification({ message: errorMessage, severity: 'error' }));
    },
  });

  const onSubmit = (data) => {
    loginMutation(data);
  };

  const handleDemoLogin = (userName, password) => {
    setValue('userName', userName, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Container component="main" maxWidth="lg">
        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Login Form */}
          <Box sx={{ flex: '0 0 450px', width: '450px' }}>
            <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
              <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
                Login
              </Typography>
              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
                <Controller
                  name="userName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      margin="normal"
                      required
                      fullWidth
                      id="userName"
                      label="Username"
                      name="userName"
                      autoComplete="username"
                      autoFocus
                      error={!!errors.userName}
                      helperText={errors.userName?.message}
                    />
                  )}
                />
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="current-password"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword((show) => !show)}
                              onMouseDown={(e) => e.preventDefault()}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={24} color="inherit" />
                      Logging in...
                    </Box>
                  ) : (
                    'Login'
                  )}
                </Button>
                <Link component={RouterLink} to={REGISTER_PATH} variant="body2">
                  {"Don't have an account? Register"}
                </Link>
              </Box>
            </Paper>
          </Box>

          {/* Demo Credentials - Side Panel */}
          <Box sx={{ flex: '0 0 380px', width: '380px' }}>
            <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoOutlinedIcon color="primary" fontSize="small" />
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    Demo Credentials
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Use these credentials to test the application
                </Typography>

                {/* Admin Credentials */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <AdminPanelSettingsIcon sx={{ color: 'error.main', fontSize: 20 }} />
                    <Chip label="Admin" color="error" size="small" />
                  </Box>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Username:</strong> admin
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                      <strong>Password:</strong> Admin@123
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      fullWidth
                      onClick={() => handleDemoLogin('admin', 'Admin@123')}
                    >
                      Use Admin Credentials
                    </Button>
                  </Paper>
                </Box>

                {/* Staff Credentials */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <BadgeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Chip label="Staff" color="primary" size="small" />
                  </Box>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Username:</strong> staff
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                      <strong>Password:</strong> Staff@123
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={() => handleDemoLogin('staff', 'Staff@123')}
                    >
                      Use Staff Credentials
                    </Button>
                  </Paper>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Box>
        
        <Copyright sx={{ mt: 4 }} />
      </Container>
    </Box>
  );
}

export default Login;