import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ResumeUpload from '../components/ResumeUpload';
import MatchScore from '../components/MatchScore';
import Spinner from '../components/Spinner';
import { FiAward, FiTrendingUp, FiStar, FiUpload } from 'react-icons/fi';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [stats, setStats] = useState({
    totalMatches: 0,
    topMatch: 0,
    appliedCount: 0
  });

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students/resume-analysis');
      console.log('Analysis response:', response.data);
      
      // Safely set data with fallbacks
      setResumeData(response.data.resumeData || null);
      setMatches(Array.isArray(response.data.matches) ? response.data.matches : []);
      setStats({
        totalMatches: response.data.matches?.length || 0,
        topMatch: response.data.matches?.[0]?.matchScore?.total || 0,
        appliedCount: 0
      });
      setShowUpload(false);
    } catch (error) {
      console.log('No resume found or error:', error.message);
      setShowUpload(true);
      setMatches([]);
      setResumeData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (data) => {
    console.log('Upload success data:', data);
    
    // Safely set data with fallbacks
    setResumeData(data.resumeData || null);
    setMatches(Array.isArray(data.matches) ? data.matches : []);
    setStats({
      totalMatches: data.matches?.length || 0,
      topMatch: data.matches?.[0]?.matchScore?.total || 0,
      appliedCount: 0
    });
    setShowUpload(false);
  };

  // Safely check if we have matches to display
  const hasMatches = matches && matches.length > 0;

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || 'Student'}!
        </h1>
        <p className="text-gray-600 mt-2">
          {!resumeData 
            ? 'Upload your resume to get personalized internship matches' 
            : 'Find your best matching internships below'}
        </p>
      </div>

      {/* Show Stats only if resume exists and has matches */}
      {resumeData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <FiAward className="h-8 w-8 mb-2" />
            <p className="text-sm opacity-90">Top Match</p>
            <p className="text-3xl font-bold">{stats.topMatch}%</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <FiTrendingUp className="h-8 w-8 mb-2" />
            <p className="text-sm opacity-90">Matching Internships</p>
            <p className="text-3xl font-bold">{stats.totalMatches}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <FiStar className="h-8 w-8 mb-2" />
            <p className="text-sm opacity-90">Applied</p>
            <p className="text-3xl font-bold">{stats.appliedCount}</p>
          </div>
        </div>
      )}

      {/* Resume Upload Section */}
      {showUpload ? (
        <div className="mb-8">
          <ResumeUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      ) : !resumeData ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center mb-8">
          <FiUpload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Resume Found
          </h3>
          <p className="text-gray-500 mb-6">
            Upload your resume to see matching internships and get personalized recommendations
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Upload Resume Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Resume Data */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Your Resume</h3>
                <button
                  onClick={() => setShowUpload(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Update
                </button>
              </div>
              
              {resumeData && (
                <>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Extracted Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills && resumeData.skills.length > 0 ? (
                        resumeData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No skills extracted</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Education</h4>
                    {resumeData.education && resumeData.education.length > 0 ? (
                      resumeData.education.map((edu, index) => (
                        <div key={index} className="text-sm text-gray-600 mb-1">
                          {edu.degree || 'Degree'} - {edu.institution || 'University'}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No education details</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Experience</h4>
                    <p className="text-sm text-gray-600">
                      {resumeData.experience?.length || 0} positions found
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Matches */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Best Matches
            </h2>
            
            {loading ? (
              <Spinner />
            ) : !hasMatches ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">
                  No matching internships found. Try updating your resume or check back later.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match, index) => (
                  <MatchScore key={index} match={match} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;