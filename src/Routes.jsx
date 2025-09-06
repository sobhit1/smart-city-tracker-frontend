import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import Loader from './components/Loader';
import {
  LOGIN_PATH,
  REGISTER_PATH,
  CITIZEN_DASHBOARD_PATH,
  STAFF_DASHBOARD_PATH,
  ADMIN_DASHBOARD_PATH,
} from './const/routes';

const Login = lazy(() => import('./views/Auth/Login'));
const Register = lazy(() => import('./views/Auth/Register'));
const CitizenDashboard = lazy(() => import('./views/Citizen/Dashboard'));
const StaffDashboard = lazy(() => import('./views/Staff/Dashboard'));
const AdminDashboard = lazy(() => import('./views/Admin/Dashboard'));

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to={LOGIN_PATH} replace />;
  }

  if (allowedRoles && !allowedRoles.some((role) => user?.roles.includes(role))) {
    return <Navigate to={LOGIN_PATH} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Navigate to={LOGIN_PATH} replace />} />
        <Route path={LOGIN_PATH} element={<Login />} />
        <Route path={REGISTER_PATH} element={<Register />} />

        {/* --- Protected Routes --- */}
        <Route
          path={CITIZEN_DASHBOARD_PATH}
          element={
            <ProtectedRoute allowedRoles={['ROLE_CITIZEN']}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={STAFF_DASHBOARD_PATH}
          element={
            <ProtectedRoute allowedRoles={['ROLE_STAFF']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ADMIN_DASHBOARD_PATH}
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* --- 404 Not Found Route --- */}
        <Route path="*" element={<div>404: Page Not Found</div>} />
      </Routes>
    </Suspense>
  );
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default AppRoutes;