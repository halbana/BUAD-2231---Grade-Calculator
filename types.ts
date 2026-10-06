
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface GradeScenario {
  grade: 'A' | 'B' | 'C' | 'D';
  isPossible: boolean;
  pointsNeeded: number;
  threshold: number;
  pointsRemaining: number;
}

export interface CalculationResult {
  maxPossiblePoints: number;
  maxPossiblePercentage: number;
  maxPossibleGrade: Grade;
  scenarios: GradeScenario[];
  currentPercentage: number;
  pointsDistributed: number;
  pointsRemaining: number;
}
