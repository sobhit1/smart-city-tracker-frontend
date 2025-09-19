import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import Loader from './components/Loader';
import MainLayout from './components/layout/MainLayout';
import {
  LOGIN_PATH,
  REGISTER_PATH,
  DASHBOARD_PATH,
  REPORT_ISSUE_PATH,
  ISSUE_DETAILS_PATH,
} from './const/routes';

const Login = lazy(() => import('./views/Auth/Login'));
const Register = lazy(() => import('./views/Auth/Register'));
const Dashboard = lazy(() => import('./views/dashboard/Dashboard'));
const ReportIssue = lazy(() => import('./views/dashboard/ReportIssue'));
const IssueDetails = lazy(() => import('./views/issues/IssueDetails'));

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
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
          path={DASHBOARD_PATH}
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={REPORT_ISSUE_PATH}
          element={
            <ProtectedRoute>
              <MainLayout>
                <ReportIssue />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ISSUE_DETAILS_PATH}
          element={
            <ProtectedRoute>
              <MainLayout>
                <IssueDetails />
              </MainLayout>
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
};

export default AppRoutes;