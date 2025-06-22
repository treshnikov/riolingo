import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>О программе</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <h3>RioLingo</h3>
          <p>
            Это приложение было создано как учебный проект Андреем Трёшниковым совместно с{' '}
            <a href="https://claude.ai/" target="_blank" rel="noopener noreferrer">
              Claude
            </a>.
          </p>
          <p>
            Это простое приложение для изучения языков, которое помогает изучать словарный запас 
            на новом языке. Оно использует интервальное повторение, чтобы помочь вам запомнить 
            слова и фразы.
          </p>
        </div>
        
        <div className="modal-footer">
          <button className="modal-ok-button" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;