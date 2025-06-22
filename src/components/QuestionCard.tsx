import React from 'react';
import { Question } from '../types';
import rioTeacher from '../images/rio-teacher.png';
import rioHappy from '../images/rio-happy.png';
import rioSad from '../images/rio-sad.png';

interface QuestionCardProps {
  question: Question;
  onAnswer: (selectedIndex: number) => void;
  onContinue: () => void;
  currentQuestion: number;
  totalQuestions: number;
  showFeedback: boolean;
  isCorrect?: boolean;
  selectedAnswer?: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  onAnswer, 
  onContinue,
  currentQuestion, 
  totalQuestions,
  showFeedback,
  isCorrect,
  selectedAnswer
}) => {
  const getRioImage = () => {
    if (!showFeedback) return rioTeacher;
    return isCorrect ? rioHappy : rioSad;
  };

  const getRioAlt = () => {
    if (!showFeedback) return "Rio Teacher";
    return isCorrect ? "Rio Happy" : "Rio Sad";
  };

  const getQuestionText = () => {
    if (!showFeedback || selectedAnswer === undefined) {
      return question.sentence;
    }
    
    const selectedOption = question.options[selectedAnswer];
    return question.sentence.replace('____', `**${selectedOption}**`);
  };

  const renderQuestionText = () => {
    const text = getQuestionText();
    
    if (showFeedback && selectedAnswer !== undefined) {
      const parts = text.split('**');
      return (
        <>
          {parts.map((part, index) => {
            if (index % 2 === 1) {
              return (
                <span 
                  key={index} 
                  className={`answer-highlight ${isCorrect ? 'correct' : 'incorrect'}`}
                >
                  {part}
                </span>
              );
            }
            return part;
          })}
        </>
      );
    }
    
    return text;
  };

  return (
    <div className="question-card">
      <div className="question-header">
        <div className="progress">
          Вопрос {currentQuestion} из {totalQuestions}
        </div>
      </div>
      
      <div className="question-content">
        <img src={getRioImage()} alt={getRioAlt()} className="rio-character" />
        
        <div className="question-text">
          {renderQuestionText()}
        </div>
        
        {showFeedback ? (
          <div className="feedback-message">
            {isCorrect ? (
              <h2 className="feedback-title correct">Правильно!</h2>
            ) : (
              <div>
                <h2 className="feedback-title incorrect">Неправильно</h2>
                <p className="correct-answer">
                  Правильный ответ: <strong>{question.options[question.correct]}</strong>
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="feedback-placeholder"></div>
        )}
        
        <div className="options">
          {question.options.map((option, index) => {
            let buttonClass = "option-button";
            
            if (showFeedback) {
              buttonClass += " disabled";
              // Подсвечиваем только правильный ответ, если пользователь ответил правильно
              if (isCorrect && index === question.correct) {
                buttonClass += " correct-option";
              }
              // При неправильном ответе кнопки остаются белыми
            }
            
            return (
              <button
                key={index}
                className={buttonClass}
                onClick={() => !showFeedback && onAnswer(index)}
                disabled={showFeedback}
              >
                {option}
              </button>
            );
          })}
          
          <button 
            className={`continue-button ${showFeedback ? (isCorrect ? 'correct' : 'incorrect') : 'hidden'}`}
            onClick={onContinue}
            style={{ visibility: showFeedback ? 'visible' : 'hidden' }}
          >
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;