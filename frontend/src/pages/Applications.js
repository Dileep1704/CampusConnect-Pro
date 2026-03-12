import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiBriefcase, FiUser, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      let response;
      
      if (user?.role === 'student') {
        response = await api.get('/applications/my-applications');
      } else if (user?.role === 'company') {
        response = await api.get('/applications/company/applications');
      }
      
      setApplications(response.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status });
      toast.success(`Application ${status} successfully`);
      fetchApplications(); // Refresh list
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const withdrawApplication = async (applicationId) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      try {
        await api.delete(`/applications/${applicationId}`);
        toast.success('Application withdrawn');
        fetchApplications();
      } catch (error) {
        toast.error('Failed to withdraw application');
      }
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role === 'student' ? 'My Applications' : 'Received Applications'}
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.role === 'student' 
            ? 'Track and manage your internship applications'
            : 'Review and manage applications for your internships'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({applications.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({applications.filter(a => a.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('reviewed')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'reviewed' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Reviewed ({applications.filter(a => a.status === 'reviewed').length})
          </button>
          <button
            onClick={() => setFilter('shortlisted')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'shortlisted' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Shortlisted ({applications.filter(a => a.status === 'shortlisted').length})
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'accepted' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Accepted ({applications.filter(a => a.status === 'accepted').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'rejected' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejected ({applications.filter(a => a.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">No applications found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(app => (
            <div key={app._id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {user?.role === 'student' ? (
                        <FiBriefcase className="h-6 w-6 text-blue-600" />
                      ) : (
                        <FiUser className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user?.role === 'student' 
                          ? app.internship?.title 
                          : app.studentName}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-2">
                        {user?.role === 'student' 
                          ? app.internship?.companyName 
                          : `Applied for: ${app.internship?.title}`}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <FiCalendar className="mr-1" />
                          Applied: {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {app.coverLetter && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            <span className="font-medium">Cover Letter:</span> {app.coverLetter}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
                  {user?.role === 'company' && app.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateApplicationStatus(app._id, 'reviewed')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Mark Reviewed
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(app._id, 'shortlisted')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(app._id, 'rejected')}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {user?.role === 'student' && app.status === 'pending' && (
                    <button
                      onClick={() => withdrawApplication(app._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Withdraw Application
                    </button>
                  )}
                  
                  {app.resumeUrl && (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm text-center"
                    >
                      View Resume
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;