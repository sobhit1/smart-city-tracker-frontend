import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { useRegister } from '../../api/authApi';
import { setAuth } from '../../state/authSlice';
import { showNotification } from '../../state/notificationSlice';
import { LOGIN_PATH, DASHBOARD_PATH } from '../../const/routes';

const schema = yup.object().shape({
    fullName: yup.string().required('Full Name is required'),
    userName: yup.string().required('Username is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
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

function Register() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const { mutate: registerMutation, isPending: loading } = useRegister({
        onSuccess: (data) => {
            dispatch(setAuth(data));
            navigate(DASHBOARD_PATH);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            dispatch(showNotification({ message: errorMessage, severity: 'error' }));
        },
    });

    const onSubmit = (data) => {
        const payload = {
            fullName: data.fullName,
            userName: data.userName,
            password: data.password,
        };
        registerMutation(payload);
    };

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
            <Container component="main" maxWidth="xs">
                <Paper
                    elevation={6}
                    sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2, }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Register
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, width: '100%' }}>
                        <TextField
                            margin="normal"
                            autoComplete="name"
                            name="fullName"
                            required
                            fullWidth
                            id="fullName"
                            label="Full Name"
                            autoFocus
                            {...register('fullName')}
                            error={!!errors.fullName}
                            helperText={errors.fullName?.message}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="userName"
                            label="Username"
                            name="userName"
                            autoComplete="username"
                            {...register('userName')}
                            error={!!errors.userName}
                            helperText={errors.userName?.message}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="new-password"
                            {...register('password')}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
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
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            {...register('confirmPassword')}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword((show) => !show)}
                                            onMouseDown={(e) => e.preventDefault()}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
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
                                    Registering...
                                </Box>
                            ) : (
                                'Register'
                            )}
                        </Button>
                        <Link component={RouterLink} to={LOGIN_PATH} variant="body2">
                            Already have an account? Login
                        </Link>
                    </Box>
                </Paper>
                <Copyright sx={{ mt: 8, mb: 4 }} />
            </Container>
        </Box>
    );
}

export default Register;