import React from 'react';
import { FiClock, FiBook, FiAward, FiTrendingUp } from 'react-icons/fi';

const SkillRoadmap = ({ roadmap }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Skill Development Roadmap</h3>
        <p className="text-gray-600">
          Target Role: <span className="font-semibold text-blue-600">{roadmap.targetRole}</span>
        </p>
      </div>

      {/* Current Level */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Skill Level</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">{roadmap.currentLevel}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Estimated Time</p>
            <p className="text-2xl font-bold text-gray-900">{roadmap.estimatedTime}</p>
          </div>
        </div>
      </div>

      {/* Learning Path */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700 flex items-center">
          <FiTrendingUp className="mr-2 text-green-600" />
          Your Learning Path
        </h4>
        
        {roadmap.learningPath.map((item, index) => (
          <div key={index} className="relative pl-8 pb-4">
            {/* Timeline line */}
            {index < roadmap.learningPath.length - 1 && (
              <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-200"></div>
            )}
            
            {/* Timeline dot */}
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">{index + 1}</span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-gray-900">{item.skill}</h5>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Priority {item.priority}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <FiClock className="mr-1" size={14} />
                <span>{item.estimatedHours} hours estimated</span>
              </div>
              
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">Recommended Resources:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {item.resources.map((resource, idx) => (
                    <li key={idx} className="flex items-center">
                      <FiBook className="mr-2 text-blue-500" size={12} />
                      {resource}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Skills */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-3">Skills to Learn</h4>
        <div className="flex flex-wrap gap-2">
          {roadmap.recommendedSkills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillRoadmap;