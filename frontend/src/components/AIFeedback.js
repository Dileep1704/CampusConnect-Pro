import React from 'react';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle,
  FiThumbsUp,
  FiThumbsDown,
  FiTrendingUp,
  FiBookOpen
} from 'react-icons/fi';

const AIFeedback = ({ feedback, recommendations }) => {
  return (
    <div className="space-y-6">
      {/* Resume Score Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Resume Health Score</h3>
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={feedback.score >= 70 ? '#10B981' : feedback.score >= 50 ? '#F59E0B' : '#EF4444'}
                strokeWidth="3"
                strokeDasharray={`${feedback.score}, 100`}
              />
              <text x="18" y="20.5" textAnchor="middle" fontSize="8" fill="#374151" fontWeight="bold">
                {feedback.score}%
              </text>
            </svg>
          </div>
        </div>

        {/* Strengths */}
        {feedback.strengths.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FiThumbsUp className="mr-2 text-green-600" />
              Strengths
            </h4>
            <div className="space-y-2">
              {feedback.strengths.map((strength, index) => (
                <div key={index} className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" size={16} />
                  <span className="text-sm text-gray-600">{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {feedback.weaknesses.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FiThumbsDown className="mr-2 text-red-600" />
              Areas to Improve
            </h4>
            <div className="space-y-2">
              {feedback.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-start">
                  <FiXCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" size={16} />
                  <span className="text-sm text-gray-600">{weakness}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {feedback.suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FiAlertCircle className="mr-2 text-blue-600" />
              Suggestions
            </h4>
            <div className="space-y-2">
              {feedback.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start">
                  <FiTrendingUp className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" size={16} />
                  <span className="text-sm text-gray-600">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Missing Skills */}
      {feedback.missingSkills?.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <FiBookOpen className="mr-2 text-purple-600" />
            Skills to Consider Adding
          </h4>
          <div className="flex flex-wrap gap-2">
            {feedback.missingSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {recommendations?.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">AI Recommended Internships</h4>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-900">{rec.internship.title}</h5>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {rec.overallFit}% Match
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rec.internship.company}</p>
                <p className="text-sm text-gray-500 mb-3">{rec.reason}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{rec.internship.location}</span>
                  <span className="text-gray-500">{rec.internship.stipend}</span>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIFeedback;