export type DifficultyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Question {
  id: number;
  sentence: string;
  options: string[];
  correct: number;
  level: DifficultyLevel;
}

export interface LessonResult {
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

export type GameState = 'home' | 'lesson' | 'result';