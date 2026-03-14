
import React from 'react';
import { SparklesIcon } from './Icons';

interface MotivationalMessageProps {
  message: string;
  isLoading: boolean;
}

const MotivationalMessage: React.FC<MotivationalMessageProps> = ({ message, isLoading }) => {
  return (
    <div className="bg-indigo-50 border-l-4 border-indigo-400 p-6 rounded-r-lg h-full flex flex-col">
      <h3 className="flex items-center text-lg font-semibold text-indigo-800 mb-4">
        <SparklesIcon className="w-5 h-5 mr-2" />
        Professor's Feedback
      </h3>
      <div className="flex-grow">
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-indigo-200 rounded w-full"></div>
          <div className="h-4 bg-indigo-200 rounded w-5/6"></div>
          <div className="h-4 bg-indigo-200 rounded w-3/4"></div>
        </div>
      ) : (
        <p className="text-indigo-700 italic">"{message}"</p>
      )}
      </div>
    </div>
  );
};

export default MotivationalMessage;
