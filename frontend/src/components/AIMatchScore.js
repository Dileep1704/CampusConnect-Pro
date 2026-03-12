import React, { useState } from 'react';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiTrendingUp, 
  FiAward, 
  FiStar,
  FiThumbsUp,
  FiThumbsDown,
  FiInfo,
  FiBriefcase,
  FiMapPin,
  FiClock,
  FiDollarSign
} from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AIMatchScore = ({ match, onApply }) => {
  const [expanded, setExpanded] = useState(false);
  const [applying, setApplying] = useState(false);
  
  const { total, semantic, skills, experience, matchedSkills, missingSkills } = match.matchScore;
  const internship = match.internship;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return '🏆';
    if (score >= 60) return '👍';
    if (score >= 40) return '🤔';
    return '👎';
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return 'Excellent Match!';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Average Match';
    return 'Low Match';
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      await api.post('/applications', { internshipId: internship._id });
      toast.success('Application submitted successfully!');
      if (onApply) onApply(internship._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border-2 hover:shadow-xl transition-all duration-300"
         style={{ borderColor: total >= 80 ? '#10B981' : total >= 60 ? '#F59E0B' : '#EF4444' }}>
      
      {/* Header with Match Badge */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-3xl">{getScoreIcon(total)}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{internship.title}</h3>
                <p className="text-gray-600">{internship.companyName}</p>
              </div>
            </div>
            
            {/* Quick Info Row */}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
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
          </div>
          
          {/* Match Percentage Circle */}
          <div className="text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${getScoreBg(total)}`}>
              <div>
                <div className={`text-3xl font-bold ${getScoreColor(total)}`}>
                  {total}%
                </div>
                <div className="text-xs text-gray-600 mt-1">Match</div>
              </div>
            </div>
            <div className="text-sm font-medium mt-2 text-gray-700">
              {getScoreMessage(total)}
            </div>
          </div>
        </div>

        {/* Score Breakdown Bars */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <ScoreBar 
            label="Semantic AI" 
            score={semantic} 
            color="blue"
            icon={<FiTrendingUp size={14} />}
            tooltip="AI understanding of your profile"
          />
          <ScoreBar 
            label="Skills Match" 
            score={skills} 
            color="green"
            icon={<FiStar size={14} />}
            tooltip="Technical skills match"
          />
          <ScoreBar 
            label="Experience" 
            score={experience} 
            color="purple"
            icon={<FiAward size={14} />}
            tooltip="Experience level match"
          />
        </div>
      </div>

      {/* Expandable Details Section */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-6 py-3 text-left text-sm font-medium text-gray-600 hover:bg-gray-50 focus:outline-none"
        >
          <div className="flex items-center justify-between">
            <span>{expanded ? 'Hide Details' : 'View Detailed Analysis'}</span>
            <svg
              className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {expanded && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            {/* Skills Analysis */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <FiCheckCircle className="mr-2 text-green-600" />
                Skills Analysis
              </h4>
              <div className="space-y-3">
                {matchedSkills.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">✅ Matched Skills ({matchedSkills.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {matchedSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center"
                        >
                          <FiCheckCircle className="mr-1" size={12} />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {missingSkills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">❌ Missing Skills ({missingSkills.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center"
                        >
                          <FiXCircle className="mr-1" size={12} />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Requirements */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Job Requirements</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {internship.requirements?.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            {/* Description Preview */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
              <p className="text-sm text-gray-600 line-clamp-3">{internship.description}</p>
            </div>

            {/* Deadline */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Application Deadline:</span>
              <span className="font-medium text-gray-700">
                {new Date(internship.applicationDeadline).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 bg-white border-t border-gray-100 flex space-x-3">
        <button
          onClick={() => window.open(`/internships/${internship._id}`, '_blank')}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          View Full Details
        </button>
        <button
          onClick={handleApply}
          disabled={applying}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {applying ? 'Applying...' : 'Quick Apply'}
        </button>
      </div>
    </div>
  );
};

const ScoreBar = ({ label, score, color, icon, tooltip }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const colors = {
    blue: {
      bg: 'bg-blue-600',
      text: 'text-blue-600',
      light: 'bg-blue-100'
    },
    green: {
      bg: 'bg-green-600',
      text: 'text-green-600',
      light: 'bg-green-100'
    },
    purple: {
      bg: 'bg-purple-600',
      text: 'text-purple-600',
      light: 'bg-purple-100'
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1">
          <span className={`text-xs font-medium ${colors[color].text}`}>
            {icon}
          </span>
          <span className="text-xs text-gray-500">{label}</span>
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiInfo size={12} />
          </button>
        </div>
        <span className={`text-sm font-semibold ${colors[color].text}`}>{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${colors[color].bg} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMatchScore;