import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiFileText, FiPlusCircle } from 'react-icons/fi';
import Spinner from '../components/Spinner';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInternships: 0,
    totalApplications: 0,
    pendingApprovals: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get company's internships
      const internshipsRes = await api.get('/internships/company/my-posts');
      const internships = internshipsRes.data;
      
      // Get applications for company
      const applicationsRes = await api.get('/applications/company/applications');
      const applications = applicationsRes.data;
      
      setStats({
        totalInternships: internships.length,
        totalApplications: applications.length,
        pendingApprovals: applications.filter(a => a.status === 'pending').length
      });
      
      setRecentActivity(applications.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your internship postings and review applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Posted Internships</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalInternships}</p>
            </div>
            <div className="bg-white p-3 rounded-full">
              <FiBriefcase className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
            </div>
            <div className="bg-white p-3 rounded-full">
              <FiUsers className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Review</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
            <div className="bg-white p-3 rounded-full">
              <FiFileText className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <FiPlusCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Post New Internship</h3>
              <p className="text-gray-600 text-sm mb-4">Create a new internship opportunity for students</p>
              <Link
                to="/post-internship"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Post Now
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <FiFileText className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Applications</h3>
              <p className="text-gray-600 text-sm mb-4">{stats.pendingApprovals} applications pending review</p>
              <Link
                to="/applications"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Review
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Applications</h2>
        
        {recentActivity.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent applications</p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((app, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{app.studentName}</p>
                  <p className="text-sm text-gray-600">Applied for {app.internship?.title}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;