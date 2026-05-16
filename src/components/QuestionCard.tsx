import React, { useState, useRef, useEffect } from 'react';
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
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const translationCache = useRef<Map<string, string>>(new Map());
  const currentWordRef = useRef<string | null>(null);

  useEffect(() => {
    setActiveWordIndex(null);
    setTranslation(null);
  }, [question.id]);

  useEffect(() => {
    const handleClickOutside = () => setActiveWordIndex(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleWordClick = async (word: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanWord = word.toLowerCase();

    if (activeWordIndex === index) {
      setActiveWordIndex(null);
      return;
    }

    setActiveWordIndex(index);
    currentWordRef.current = cleanWord;

    if (translationCache.current.has(cleanWord)) {
      setTranslation(translationCache.current.get(cleanWord)!);
      return;
    }

    setIsTranslating(true);
    setTranslation(null);

    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=en|ru`
      );
      const data = await response.json();
      if (currentWordRef.current !== cleanWord) return;
      const translated = data.responseData?.translatedText || word;
      translationCache.current.set(cleanWord, translated);
      setTranslation(translated);
    } catch {
      if (currentWordRef.current === cleanWord) setTranslation('—');
    } finally {
      if (currentWordRef.current === cleanWord) setIsTranslating(false);
    }
  };

  const renderClickableWords = (text: string, baseIndex: number = 0) => {
    const tokens = text.match(/[a-zA-Z']+|____|\s+|[^a-zA-Z'\s]/g) || [];
    return tokens.map((token, i) => {
      const globalIndex = baseIndex + i;
      if (/^[a-zA-Z']+$/.test(token)) {
        const isActive = activeWordIndex === globalIndex;
        return (
          <span
            key={globalIndex}
            className={`clickable-word${isActive ? ' active' : ''}`}
            onClick={(e) => handleWordClick(token, globalIndex, e)}
          >
            {token}
            {isActive && (
              <span className="word-tooltip">
                {isTranslating ? '...' : (translation || '')}
              </span>
            )}
          </span>
        );
      }
      return <span key={globalIndex}>{token}</span>;
    });
  };

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
          {parts.map((part, partIndex) => {
            if (partIndex % 2 === 1) {
              return (
                <span
                  key={partIndex}
                  className={`answer-highlight ${isCorrect ? 'correct' : 'incorrect'}`}
                >
                  {renderClickableWords(part, partIndex * 1000)}
                </span>
              );
            }
            return (
              <React.Fragment key={partIndex}>
                {renderClickableWords(part, partIndex * 1000)}
              </React.Fragment>
            );
          })}
        </>
      );
    }

    return <>{renderClickableWords(text)}</>;
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