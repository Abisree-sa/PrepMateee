import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

import { LandingPage } from './pages/LandingPage';
import { StudentLogin } from './pages/auth/StudentLogin';
import { StudentRegister } from './pages/auth/StudentRegister';
import { AdminLogin } from './pages/auth/AdminLogin';

import { StudentDashboard } from './pages/student/StudentDashboard';
import { ResumePage } from './pages/student/ResumePage';
import { CompanyPrepPage } from './pages/student/CompanyPrepPage';
import { AssessmentTakePage } from './pages/student/AssessmentTakePage';
import { MockInterviewPage } from './pages/student/MockInterviewPage';
import { AnalyticsPage } from './pages/student/AnalyticsPage';
import { MaterialsPage } from './pages/student/MaterialsPage';
import { HackathonsPage } from './pages/student/HackathonsPage';
import { PlacementOpportunitiesPage } from './pages/student/PlacementOpportunitiesPage';
import { AnnouncementDetailPage } from './pages/student/AnnouncementDetailPage';

import { CoordinatorDashboard } from './pages/coordinator/CoordinatorDashboard';
import { AssessmentBuilderPage } from './pages/coordinator/AssessmentBuilderPage';
import { StudentManagementPage } from './pages/coordinator/StudentManagementPage';
import { AuditPage } from './pages/coordinator/AuditPage';
import { LiveMonitoringPage } from './pages/coordinator/LiveMonitoringPage';
import { HackathonsManagerPage } from './pages/coordinator/HackathonsManagerPage';
import { PlacementManagerPage } from './pages/coordinator/PlacementManagerPage';
import { AnnouncementManagerPage } from './pages/coordinator/AnnouncementManagerPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole: 'STUDENT' | 'COORDINATOR' }> = ({
  children,
  allowedRole,
}) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-400 font-bold">Verifying PlacementReady Session...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (allowedRole === 'COORDINATOR' && user.role !== 'COORDINATOR' && user.role !== 'ADMIN') {
    return <Navigate to="/student/dashboard" replace />;
  }
  if (allowedRole === 'STUDENT' && user.role !== 'STUDENT') {
    return <Navigate to="/coordinator/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-400 font-bold">Loading...</div>;
  if (user?.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  if (user?.role === 'COORDINATOR' || user?.role === 'ADMIN') return <Navigate to="/coordinator/dashboard" replace />;
  return <LandingPage />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          {/* Public Auth Routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/register" element={<StudentRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/announcements/:id"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <AnnouncementDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/placements"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <PlacementOpportunitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/resume"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <ResumePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/company-prep"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <CompanyPrepPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/assessments"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <AssessmentTakePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/hackathons"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <HackathonsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/materials"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <MaterialsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/mock-interview"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <MockInterviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/analytics"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Coordinator Admin Routes */}
          <Route
            path="/coordinator/dashboard"
            element={
              <ProtectedRoute allowedRole="COORDINATOR">
                <CoordinatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/announcements"
            element={
              <ProtectedRoute allowedRole="COORDINATOR">
                <AnnouncementManagerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/placements"
            element={
              <ProtectedRoute allowedRole="COORDINATOR">
                <PlacementManagerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/live-monitoring"
            element={
              <ProtectedRoute allowedRole="COORDINATOR">
                <LiveMonitoringPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/assessment-builder"
            element={
              <ProtectedRoute allowedRole="COORDINATOR">
                <AssessmentBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/hackathons"
            element={
              <ProtectedRoute allowedRole="COORDINATOR">
                <HackathonsManagerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/students"
            element={
              <ProtectedRoute allowedRole="COORDINATOR">
                <StudentManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/materials"
            element={
              <ProtectedRoute allowedRole="COORDINATOR">
                <MaterialsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/proctoring-audits"
            element={
              <ProtectedRoute allowedRole="COORDINATOR">
                <AuditPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
