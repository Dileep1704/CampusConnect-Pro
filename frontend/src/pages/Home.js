import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiUsers, FiAward, FiArrowRight } from 'react-icons/fi';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">Find Your Dream</span>
          <span className="block text-blue-600">Internship Today</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Connect with top companies, apply to internships, and kickstart your career with CampusConnect Pro.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          {!isAuthenticated ? (
            <div className="rounded-md shadow">
              <Link
                to="/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started
                <FiArrowRight className="ml-2" />
              </Link>
            </div>
          ) : (
            <div className="rounded-md shadow">
              <Link
                to="/internships"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Browse Internships
                <FiArrowRight className="ml-2" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to succeed
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<FiBriefcase className="h-6 w-6" />}
                title="Browse Internships"
                description="Search through hundreds of internship opportunities from top companies."
              />
              <FeatureCard
                icon={<FiUsers className="h-6 w-6" />}
                title="Connect with Companies"
                description="Directly connect with recruiters and hiring managers."
              />
              <FeatureCard
                icon={<FiAward className="h-6 w-6" />}
                title="Track Applications"
                description="Monitor your application status and get real-time updates."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <StatCard number="500+" label="Internships Posted" />
            <StatCard number="1000+" label="Students Placed" />
            <StatCard number="100+" label="Partner Companies" />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="pt-6">
    <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
      <div className="-mt-6">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-md shadow-lg">
          <div className="text-white">{icon}</div>
        </div>
        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{title}</h3>
        <p className="mt-5 text-base text-gray-500">{description}</p>
      </div>
    </div>
  </div>
);

const StatCard = ({ number, label }) => (
  <div className="text-center">
    <div className="text-4xl font-extrabold text-white">{number}</div>
    <div className="mt-2 text-xl text-blue-100">{label}</div>
  </div>
);

export default Home;