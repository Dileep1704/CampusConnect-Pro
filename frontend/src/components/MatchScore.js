import React from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const MatchScore = ({ match }) => {
  // Safety check
  if (!match || !match.matchScore) {
    return null;
  }

  const { total = 0, breakdown = {}, matchedSkills = [], missingSkills = [] } = match.matchScore;
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border-2 border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {match.internship?.title || 'Internship'}
        </h3>
        <div className={`px-4 py-2 rounded-full ${getScoreBg(total)}`}>
          <span className={`text-xl font-bold ${getScoreColor(total)}`}>
            {total}% Match
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{match.internship?.companyName || 'Company'}</p>

      {/* Score Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-sm text-gray-500">Skills</div>
          <div className={`text-lg font-semibold ${getScoreColor(breakdown.skills || 0)}`}>
            {breakdown.skills || 0}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Experience</div>
          <div className={`text-lg font-semibold ${getScoreColor(breakdown.experience || 0)}`}>
            {breakdown.experience || 0}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Education</div>
          <div className={`text-lg font-semibold ${getScoreColor(breakdown.education || 0)}`}>
            {breakdown.education || 0}%
          </div>
        </div>
      </div>

      {/* Skills Match */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Match:</h4>
        <div className="flex flex-wrap gap-2">
          {matchedSkills.length > 0 ? (
            matchedSkills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center"
              >
                <FiCheckCircle className="mr-1" size={12} />
                {skill}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">No matching skills</span>
          )}
          
          {missingSkills.length > 0 && (
            missingSkills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center"
              >
                <FiXCircle className="mr-1" size={12} />
                {skill}
              </span>
            ))
          )}
        </div>
      </div>

      <button
        onClick={() => window.location.href = `/internships/${match.internship?._id || '#'}`}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        disabled={!match.internship?._id}
      >
        View Details & Apply
      </button>
    </div>
  );
};

export default MatchScore;