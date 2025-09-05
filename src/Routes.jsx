import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Loader from './components/Loader';

import {
  LOGIN_PATH,
  REGISTER_PATH,
  CITIZEN_DASHBOARD_PATH,
  STAFF_DASHBOARD_PATH,
  ADMIN_DASHBOARD_PATH
} from './const/routes';

const Login = lazy(() => import('./views/Auth/Login'));

const Register = lazy(() => import('./views/Auth/Register'));

const CitizenDashboard = lazy(() => import('./views/Citizen/Dashboard'));

const StaffDashboard = lazy(() => import('./views/Staff/Dashboard'));

const AdminDashboard = lazy(() => import('./views/Admin/Dashboard'));

function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Navigate to={LOGIN_PATH} replace />} />
        <Route path={LOGIN_PATH} element={<Login />} />
        <Route path={REGISTER_PATH} element={<Register />} />

        {/* --- Protected Routes --- */}
        <Route path={CITIZEN_DASHBOARD_PATH} element={<CitizenDashboard />} />
        <Route path={STAFF_DASHBOARD_PATH} element={<StaffDashboard />} />
        <Route path={ADMIN_DASHBOARD_PATH} element={<AdminDashboard />} />
        
        {/* --- 404 Not Found Route --- */}
        <Route path="*" element={<div>404: Page Not Found</div>} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;