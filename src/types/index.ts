export interface Question {
  id: number;
  sentence: string;
  options: string[];
  correct: number;
}

export interface LessonResult {
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

export type GameState = 'home' | 'lesson' | 'result';