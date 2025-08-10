import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const ActivityChart = ({ data = [], isDarkMode = true }) => {
  // Generate sample data if none provided
  const chartData = data.length > 0 ? data : [
    { date: 'Mon', tasks: 12, bugs: 3, projects: 2 },
    { date: 'Tue', tasks: 15, bugs: 5, projects: 3 },
    { date: 'Wed', tasks: 18, bugs: 4, projects: 2 },
    { date: 'Thu', tasks: 14, bugs: 6, projects: 4 },
    { date: 'Fri', tasks: 20, bugs: 2, projects: 3 },
    { date: 'Sat', tasks: 8, bugs: 1, projects: 1 },
    { date: 'Sun', tasks: 6, bugs: 0, projects: 1 },
  ];

  const maxValue = Math.max(...chartData.map(d => Math.max(d.tasks, d.bugs, d.projects)));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>Tasks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>Bugs</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>Projects</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <FiTrendingUp className={`h-4 w-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          <span className={`text-xs font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
            +12% from last week
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between h-48 space-x-1">
        {chartData.map((day, index) => (
          <div key={index} className="flex flex-col items-center space-y-2 flex-1">
            {/* Tasks Bar */}
            <div className="relative w-full">
              <div 
                className="bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-400"
                style={{ 
                  height: `${(day.tasks / maxValue) * 100}%`,
                  minHeight: '4px'
                }}
              ></div>
            </div>
            
            {/* Bugs Bar */}
            <div className="relative w-full">
              <div 
                className="bg-red-500 rounded-t-sm transition-all duration-300 hover:bg-red-400"
                style={{ 
                  height: `${(day.bugs / maxValue) * 100}%`,
                  minHeight: '4px'
                }}
              ></div>
            </div>
            
            {/* Projects Bar */}
            <div className="relative w-full">
              <div 
                className="bg-purple-500 rounded-t-sm transition-all duration-300 hover:bg-purple-400"
                style={{ 
                  height: `${(day.projects / maxValue) * 100}%`,
                  minHeight: '4px'
                }}
              ></div>
            </div>
            
            {/* Date Label */}
            <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              {day.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityChart; 