import React, { useState } from 'react';
import rioLogo from '../images/rio-logo.png';
import AboutModal from './AboutModal';

interface HomePageProps {
  onStartLesson: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStartLesson }) => {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="home-page">
      <div className="home-content">
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