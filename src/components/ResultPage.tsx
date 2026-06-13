import React, { useEffect } from 'react';
import { LessonResult } from '../types';
import rioNormal from '../images/rio-normal.png';

interface ResultPageProps {
  result: LessonResult;
  onGoHome: () => void;
}

const makeCtx = (): AudioContext | null => {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  return Ctx ? new Ctx() : null;
};

const tone = (
  ctx: AudioContext,
  freq: number,
  start: number,
  dur: number,
  vol = 0.3,
  type: OscillatorType = 'sine'
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.start(start);
  osc.stop(start + dur);
};

const playFanfare = () => {
  const ctx = makeCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  // восходящий мажорный арпеджио + финальный аккорд
  tone(ctx, 523, t,        0.18, 0.28); // C5
  tone(ctx, 659, t + 0.15, 0.18, 0.28); // E5
  tone(ctx, 784, t + 0.30, 0.18, 0.28); // G5
  tone(ctx, 1047,t + 0.45, 0.35, 0.28); // C6
  // финальный аккорд C-E-G одновременно
  tone(ctx, 523, t + 0.65, 0.6, 0.22);
  tone(ctx, 659, t + 0.65, 0.6, 0.22);
  tone(ctx, 784, t + 0.65, 0.6, 0.22);
};

const playSadMelody = () => {
  const ctx = makeCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  // нисходящая минорная фраза
  tone(ctx, 392, t,        0.30, 0.25); // G4
  tone(ctx, 349, t + 0.28, 0.30, 0.25); // F4
  tone(ctx, 311, t + 0.56, 0.30, 0.25); // Eb4
  tone(ctx, 261, t + 0.84, 0.55, 0.25); // C4 — долгий финал
};

const ResultPage: React.FC<ResultPageProps> = ({ result, onGoHome }) => {
  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  // percentage kept for sound trigger only

  useEffect(() => {
    const timer = setTimeout(() => {
      if (result.score > result.totalQuestions / 2) playFanfare();
      else playSadMelody();
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="result-page">
      <div className="result-content">
        <img src={rioNormal} alt="Rio Normal" className="rio-character" />
        
        <div className="result-info">
          <h1>Урок завершен!</h1>
          <div className="score">
            <div className="score-number">{result.score}/{result.totalQuestions}</div>
            <div className="score-earned">⚡ {result.earnedPoints}</div>
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