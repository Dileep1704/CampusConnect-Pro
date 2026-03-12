import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import EnhancedStudentDashboard from './pages/EnhancedStudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import Internships from './pages/Internships';
import Applications from './pages/Applications';
import PostInternship from './pages/PostInternship';

// Role-based dashboard component
const RoleBasedDashboard = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Return appropriate dashboard based on user role
  if (user?.role === 'student') {
    // Using enhanced dashboard with AI features
    return <EnhancedStudentDashboard />;
  } else if (user?.role === 'company') {
    return <CompanyDashboard />;
  } else if (user?.role === 'admin') {
    return <Dashboard />;
  } else {
    return <Navigate to="/" />;
  }
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            {/* ===== PUBLIC ROUTES ===== */}
            {/* Anyone can access these */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/internships" element={<Internships />} />
            
            {/* ===== PROTECTED ROUTES ===== */}
            {/* Require authentication */}
            
            {/* Dashboard - Role-based */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <RoleBasedDashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Applications - For both students and companies */}
            <Route 
              path="/applications" 
              element={
                <PrivateRoute>
                  <Applications />
                </PrivateRoute>
              } 
            />
            
            {/* Post Internship - Companies only */}
            <Route 
              path="/post-internship" 
              element={
                <PrivateRoute allowedRoles={['company', 'admin']}>
                  <PostInternship />
                </PrivateRoute>
              } 
            />
            
            {/* Student specific routes */}
            <Route 
              path="/student/dashboard" 
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <EnhancedStudentDashboard />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/student/applications" 
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <Applications />
                </PrivateRoute>
              } 
            />
            
            {/* Company specific routes */}
            <Route 
              path="/company/dashboard" 
              element={
                <PrivateRoute allowedRoles={['company']}>
                  <CompanyDashboard />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/company/applications" 
              element={
                <PrivateRoute allowedRoles={['company']}>
                  <Applications />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/company/post-internship" 
              element={
                <PrivateRoute allowedRoles={['company']}>
                  <PostInternship />
                </PrivateRoute>
              } 
            />
            
            {/* ===== FALLBACK ROUTE ===== */}
            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        
        {/* Toast notifications container */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
            loading: {
              duration: Infinity,
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}

export default App;