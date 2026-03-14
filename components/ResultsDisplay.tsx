import React from 'react';
import type { CalculationResult } from '../types';
import { TOTAL_CLASS_POINTS } from '../constants';

interface ResultsDisplayProps {
  results: CalculationResult;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const { maxPossiblePoints, maxPossiblePercentage, maxPossibleGrade } = results;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-500';
      case 'B': return 'text-blue-500';
      case 'C': return 'text-yellow-500';
      case 'D': return 'text-orange-500';
      case 'F': return 'text-red-500';
      default: return 'text-slate-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">Your Maximum Potential</h3>
      <div className="text-center">
        <div className={`text-7xl font-bold ${getGradeColor(maxPossibleGrade)}`}>
          {maxPossibleGrade}
        </div>
        <p className="text-slate-600 mt-2">Highest Possible Grade</p>
      </div>
      <div className="mt-6 space-y-3 text-center">
        <p className="text-slate-700">
          You can finish the class with a maximum of <strong className="font-semibold text-indigo-600">{(Math.floor(maxPossiblePoints * 10) / 10).toFixed(1)}</strong> points out of {TOTAL_CLASS_POINTS}.
        </p>
        <p className="text-slate-700">
          This corresponds to a final score of <strong className="font-semibold text-indigo-600">{(Math.floor(maxPossiblePercentage * 10) / 10).toFixed(1)}%</strong>.
        </p>
      </div>
    </div>
  );
};

export default ResultsDisplay;
