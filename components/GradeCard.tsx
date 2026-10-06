
import React from 'react';
import type { GradeScenario } from '../types';
import { CheckCircleIcon, XCircleIcon } from './Icons';

interface GradeCardProps {
  scenario: GradeScenario;
}

const GradeCard: React.FC<GradeCardProps> = ({ scenario }) => {
  const { grade, isPossible, pointsNeeded, pointsRemaining } = scenario;

  const cardClasses = isPossible
    ? 'bg-green-50 border-green-200'
    : 'bg-red-50 border-red-200';
  
  const iconClasses = isPossible ? 'text-green-500' : 'text-red-500';

  const renderContent = () => {
    if (pointsNeeded <= 0) {
      return (
        <p className="text-sm text-slate-600">
          You've already surpassed the points needed for this grade. Great job!
        </p>
      );
    }
    if (isPossible) {
      return (
        <p className="text-sm text-slate-600">
          You need to earn at least <strong className="font-bold text-slate-800">{pointsNeeded}</strong> out of the remaining {pointsRemaining} points.
        </p>
      );
    }
    return (
      <p className="text-sm text-slate-600">
        It's no longer possible to achieve this grade. You would have needed <strong className="font-bold text-slate-800">{pointsNeeded}</strong> points, but only {pointsRemaining} are left.
      </p>
    );
  };

  return (
    <div className={`p-4 rounded-lg border ${cardClasses} flex flex-col`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-slate-800">Path to a Grade {grade}</h3>
        {isPossible ? (
          <CheckCircleIcon className={`w-6 h-6 ${iconClasses}`} />
        ) : (
          <XCircleIcon className={`w-6 h-6 ${iconClasses}`} />
        )}
      </div>
      {renderContent()}
    </div>
  );
};

export default GradeCard;
