import React from 'react';

const Progress = ({ value, className = '' }) => {
  const isIndeterminate = value === -1;
  
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <div 
        className={`bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out ${isIndeterminate ? 'animate-pulse' : ''}`}
        style={{ width: isIndeterminate ? '100%' : `${value}%` }}
      ></div>
    </div>
  );
};

export default Progress;