import { useMutation } from '@tanstack/react-query';
import apiClient from '../toolkit/apiClient';
import { LOGIN_API, REGISTER_API, LOGOUT_API } from '../const/api';

// --- API Functions ---

const loginUser = async (credentials) => {
    const { data } = await apiClient.post(LOGIN_API, credentials);
    return data;
};

const registerUser = async (userData) => {
    const { data } = await apiClient.post(REGISTER_API, userData);
    return data;
};

const logoutUser = async () => {
    const { data } = await apiClient.post(LOGOUT_API);
    return data;
};

// --- React Query Mutation Hooks ---

export const useLogin = (options) => {
    return useMutation({
        mutationFn: loginUser,
        ...options,
    });
};

export const useRegister = (options) => {
    return useMutation({
        mutationFn: registerUser,
        ...options,
    });
};

export const useLogout = (options) => {
    return useMutation({
        mutationFn: logoutUser,
        ...options,
    });
};