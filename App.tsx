
import React, { useState, useCallback } from 'react';
import { GRADE_THRESHOLDS, TOTAL_CLASS_POINTS } from './constants';
import type { Grade, CalculationResult, GradeScenario } from './types';
import { generateMessage } from './services/geminiService';
import GradeCard from './components/GradeCard';
import ResultsDisplay from './components/ResultsDisplay';
import MotivationalMessage from './components/MotivationalMessage';

const App: React.FC = () => {
  const [currentPointsInput, setCurrentPointsInput] = useState<string>('');
  const [distributedPointsInput, setDistributedPointsInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const getGradeFromPercentage = (percentage: number): Grade => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const handleCalculate = useCallback(async () => {
    setError('');
    setResults(null);
    setMessage('');

    const distPoints = parseFloat(distributedPointsInput);
    if (isNaN(distPoints) || distPoints <= 0 || distPoints > TOTAL_CLASS_POINTS) {
      setError(`Please enter a valid number for current total distributed points between 1 and ${TOTAL_CLASS_POINTS}.`);
      return;
    }

    const currentPoints = parseFloat(currentPointsInput);
    if (isNaN(currentPoints) || currentPoints < 0) {
      setError('Please enter a valid number for your current total points.');
      return;
    }

    if (currentPoints > distPoints) {
      setError(`Your current earned points (${currentPoints}) cannot exceed the total distributed points (${distPoints}).`);
      return;
    }

    setIsLoading(true);

    const pointsRemaining = TOTAL_CLASS_POINTS - distPoints;
    const maxPossiblePoints = currentPoints + pointsRemaining;
    const maxPossiblePercentage = (maxPossiblePoints / TOTAL_CLASS_POINTS) * 100;
    const maxPossibleGrade = getGradeFromPercentage(maxPossiblePercentage);
    const currentPercentage = (currentPoints / distPoints) * 100;

    const scenarios: GradeScenario[] = (Object.keys(GRADE_THRESHOLDS) as Array<keyof typeof GRADE_THRESHOLDS>).map(key => {
        const gradeInfo = GRADE_THRESHOLDS[key];
        const pointsNeeded = gradeInfo.points - currentPoints;
        return {
            grade: key,
            isPossible: pointsNeeded <= pointsRemaining,
            pointsNeeded: Math.max(0, Math.ceil(pointsNeeded)),
            threshold: gradeInfo.points,
            pointsRemaining,
        };
    });

    const newResults: CalculationResult = {
      maxPossiblePoints,
      maxPossiblePercentage,
      maxPossibleGrade,
      scenarios,
      currentPercentage,
      pointsDistributed: distPoints,
      pointsRemaining,
    };
    
    setResults(newResults);

    try {
        const aiMessage = await generateMessage(currentPoints, maxPossibleGrade, currentPercentage, distPoints, pointsRemaining);
        setMessage(aiMessage);
    } catch(err) {
        setMessage("Could not generate feedback at this time.");
    } finally {
        setIsLoading(false);
    }
  }, [currentPointsInput, distributedPointsInput]);

  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-indigo-600">
          BUAD 2231<br />
          Business Statistics I
        </h1>
        <p className="text-xl text-slate-600 mt-2">Final Grade Potential Calculator</p>
        <a
          href="mailto:halbana.tarmizi@bemidjistate.edu?subject=BUAD%202231%20-%20Question"
          className="text-md text-slate-500 mt-1 inline-block hover:text-indigo-600 hover:underline"
        >
          Created by Dr.Tarmizi @BSU
        </a>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-slate-100 border border-slate-200 p-4 rounded-lg text-center mb-8">
          <p className="text-slate-700 italic">
            This grade calculator is a tool to help you see the possibilities for your final grade. Hopefully, knowing where you stand will motivate you to finish the semester even stronger!
          </p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="current-points" className="block text-sm font-medium text-slate-700 mb-1">
                Enter Your Current Total Points
              </label>
              <input
                type="number"
                id="current-points"
                min="0"
                step="any"
                value={currentPointsInput}
                onChange={(e) => setCurrentPointsInput(e.target.value)}
                placeholder="e.g., 650"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              />
              <p className="text-xs text-slate-500 mt-1">Total points you have earned so far</p>
            </div>

            <div>
              <label htmlFor="distributed-points" className="block text-sm font-medium text-slate-700 mb-1">
                Current Total Distributed Points
              </label>
              <input
                type="number"
                id="distributed-points"
                min="0"
                max={TOTAL_CLASS_POINTS}
                step="any"
                value={distributedPointsInput}
                onChange={(e) => setDistributedPointsInput(e.target.value)}
                placeholder={`e.g., 780 (max ${TOTAL_CLASS_POINTS})`}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              />
              <p className="text-xs text-slate-500 mt-1">Maximum {TOTAL_CLASS_POINTS} points for the course</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Total course points: {TOTAL_CLASS_POINTS}
            </span>
            <button
              onClick={handleCalculate}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-2.5 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Calculating...' : 'Calculate Potential'}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>

        {results && (
          <div className="mt-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <ResultsDisplay results={results} />
              <MotivationalMessage message={message} isLoading={isLoading} />
            </div>

            <h2 className="text-2xl font-bold text-center mb-6 text-slate-700">Grade Scenarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.scenarios.map(scenario => (
                <GradeCard key={scenario.grade} scenario={scenario} />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="text-center mt-12 text-sm text-slate-500">
        <p>
          Total class points: {TOTAL_CLASS_POINTS}
          {results ? ` | Points remaining: ${results.pointsRemaining}` : ''}
        </p>
        <p className="mt-1">&copy; {new Date().getFullYear()} BUAD 2231 Course Support. For educational purposes only.</p>
      </footer>
    </div>
  );
};

export default App;