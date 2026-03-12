import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Load user data from token
  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      // Save to localStorage
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      toast.success(`Welcome back, ${userData.name}!`);
      
      // Return success with user role for redirect
      return { 
        success: true, 
        role: userData.role 
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      
      // Save to localStorage
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      toast.success('Registration successful!');
      
      // Return success with user role for redirect
      return { 
        success: true, 
        role: newUser.role 
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await api.put('/users/profile', profileData);
      setUser(response.data);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Upload resume (for students)
  const uploadResume = async (file) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await api.post('/students/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update user with resume data
      setUser(prev => ({
        ...prev,
        resumeUrl: response.data.resumeUrl,
        parsedResume: response.data.resumeData
      }));
      
      toast.success('Resume uploaded successfully');
      return { success: true, data: response.data };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
      return { success: false };
    }
  };

  // Get dashboard based on role
  const getDashboardRoute = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'student':
        return '/dashboard'; // Will show StudentDashboard
      case 'company':
        return '/dashboard'; // Will show CompanyDashboard
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Value object to be provided to consumers
  const value = {
    // State
    user,
    loading,
    token,
    
    // Auth functions
    login,
    register,
    logout,
    updateProfile,
    uploadResume,
    loadUser,
    
    // Helper functions
    getDashboardRoute,
    hasRole,
    
    // Boolean flags
    isAuthenticated,
    isStudent: hasRole('student'),
    isCompany: hasRole('company'),
    isAdmin: hasRole('admin'),
    
    // User data getters
    userName: user?.name || '',
    userEmail: user?.email || '',
    userRole: user?.role || '',
    
    // Student specific
    hasResume: !!user?.resumeUrl,
    parsedResume: user?.parsedResume || null,
    
    // Company specific
    companyName: user?.companyName || '',
    isCompanyVerified: user?.isVerified || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;