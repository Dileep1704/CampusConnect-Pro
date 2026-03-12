import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import matchingService from '../utils/matchingService';
import AIMatchScore from '../components/AIMatchScore';
import ResumeUpload from '../components/ResumeUpload';
import AIFeedback from '../components/AIFeedback';
import SkillRoadmap from '../components/SkillRoadmap';
import { 
  FiAward, 
  FiTrendingUp, 
  FiStar, 
  FiActivity,
  FiBriefcase,
  FiRefreshCw,
  FiDownload,
  FiCpu,
  FiThumbsUp,
  FiBookOpen,
  FiAlertCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const EnhancedStudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [activeTab, setActiveTab] = useState('matches');
  const [aiStatus, setAiStatus] = useState({
    transformers: false,
    vectorSearch: false,
    mlModel: false
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      
      // First check if user has resume
      try {
        // Fetch enhanced matches
        const matchesRes = await matchingService.getEnhancedMatches(20);
        console.log('Matches response:', matchesRes);
        setMatches(matchesRes.matches || []);
        setAiStatus(matchesRes.usingAI || {});
        
        // Fetch resume feedback and recommendations
        try {
          const feedbackRes = await matchingService.getResumeFeedback();
          console.log('Feedback response:', feedbackRes);
          
          if (feedbackRes && feedbackRes.feedback) {
            setFeedback(feedbackRes.feedback);
            setRecommendations(feedbackRes.recommendations || []);
            setRoadmap(feedbackRes.roadmap);
          }
        } catch (feedbackErr) {
          console.log('No feedback available yet:', feedbackErr.message);
        }
        
        setShowUpload(false);
      } catch (mainErr) {
        console.error('Main data fetch error:', mainErr);
        if (mainErr.response?.status === 404) {
          setShowUpload(true);
          setMatches([]);
          setFeedback(null);
        } else {
          toast.error('Failed to load dashboard data');
        }
      }
    } catch (error) {
      console.error('Error in fetchAllData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = async (data) => {
    console.log('Upload success data:', data);
    
    // Set the matches from upload response immediately
    if (data.matches && data.matches.length > 0) {
      setMatches(data.matches);
      toast.success(`Found ${data.matches.length} matching internships!`);
    } else {
      toast.success('Resume uploaded successfully!');
    }
    
    setShowUpload(false);
    
    // Then fetch all data to get feedback and recommendations
    await fetchAllData();
  };

  const handleRefresh = () => {
    toast.promise(
      fetchAllData(),
      {
        loading: 'Refreshing data...',
        success: 'Dashboard updated!',
        error: 'Failed to refresh'
      }
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading AI-powered dashboard...</p>
      </div>
    );
  }

  // Show upload section if no matches and not loading
  if (showUpload || (matches.length === 0 && !loading)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-2">
            Upload your resume to get AI-powered internship recommendations
          </p>
        </div>
        <ResumeUpload onUploadSuccess={handleUploadSuccess} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with AI Status */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 mt-2">
              AI-powered insights and personalized recommendations
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Refresh data"
            >
              <FiRefreshCw size={20} />
            </button>
            
            {/* AI Status Badge */}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg">
              <FiCpu className="h-5 w-5" />
              <span className="text-sm font-medium">AI Enhanced</span>
            </div>
          </div>
        </div>

        {/* AI Features Status */}
        <div className="mt-4 flex flex-wrap gap-3">
          {aiStatus.transformers && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center">
              <FiThumbsUp className="mr-1" size={12} />
              Sentence Transformers Active
            </span>
          )}
          {aiStatus.vectorSearch && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center">
              <FiTrendingUp className="mr-1" size={12} />
              Vector Search Active
            </span>
          )}
          {aiStatus.mlModel && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs flex items-center">
              <FiCpu className="mr-1" size={12} />
              ML Model Active
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <FiAward className="h-8 w-8 mb-2" />
            <p className="text-sm opacity-90">Total Matches</p>
            <p className="text-3xl font-bold">{matches.length}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <FiTrendingUp className="h-8 w-8 mb-2" />
            <p className="text-sm opacity-90">Top Match</p>
            <p className="text-3xl font-bold">
              {matches[0]?.matchScore?.total || 0}%
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <FiStar className="h-8 w-8 mb-2" />
            <p className="text-sm opacity-90">Skills Matched</p>
            <p className="text-3xl font-bold">
              {matches[0]?.matchScore?.matchedSkills?.length || 0}
            </p>
          </div>
        </div>
      )}

      {/* AI Feedback Banner - Only show if feedback exists */}
      {feedback && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <FiActivity className="mr-2 text-blue-600" />
                AI Resume Analysis
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Resume Score</span>
                    <span className="text-sm font-semibold text-blue-600">{feedback.score || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${feedback.score || 0}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  View Full Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation - Only show if we have content for tabs */}
      {(feedback || roadmap) && (
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('matches')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'matches'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiBriefcase className="inline mr-2" />
              AI Matches ({matches.length})
            </button>
            {feedback && (
              <button
                onClick={() => setActiveTab('feedback')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'feedback'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiActivity className="inline mr-2" />
                Resume Feedback
              </button>
            )}
            {roadmap && (
              <button
                onClick={() => setActiveTab('roadmap')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'roadmap'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiBookOpen className="inline mr-2" />
                Skill Roadmap
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'matches' && (
          <div className="space-y-6">
            {matches.length > 0 ? (
              matches.map((match, index) => (
                <AIMatchScore key={index} match={match} />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FiAlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No matches found. Try uploading a different resume.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'feedback' && feedback && (
          <AIFeedback 
            feedback={feedback} 
            recommendations={recommendations}
          />
        )}

        {activeTab === 'roadmap' && roadmap && (
          <SkillRoadmap roadmap={roadmap} />
        )}
      </div>
    </div>
  );
};

export default EnhancedStudentDashboard;