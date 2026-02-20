
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './src/context/AppContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageUsers } from './pages/admin/ManageUsers';
import { ManageMeetings } from './pages/admin/ManageMeetings';
import { ManageMeeting } from './pages/admin/ManageMeeting';
import { ManageAgenda } from './pages/admin/ManageAgenda';
import { ManageAttendees } from './pages/admin/ManageAttendees';
import { ManageDocuments } from './pages/admin/ManageDocuments';
import { ManageMinutes } from './pages/admin/ManageMinutes';
import { ManageNotifications } from './pages/admin/ManageNotifications';
import { Reports } from './pages/admin/Reports';
import { UserDashboard } from './pages/user/UserDashboard';
import { MeetingDetail } from './pages/user/MeetingDetail';
import { PublicRSVP } from './pages/public/PublicRSVP';
import { UserRole } from './types';

// Protected Route Component
// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useApp();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-orange-600">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if trying to access unauthorized area
    return <Navigate to={user.role === UserRole.ADMIN ? '/admin/dashboard' : '/user/dashboard'} replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public RSVP Route (No Login Required) */}
      <Route path="/rsvp/:id" element={<PublicRSVP />} />


      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <ManageUsers />
        </ProtectedRoute>
      } />
      <Route path="/admin/meetings" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <ManageMeetings />
        </ProtectedRoute>
      } />
      <Route path="/admin/meetings/new" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <ManageMeeting />
        </ProtectedRoute>
      } />
      <Route path="/admin/meetings/edit/:id" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <ManageMeeting />
        </ProtectedRoute>
      } />
      <Route path="/admin/meetings/:id/agenda" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <ManageAgenda />
        </ProtectedRoute>
      } />
      <Route path="/admin/meetings/:id/attendees" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <ManageAttendees />
        </ProtectedRoute>
      } />
      <Route path="/admin/meetings/:id/documents" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <ManageDocuments />
        </ProtectedRoute>
      } />
      <Route path="/admin/meetings/:id/minutes" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <ManageMinutes />
        </ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <ManageNotifications />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <Reports />
        </ProtectedRoute>
      } />

      {/* User Routes */}
      <Route path="/user/dashboard" element={
        <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.ADMIN]}>
          <UserDashboard />
        </ProtectedRoute>
      } />
      <Route path="/user/meetings/:id" element={
        <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.ADMIN]}>
          <MeetingDetail />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;