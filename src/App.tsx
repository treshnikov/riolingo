import { useState } from 'react';
import './App.css';
import { GameState, LessonResult } from './types';
import HomePage from './components/HomePage';
import Lesson from './components/Lesson';
import ResultPage from './components/ResultPage';

function App() {
  const [gameState, setGameState] = useState<GameState>('home');
  const [lessonResult, setLessonResult] = useState<LessonResult | null>(null);

  const handleStartLesson = () => {
    setGameState('lesson');
  };

  const handleLessonComplete = (result: LessonResult) => {
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
        <HomePage onStartLesson={handleStartLesson} />
      )}
      
      {gameState === 'lesson' && (
        <Lesson onLessonComplete={handleLessonComplete} />
      )}
      
      {gameState === 'result' && lessonResult && (
        <ResultPage result={lessonResult} onGoHome={handleGoHome} />
      )}
    </div>
  );
}

export default App;
