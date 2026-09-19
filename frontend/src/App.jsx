import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/ui/SplashScreen';
import AnimatedBackground from './components/ui/AnimatedBackground';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Opportunities = lazy(() => import('./pages/Opportunities'));
const OpportunityDetail = lazy(() => import('./pages/OpportunityDetail'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Volunteer Pages
const VolunteerDashboard = lazy(() => import('./pages/volunteer/Dashboard'));
const VolunteerProfile = lazy(() => import('./pages/volunteer/Profile'));
const VolunteerApplications = lazy(() => import('./pages/volunteer/Applications'));
const Participation = lazy(() => import('./pages/volunteer/Participation'));
const Certificates = lazy(() => import('./pages/volunteer/Certificates'));
const VolunteerNotifications = lazy(() => import('./pages/volunteer/Notifications'));

// NGO Pages
const NGODashboard = lazy(() => import('./pages/ngo/Dashboard'));
const NGOProfile = lazy(() => import('./pages/ngo/Profile'));
const NGOOpportunities = lazy(() => import('./pages/ngo/Opportunities'));
const CreateOpportunity = lazy(() => import('./pages/ngo/CreateOpportunity'));
const EditOpportunity = lazy(() => import('./pages/ngo/EditOpportunity'));
const NGOApplications = lazy(() => import('./pages/ngo/Applications'));
const Attendance = lazy(() => import('./pages/ngo/Attendance'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const NGOVerification = lazy(() => import('./pages/admin/NGOVerification'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminOpportunities = lazy(() => import('./pages/admin/AdminOpportunities'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));

const PageLoader = () => (
  <div className="min-h-screen bg-transparent flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('vc_splash_seen');
  });

  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          {/* Global Animated Background fixed behind all content */}
          <AnimatedBackground />

          <AnimatePresence>
            {showSplash && (
              <SplashScreen 
                duration={5000} 
                onFinish={() => setShowSplash(false)} 
              />
            )}
          </AnimatePresence>
          <Toaster 
            position="top-right" 
            toastOptions={{ 
              style: { 
                background: '#111827', 
                color: '#f9fafb', 
                border: '1px solid rgba(255,255,255,0.1)' 
              } 
            }} 
          />
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/opportunities" element={<Opportunities />} />
                <Route path="/opportunities/:id" element={<OpportunityDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Volunteer Routes */}
                <Route path="/volunteer" element={<ProtectedRoute role="volunteer" />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<VolunteerDashboard />} />
                  <Route path="profile" element={<VolunteerProfile />} />
                  <Route path="applications" element={<VolunteerApplications />} />
                  <Route path="participation" element={<Participation />} />
                  <Route path="certificates" element={<Certificates />} />
                  <Route path="notifications" element={<VolunteerNotifications />} />
                </Route>

                {/* NGO Routes */}
                <Route path="/ngo" element={<ProtectedRoute role="ngo" />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<NGODashboard />} />
                  <Route path="profile" element={<NGOProfile />} />
                  <Route path="opportunities" element={<NGOOpportunities />} />
                  <Route path="opportunities/create" element={<CreateOpportunity />} />
                  <Route path="opportunities/:id/edit" element={<EditOpportunity />} />
                  <Route path="applications" element={<NGOApplications />} />
                  <Route path="attendance" element={<Attendance />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute role="admin" />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="ngos" element={<NGOVerification />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="opportunities" element={<AdminOpportunities />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="analytics" element={<Analytics />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
