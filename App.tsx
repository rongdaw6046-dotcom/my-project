
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
import { ManageVoting } from './pages/admin/ManageVoting';
import { AdminMeetingSchedule } from './pages/admin/AdminMeetingSchedule';

import { UserDashboardHome } from './pages/user/UserDashboardHome';
import { UserDashboard } from './pages/user/UserDashboard';
import { MeetingDetail } from './pages/user/MeetingDetail';
import { UserCalendar } from './pages/user/UserCalendar';
import { MeetingHistory } from './pages/user/MeetingHistory';
import { UserReports } from './pages/user/UserReports';
import { ActionItems } from './pages/user/ActionItems';
import { UserSettings } from './pages/user/UserSettings';
import { UserVoting } from './pages/user/UserVoting';
import { UserMeetingSchedule } from './pages/user/UserMeetingSchedule';

import { PublicRSVP } from './pages/public/PublicRSVP';
import { UserRole } from './types';

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
    return <Navigate to={user.role === UserRole.ADMIN ? '/admin/dashboard' : '/user/home'} replace />;
  }

  return <Layout>{children}</Layout>;
};

const USER_ROLES = [UserRole.USER, UserRole.ADMIN];

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public RSVP Route */}
      <Route path="/rsvp/:id" element={<PublicRSVP />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ManageUsers /></ProtectedRoute>} />
      <Route path="/admin/meetings" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ManageMeetings /></ProtectedRoute>} />
      <Route path="/admin/schedule" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminMeetingSchedule /></ProtectedRoute>} />
      <Route path="/admin/meetings/new" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ManageMeeting /></ProtectedRoute>} />
      <Route path="/admin/meetings/edit/:id" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ManageMeeting /></ProtectedRoute>} />
      <Route path="/admin/meetings/:id/agenda" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ManageAgenda /></ProtectedRoute>} />
      <Route path="/admin/meetings/:id/attendees" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ManageAttendees /></ProtectedRoute>} />
      <Route path="/admin/meetings/:id/documents" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ManageDocuments /></ProtectedRoute>} />
      <Route path="/admin/meetings/:id/minutes" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ManageMinutes /></ProtectedRoute>} />
      <Route path="/admin/meetings/:id/voting" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ManageVoting /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ManageNotifications /></ProtectedRoute>} />

      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><Reports /></ProtectedRoute>} />

      {/* User Routes */}
      <Route path="/user/home" element={<ProtectedRoute allowedRoles={USER_ROLES}><UserDashboardHome /></ProtectedRoute>} />
      <Route path="/user/dashboard" element={<ProtectedRoute allowedRoles={USER_ROLES}><UserDashboard /></ProtectedRoute>} />
      <Route path="/user/schedule" element={<ProtectedRoute allowedRoles={USER_ROLES}><UserMeetingSchedule /></ProtectedRoute>} />
      <Route path="/user/calendar" element={<ProtectedRoute allowedRoles={USER_ROLES}><UserCalendar /></ProtectedRoute>} />
      <Route path="/user/history" element={<ProtectedRoute allowedRoles={USER_ROLES}><MeetingHistory /></ProtectedRoute>} />
      <Route path="/user/reports" element={<ProtectedRoute allowedRoles={USER_ROLES}><UserReports /></ProtectedRoute>} />
      <Route path="/user/actions" element={<ProtectedRoute allowedRoles={USER_ROLES}><ActionItems /></ProtectedRoute>} />
      <Route path="/user/voting" element={<ProtectedRoute allowedRoles={USER_ROLES}><UserVoting /></ProtectedRoute>} />
      <Route path="/user/settings" element={<ProtectedRoute allowedRoles={USER_ROLES}><UserSettings /></ProtectedRoute>} />

      <Route path="/user/meetings/:id" element={<ProtectedRoute allowedRoles={USER_ROLES}><MeetingDetail /></ProtectedRoute>} />

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