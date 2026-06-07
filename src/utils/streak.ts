export interface StreakData {
  streak: number;
  freezes: number;
  lastStudyDate: string | null;
  lastCheckDate: string | null;
  weekFreezeGiven: string | null;
}

const STORAGE_KEY = 'streakData';

const getTodayString = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getISOWeek = (dateStr: string): string => {
  const d = new Date(dateStr + 'T12:00:00');
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const daysBetween = (from: string, to: string): number => {
  const a = new Date(from + 'T12:00:00');
  const b = new Date(to + 'T12:00:00');
  return Math.round((b.getTime() - a.getTime()) / 86400000);
};

export const loadStreakData = (): StreakData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        streak: parsed.streak ?? 0,
        freezes: parsed.freezes ?? 0,
        lastStudyDate: parsed.lastStudyDate ?? null,
        lastCheckDate: parsed.lastCheckDate ?? null,
        weekFreezeGiven: parsed.weekFreezeGiven ?? null,
      };
    }
  } catch {}
  return { streak: 0, freezes: 0, lastStudyDate: null, lastCheckDate: null, weekFreezeGiven: null };
};

const save = (data: StreakData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Processes missed days up to yesterday. Call on any UI event (app open, button press, etc.)
// so that streak and freezes stay up to date even without completing a lesson.
export const recalculateStreak = (): StreakData => {
  const today = getTodayString();
  const data = loadStreakData();
  const yesterday = addDays(today, -1);

  // lastSettled is the most recent date we've already accounted for
  const lastSettled = data.lastCheckDate ?? data.lastStudyDate;

  // Nothing to process if already settled through yesterday or later
  if (lastSettled && lastSettled >= yesterday) return data;

  // Weekly freeze replenishment
  const currentWeek = getISOWeek(today);
  if (data.weekFreezeGiven !== currentWeek) {
    data.freezes = 3;
    data.weekFreezeGiven = currentWeek;
  }

  // Process missed days from (lastSettled + 1) through yesterday
  if (data.lastStudyDate && lastSettled) {
    const missedDays = daysBetween(lastSettled, yesterday);
    if (missedDays > 0 && data.streak > 0) {
      if (missedDays <= data.freezes) {
        data.freezes -= missedDays;
      } else {
        data.streak = 0;
        data.freezes = 0;
      }
    }
  }

  data.lastCheckDate = yesterday;
  save(data);
  return { ...data };
};

// Call only when a lesson is completed. Increments streak by 1 for today's study.
export const updateStreakOnLessonComplete = (): StreakData => {
  const today = getTodayString();
  const data = recalculateStreak();

  if (data.lastStudyDate === today) return data;

  // Handle new week starting today (not yet handled by recalculate which used yesterday's week)
  const currentWeek = getISOWeek(today);
  if (data.weekFreezeGiven !== currentWeek) {
    data.freezes = 3;
    data.weekFreezeGiven = currentWeek;
  }

  data.streak += 1;
  data.lastStudyDate = today;
  data.lastCheckDate = today;
  save(data);
  return { ...data };
};
