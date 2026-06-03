import { useState } from 'react';
import './App.css';
import { DifficultyLevel, GameState, LessonResult } from './types';
import { StreakData, loadStreakData, updateStreakOnLessonComplete } from './utils/streak';
import HomePage from './components/HomePage';
import Lesson from './components/Lesson';
import ResultPage from './components/ResultPage';

function App() {
  const [gameState, setGameState] = useState<GameState>('home');
  const [lessonResult, setLessonResult] = useState<LessonResult | null>(null);
  const [streakData, setStreakData] = useState<StreakData>(() => loadStreakData());
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | null>(() => {
    const saved = localStorage.getItem('selectedLevel');
    return (saved as DifficultyLevel) ?? 'A1';
  });

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
