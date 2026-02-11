import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/index';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/Settingspage';

// Patient pages
import PatientRegisterPage from './pages/patient/PatientRegisterPage';
import BookAppointmentPage from './pages/patient/BookAppointmentPage';

// Provider pages
import ProviderRegisterPage from './pages/provider/ProviderRegisterPage';
import ProviderDashboardPage from './pages/provider/ProviderDashboardPage';
import ProviderAvailabilityPage from './pages/provider/ProviderAvailabilityPage';
import ProviderSettingsPage from './pages/provider/ProviderSettingsPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

// Shared pages
import VerifyOTPPage from './pages/shared/VerifyOTPPage';
import ForgotPasswordPage from './pages/shared/ForgotPasswordPage';
import ResetPasswordPage from './pages/shared/ResetPasswordPage';
import ProviderDetailsPage from './pages/shared/ProviderDetailsPage';


// Role Protected Route - checks both authentication and user role
const RoleProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: string[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, userType } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userType) {
    // Normalize userType for comparison (handle both 'doctor' and 'provider')
    const normalizedUserType = userType.toLowerCase();

    // Check if user has access - treat 'doctor' and 'provider' as same role
    const hasAccess = allowedRoles.some(role => {
      const normalizedRole = role.toLowerCase();
      if (normalizedRole === 'provider' || normalizedRole === 'provider') {
        return normalizedUserType === 'provider' || normalizedUserType === 'provider';
      }
      return normalizedRole === normalizedUserType;
    });

    if (!hasAccess) {
      // Redirect to user's appropriate dashboard if they don't have access
      let redirectPath = '/dashboard';
      if (normalizedUserType === 'provider' || normalizedUserType === 'provider') {
        redirectPath = '/provider/dashboard';
      } else if (normalizedUserType === 'admin') {
        redirectPath = '/admin/dashboard';
      }
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

// Public Route - redirect to dashboard if already logged in (role-based)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, userType } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    // Role-based redirect
    const redirectPath = userType === 'provider'
      ? '/provider/dashboard'
      : userType === 'admin'
      ? '/admin/dashboard'
      : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
            {/* Public Home Page */}
            <Route path="/" element={<HomePage />} />

            {/* Public routes - redirect if logged in */}
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <PatientRegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="/provider/register"
              element={
                <PublicRoute>
                  <ProviderRegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordPage/>
                </PublicRoute>
              }
            />
            <Route
              path="/verify-otp"
              element={
                <PublicRoute>
                  <VerifyOTPPage />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />

            {/* Patient Dashboard - only for patients */}
            <Route
              path="/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['patient']}>
                  <DashboardPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/provider/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['provider']}>
                  <ProviderDashboardPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/provider/availability"
              element={
                <RoleProtectedRoute allowedRoles={['provider']}>
                  <ProviderAvailabilityPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/provider/settings"
              element={
                <RoleProtectedRoute allowedRoles={['provider']}>
                  <ProviderSettingsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </RoleProtectedRoute>
              }
            />

            {/* Backward compatibility - redirect old /profile to /dashboard */}
            <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
            
            {/* Patient Settings - only for patients */}
            <Route
              path="/settings"
              element={
                <RoleProtectedRoute allowedRoles={['patient']}>
                  <SettingsPage />
                </RoleProtectedRoute>
              }
            />
            
            {/* Book Appointment - Can be accessed by anyone, but better experience when logged in */}
            <Route path="/book-appointment" element={<BookAppointmentPage />} />

            {/* Provider Details - Public route */}
            <Route path="/provider/:id" element={<ProviderDetailsPage />} />

            {/* Add more routes here as needed */}
          </Routes>
        </main>
        <Footer />
      </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;