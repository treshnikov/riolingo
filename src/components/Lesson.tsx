import React, { useState, useEffect } from 'react';
import { DifficultyLevel, Question, LessonResult } from '../types';
import QuestionCard from './QuestionCard';
import questionsData from '../data/questions.json';
import { selectLessonQuestions } from '../utils/questionSelection';

interface LessonProps {
  onLessonComplete: (result: LessonResult) => void;
  onQuit: () => void;
  level: DifficultyLevel | null;
}

const Lesson: React.FC<LessonProps> = ({ onLessonComplete, onQuit, level }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>(undefined);

  useEffect(() => {
    const pool = level
      ? (questionsData as Question[]).filter(q => q.level === level)
      : (questionsData as Question[]);
    setQuestions(selectLessonQuestions(pool, level ?? 'ALL', 10));
  }, [level]);

  const handleAnswer = (selectedIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedIndex === currentQuestion.correct;
    
    setLastAnswerCorrect(isCorrect);
    setSelectedAnswer(selectedIndex);
    
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }
    
    setShowFeedback(true);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setSelectedAnswer(undefined);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const result: LessonResult = {
        score,
        totalQuestions: questions.length,
        completedAt: new Date(),
        earnedPoints: score * 10,
      };
      onLessonComplete(result);
    }
  };

  if (questions.length === 0) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <QuestionCard
      question={questions[currentQuestionIndex]}
      onAnswer={handleAnswer}
      onContinue={handleContinue}
      onQuit={onQuit}
      currentQuestion={currentQuestionIndex + 1}
      totalQuestions={questions.length}
      showFeedback={showFeedback}
      isCorrect={lastAnswerCorrect}
      selectedAnswer={selectedAnswer}
    />
  );
};

export default Lesson;