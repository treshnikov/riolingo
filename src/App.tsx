import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { DifficultyLevel, GameState, LessonResult } from './types';
import { StreakData, recalculateStreak, updateStreakOnLessonComplete } from './utils/streak';
import { loadPoints, addPoints } from './utils/points';
import HomePage from './components/HomePage';
import Lesson from './components/Lesson';
import ResultPage from './components/ResultPage';

function App() {
  const [gameState, setGameState] = useState<GameState>('home');
  const [lessonResult, setLessonResult] = useState<LessonResult | null>(null);
  const [streakData, setStreakData] = useState<StreakData>(() => recalculateStreak());
  const [totalPoints, setTotalPoints] = useState<number>(() => loadPoints());
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | null>(() => {
    const saved = localStorage.getItem('selectedLevel');
    return (saved as DifficultyLevel) ?? 'A1';
  });

  const refreshStreak = useCallback(() => {
    setStreakData(recalculateStreak());
  }, []);

  useEffect(() => {
    refreshStreak();
  }, [gameState, refreshStreak]);

  const handleSelectLevel = (level: DifficultyLevel | null) => {
    setSelectedLevel(level);
    if (level) {
      localStorage.setItem('selectedLevel', level);
    } else {
      localStorage.removeItem('selectedLevel');
    }
  };

  const handleStartLesson = () => {
    setGameState('lesson');
  };

  const handleLessonComplete = (result: LessonResult) => {
    setStreakData(updateStreakOnLessonComplete());
    setTotalPoints(addPoints(result.earnedPoints));
    setLessonResult(result);
    setGameState('result');
  };

  const handleGoHome = () => {
    setGameState('home');
    setLessonResult(null);
  };

  return (
    <div className="App">
      {gameState === 'home' && (
        <HomePage
          onStartLesson={handleStartLesson}
          selectedLevel={selectedLevel}
          onSelectLevel={handleSelectLevel}
          streakData={streakData}
          totalPoints={totalPoints}
          onRefreshStreak={refreshStreak}
        />
      )}

      {gameState === 'lesson' && (
        <Lesson onLessonComplete={handleLessonComplete} onQuit={handleGoHome} level={selectedLevel} />
      )}

      {gameState === 'result' && lessonResult && (
        <ResultPage result={lessonResult} onGoHome={handleGoHome} />
      )}
    </div>
  );
}

export default App;
