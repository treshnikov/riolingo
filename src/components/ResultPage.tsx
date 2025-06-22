import React from 'react';
import { LessonResult } from '../types';
import rioNormal from '../images/rio-normal.png';

interface ResultPageProps {
  result: LessonResult;
  onGoHome: () => void;
}

const ResultPage: React.FC<ResultPageProps> = ({ result, onGoHome }) => {
  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  
  return (
    <div className="result-page">
      <div className="result-content">
        <img src={rioNormal} alt="Rio Normal" className="rio-character" />
        
        <div className="result-info">
          <h1>Урок завершен!</h1>
          <div className="score">
            <div className="score-number">{result.score}/{result.totalQuestions}</div>
            <div className="score-percentage">{percentage}%</div>
          </div>
          
          <p>
            {percentage >= 80 
              ? "Отличная работа!" 
              : percentage >= 60 
              ? "Хорошо! Продолжайте заниматься!" 
              : "Не расстраивайтесь! Попробуйте еще раз!"}
          </p>
        </div>
        
        <button className="ok-button" onClick={onGoHome}>
          ОК
        </button>
      </div>
    </div>
  );
};

export default ResultPage;