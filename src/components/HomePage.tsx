import React, { useState } from 'react';
import rioLogo from '../images/rio-logo.png';
import AboutModal from './AboutModal';
import { DifficultyLevel } from '../types';
import { StreakData } from '../utils/streak';

interface HomePageProps {
  onStartLesson: () => void;
  selectedLevel: DifficultyLevel | null;
  onSelectLevel: (level: DifficultyLevel | null) => void;
  streakData: StreakData;
  onRefreshStreak?: () => void;
}

const LEVELS: DifficultyLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

type InfoType = 'streak' | 'freeze';

const HomePage: React.FC<HomePageProps> = ({ onStartLesson, selectedLevel, onSelectLevel, streakData, onRefreshStreak }) => {
  const [showAbout, setShowAbout] = useState(false);
  const [infoModal, setInfoModal] = useState<InfoType | null>(null);

  const handleLevelClick = (level: DifficultyLevel) => {
    onSelectLevel(selectedLevel === level ? null : level);
  };

  return (
    <div className="home-page">
      <div className="home-content">

        <div className="controls-grid">
          {/* row 1: streak badges */}
          <button
            className="streak-badge fire-badge"
            style={{ gridColumn: 1, gridRow: 1 }}
            onClick={() => { onRefreshStreak?.(); setInfoModal('streak'); }}
          >
            <span className="badge-icon">🔥</span>
            <span className="badge-count">{streakData.streak}</span>
          </button>
          <button
            className="streak-badge freeze-badge"
            style={{ gridColumn: 6, gridRow: 1 }}
            onClick={() => { onRefreshStreak?.(); setInfoModal('freeze'); }}
          >
            <span className="badge-icon">❄️</span>
            <span className="badge-count">{streakData.freezes}</span>
          </button>

 
          {/* row 3: level buttons */}
          {LEVELS.map((level, i) => (
            <button
              key={level}
              style={{ gridColumn: i + 1, gridRow: 3 }}
              className={`level-btn${selectedLevel === level ? ' active' : ''}`}
              onClick={() => handleLevelClick(level)}
            >
              {level}
            </button>
          ))}
          
        </div>
         {/* row 2: logo */}
          <img
            src={rioLogo}
            alt="RioLingo"
            className="logo"
            style={{ gridColumn: '1 / span 6', gridRow: 2, justifySelf: 'center' }}
          />
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

      {infoModal && (
        <div className="modal-overlay" onClick={() => setInfoModal(null)}>
          <div className="info-modal" onClick={e => e.stopPropagation()}>
            {infoModal === 'streak' ? (
              <>
                <div className="info-modal-icon">🔥</div>
                <h3>Ударный режим</h3>
                <p>
                  Вы занимаетесь <strong>{streakData.streak} {dayLabel(streakData.streak)}</strong> подряд!
                </p>
                <p>
                  Занимайтесь каждый день, чтобы не потерять серию.
                  Если пропустите день и у вас нет заморозок — счётчик сбросится до нуля.
                </p>
              </>
            ) : (
              <>
                <div className="info-modal-icon">❄️</div>
                <h3>Заморозка</h3>
                <p>
                  У вас <strong>{streakData.freezes} {freezeLabel(streakData.freezes)}</strong>.
                </p>
                <p>
                  Каждую неделю вы получаете 3 заморозки (максимум 3).
                  Если пропустите день занятий, заморозка защитит ваш ударный режим —
                  пропущенный день не засчитается, но одна заморозка потратится.
                </p>
              </>
            )}
            <button className="info-modal-close" onClick={() => setInfoModal(null)}>Понятно</button>
          </div>
        </div>
      )}
    </div>
  );
};

const dayLabel = (n: number): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'дней';
  if (mod10 === 1) return 'день';
  if (mod10 >= 2 && mod10 <= 4) return 'дня';
  return 'дней';
};

const freezeLabel = (n: number): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'заморозок';
  if (mod10 === 1) return 'заморозка';
  if (mod10 >= 2 && mod10 <= 4) return 'заморозки';
  return 'заморозок';
};

export default HomePage;
