import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiClock, FiDollarSign, FiBriefcase, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    location: ''
  });
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchInternships();
  }, [filters]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.type) params.append('type', filters.type);
      if (filters.location) params.append('location', filters.location);
      
      const response = await api.get(`/internships?${params.toString()}`);
      setInternships(response.data);
    } catch (error) {
      console.error('Error fetching internships:', error);
      toast.error('Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (internshipId) => {
    if (!isAuthenticated) {
      toast.error('Please login to apply');
      return;
    }

    if (user?.role !== 'student') {
      toast.error('Only students can apply for internships');
      return;
    }

    try {
      await api.post('/applications', { internshipId });
      toast.success('Application submitted successfully!');
      fetchInternships(); // Refresh to update count
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    }
  };

  const locations = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad', 'Remote'];
  const types = ['All', 'Full-time', 'Part-time', 'Remote', 'Hybrid'];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Internships</h1>
        <p className="text-gray-600 mt-2">
          Browse through hundreds of internship opportunities
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search internships..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          {/* Type Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            {types.slice(1).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          >
            <option value="">All Locations</option>
            {locations.slice(1).map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => setFilters({ search: '', type: '', location: '' })}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Found {internships.length} internship{internships.length !== 1 ? 's' : ''}
      </div>

      {/* Internships List */}
      {loading ? (
        <Spinner />
      ) : internships.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <img 
            src="/assets/images/illustrations/no-data.svg" 
            alt="No internships"
            className="w-48 h-48 mx-auto mb-4"
            onError={(e) => e.target.style.display = 'none'}
          />
          <p className="text-gray-500">No internships found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {internships.map(internship => (
            <div key={internship._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {internship.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-3">{internship.companyName}</p>
                  
                  <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-500">
                    <span className="flex items-center">
                      <FiMapPin className="mr-1" /> {internship.location}
                    </span>
                    <span className="flex items-center">
                      <FiBriefcase className="mr-1" /> {internship.type}
                    </span>
                    <span className="flex items-center">
                      <FiClock className="mr-1" /> {internship.duration}
                    </span>
                    <span className="flex items-center">
                      <FiDollarSign className="mr-1" /> {internship.stipend}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {internship.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {internship.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-4">
                      📊 {internship.applicationsCount || 0} / {internship.openings} applications
                    </span>
                    <span>
                      📅 Deadline: {new Date(internship.applicationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-6">
                  {isAuthenticated && user?.role === 'student' && (
                    <button
                      onClick={() => handleApply(internship._id)}
                      className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Apply Now
                    </button>
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

export default Internships;