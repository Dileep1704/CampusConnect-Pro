import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiFileText, FiEye, FiPlusCircle } from 'react-icons/fi';
import Spinner from '../components/Spinner';

const Dashboard = () => {
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
      
      if (user?.role === 'company') {
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
      } 
      else if (user?.role === 'student') {
        // Get student's applications
        const applicationsRes = await api.get('/applications/my-applications');
        const applications = applicationsRes.data;
        
        setStats({
          totalApplications: applications.length,
          pendingApprovals: applications.filter(a => a.status === 'pending').length,
          accepted: applications.filter(a => a.status === 'accepted').length
        });
        
        setRecentActivity(applications.slice(0, 5));
      }
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
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.role === 'student' && "Track your applications and find new opportunities."}
          {user?.role === 'company' && "Manage your internship postings and review applications."}
          {user?.role === 'admin' && "Monitor platform activity and manage users."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {user?.role === 'company' && (
          <>
            <StatCard
              icon={<FiBriefcase className="h-8 w-8 text-blue-600" />}
              label="Posted Internships"
              value={stats.totalInternships}
              bgColor="bg-blue-50"
            />
            <StatCard
              icon={<FiUsers className="h-8 w-8 text-green-600" />}
              label="Total Applications"
              value={stats.totalApplications}
              bgColor="bg-green-50"
            />
            <StatCard
              icon={<FiFileText className="h-8 w-8 text-yellow-600" />}
              label="Pending Review"
              value={stats.pendingApprovals}
              bgColor="bg-yellow-50"
            />
          </>
        )}

        {user?.role === 'student' && (
          <>
            <StatCard
              icon={<FiBriefcase className="h-8 w-8 text-blue-600" />}
              label="Applied"
              value={stats.totalApplications}
              bgColor="bg-blue-50"
            />
            <StatCard
              icon={<FiEye className="h-8 w-8 text-yellow-600" />}
              label="Under Review"
              value={stats.pendingApprovals}
              bgColor="bg-yellow-50"
            />
            <StatCard
              icon={<FiUsers className="h-8 w-8 text-green-600" />}
              label="Accepted"
              value={stats.accepted || 0}
              bgColor="bg-green-50"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {user?.role === 'company' && (
          <>
            <QuickActionCard
              title="Post New Internship"
              description="Create a new internship opportunity for students"
              buttonText="Post Now"
              link="/post-internship"
              icon={<FiPlusCircle className="h-6 w-6" />}
              color="blue"
            />
            <QuickActionCard
              title="Review Applications"
              description={`${stats.pendingApprovals} applications pending your review`}
              buttonText="Review"
              link="/applications"
              icon={<FiFileText className="h-6 w-6" />}
              color="green"
            />
          </>
        )}

        {user?.role === 'student' && (
          <>
            <QuickActionCard
              title="Browse Internships"
              description="Find the perfect internship opportunity"
              buttonText="Browse"
              link="/internships"
              icon={<FiBriefcase className="h-6 w-6" />}
              color="blue"
            />
            <QuickActionCard
              title="Track Applications"
              description={`${stats.pendingApprovals} applications in progress`}
              buttonText="Track"
              link="/applications"
              icon={<FiEye className="h-6 w-6" />}
              color="green"
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent activity to show
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <ActivityItem 
                key={index} 
                activity={activity} 
                role={user?.role} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, bgColor }) => (
  <div className={`${bgColor} rounded-lg p-6`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="bg-white p-3 rounded-full">
        {icon}
      </div>
    </div>
  </div>
);

const QuickActionCard = ({ title, description, buttonText, link, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg bg-${color}-100 text-${color}-600`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-4">{description}</p>
          <Link
            to={link}
            className={`inline-block px-4 py-2 ${colorClasses[color]} text-white text-sm rounded-md transition-colors`}
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity, role }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-green-100 text-green-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (role === 'company') {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FiUsers className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{activity.studentName || 'Student'}</p>
            <p className="text-sm text-gray-600">
              Applied for {activity.internship?.title}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
          {activity.status}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <FiBriefcase className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{activity.internship?.title}</p>
          <p className="text-sm text-gray-600">
            at {activity.internship?.companyName}
          </p>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
        {activity.status}
      </span>
    </div>
  );
};

export default Dashboard;