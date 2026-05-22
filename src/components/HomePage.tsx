import React, { useState } from 'react';
import rioLogo from '../images/rio-logo.png';
import AboutModal from './AboutModal';
import { DifficultyLevel } from '../types';

interface HomePageProps {
  onStartLesson: () => void;
  selectedLevel: DifficultyLevel | null;
  onSelectLevel: (level: DifficultyLevel | null) => void;
}

const LEVELS: DifficultyLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const HomePage: React.FC<HomePageProps> = ({ onStartLesson, selectedLevel, onSelectLevel }) => {
  const [showAbout, setShowAbout] = useState(false);

  const handleLevelClick = (level: DifficultyLevel) => {
    onSelectLevel(selectedLevel === level ? null : level);
  };

  return (
    <div className="home-page">
      <div className="home-content">
        <div className="level-selector">
          {LEVELS.map(level => (
            <button
              key={level}
              className={`level-btn${selectedLevel === level ? ' active' : ''}`}
              onClick={() => handleLevelClick(level)}
            >
              {level}
            </button>
          ))}
        </div>

        <img src={rioLogo} alt="RioLingo" className="logo" />
        <h1>RioLingo</h1>
        <p>Изучайте английский с удовольствием!</p>

        <div className="home-buttons">
          <button className="start-button" onClick={onStartLesson}>
            Старт
          </button>
          <button className="about-button" onClick={() => setShowAbout(true)}>
            О программе
          </button>
        </div>
      </div>

      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />
    </div>
  );
};

export default HomePage;