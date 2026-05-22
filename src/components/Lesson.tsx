import React, { useState, useEffect } from 'react';
import { DifficultyLevel, Question, LessonResult } from '../types';
import QuestionCard from './QuestionCard';
import questionsData from '../data/questions.json';

interface LessonProps {
  onLessonComplete: (result: LessonResult) => void;
  level: DifficultyLevel | null;
}

const Lesson: React.FC<LessonProps> = ({ onLessonComplete, level }) => {
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
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, Math.min(10, shuffled.length)));
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
        completedAt: new Date()
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
      currentQuestion={currentQuestionIndex + 1}
      totalQuestions={questions.length}
      showFeedback={showFeedback}
      isCorrect={lastAnswerCorrect}
      selectedAnswer={selectedAnswer}
    />
  );
};

export default Lesson;