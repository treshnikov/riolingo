import React, { useState, useRef, useEffect } from 'react';
import { Question } from '../types';
import rioTeacher from '../images/rio-teacher.png';
import rioHappy from '../images/rio-happy.png';
import rioSad from '../images/rio-sad.png';

const PREFERRED_VOICE: string | null = 'Карен';

const makeAudioContext = (): AudioContext | null => {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  return Ctx ? new Ctx() : null;
};

const playNote = (ctx: AudioContext, freq: number, start: number, dur: number, volume = 0.35) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.start(start);
  osc.stop(start + dur);
};

const playCorrectSound = () => {
  const ctx = makeAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  playNote(ctx, 784, t, 0.18);        // G5
  playNote(ctx, 988, t + 0.13, 0.25); // B5
};

const playWrongSound = () => {
  const ctx = makeAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  playNote(ctx, 311, t, 0.22);        // Eb4 — низкий грустный тон
  playNote(ctx, 261, t + 0.18, 0.3);  // C4  — ещё ниже
};

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const translationCache = useRef<Map<string, string>>(new Map());
  const currentWordRef = useRef<string | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const speakIdRef = useRef(0);

  useEffect(() => {
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      if (PREFERRED_VOICE) {
        const match = voices.find(v => v.name.includes(PREFERRED_VOICE!));
        if (match) { voiceRef.current = match; return; }
      }
      const priorities = [
        (v: SpeechSynthesisVoice) => v.name === 'Google US English',
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('female') && v.lang === 'en-US',
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('female') && v.lang.startsWith('en'),
        (v: SpeechSynthesisVoice) => ['Samantha', 'Kathy', 'Allison', 'Ava', 'Susan', 'Flo', 'Sandy', 'Shelley', 'Karen', 'Moira'].some(n => v.name.includes(n)),
        (v: SpeechSynthesisVoice) => v.name.includes('Zira'),
        (v: SpeechSynthesisVoice) => v.lang === 'en-US',
        (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
      ];
      for (const pred of priorities) {
        const match = voices.find(pred);
        if (match) { voiceRef.current = match; return; }
      }
    };
    pickVoice();
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pickVoice);
  }, []);

  useEffect(() => {
    setActiveWordIndex(null);
    setTranslation(null);
  }, [question.id]);

  useEffect(() => {
    if (!showFeedback) return;
    if (isCorrect) playCorrectSound();
    else playWrongSound();
  }, [showFeedback, isCorrect]);

  useEffect(() => {
    const handleClickOutside = () => setActiveWordIndex(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const speakSentence = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    ++speakIdRef.current;

    const text = showFeedback
      ? question.sentence.replace('____', question.options[question.correct])
      : question.sentence.replace('____', ',');

    const u = new SpeechSynthesisUtterance(text.trim());
    if (voiceRef.current) u.voice = voiceRef.current;
    u.lang = 'en-US';
    u.rate = 0.85;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const handleWordClick = async (word: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanWord = word.toLowerCase();

    if (activeWordIndex === index) {
      setActiveWordIndex(null);
      return;
    }

    speak(cleanWord);
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
        
        <div className="question-text-section">
          <button
            className={`speak-button${isSpeaking ? ' speaking' : ''}`}
            onClick={(e) => { e.stopPropagation(); speakSentence(); }}
            aria-label="Послушать произношение"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          </button>
          <div className="question-text">
            {renderQuestionText()}
          </div>
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