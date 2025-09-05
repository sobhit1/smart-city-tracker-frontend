import React, { useState } from 'react';
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
    Alert,
    CircularProgress,
    Paper,
    Avatar,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { setAuth } from '../../state/authSlice';
import apiClient from '../../toolkit/apiClient';
import { REGISTER_API } from '../../const/api';
import { LOGIN_PATH, CITIZEN_DASHBOARD_PATH } from '../../const/routes';

const schema = yup.object().shape({
    full_name: yup.string().required('Full Name is required'),
    user_name: yup.string().required('Username is required'),
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
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setApiError(null);
        try {
            const response = await apiClient.post(REGISTER_API, data);
            dispatch(setAuth(response.data));
            navigate(CITIZEN_DASHBOARD_PATH);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            setApiError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
            <Container component="main" maxWidth="xs">
                <Paper
                    elevation={6}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 2,
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign Up
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, width: '100%' }}>
                        {apiError && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{apiError}</Alert>}

                        <TextField
                            margin="normal"
                            autoComplete="name"
                            name="full_name"
                            required
                            fullWidth
                            id="full_name"
                            label="Full Name"
                            autoFocus
                            {...register('full_name')}
                            error={!!errors.full_name}
                            helperText={errors.full_name?.message}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="user_name"
                            label="Username"
                            name="user_name"
                            autoComplete="username"
                            {...register('user_name')}
                            error={!!errors.user_name}
                            helperText={errors.user_name?.message}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            {...register('password')}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            id="confirmPassword"
                            {...register('confirmPassword')}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                        </Button>
                        <Link component={RouterLink} to={LOGIN_PATH} variant="body2">
                            Already have an account? Sign in
                        </Link>
                    </Box>
                </Paper>
                <Copyright sx={{ mt: 8, mb: 4 }} />
            </Container>
        </Box>
    );
}

export default Register;