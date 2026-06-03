export interface StreakData {
  streak: number;
  freezes: number;
  lastStudyDate: string | null;
  weekFreezeGiven: string | null;
}

const STORAGE_KEY = 'streakData';

const getTodayString = (): string => {
  const d = new Date();
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
    if (raw) return JSON.parse(raw);
  } catch {}
  return { streak: 0, freezes: 0, lastStudyDate: null, weekFreezeGiven: null };
};

const save = (data: StreakData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const updateStreakOnLessonComplete = (): StreakData => {
  const today = getTodayString();
  const data = loadStreakData();

  if (data.lastStudyDate === today) return data;

  // Weekly freeze replenishment
  const currentWeek = getISOWeek(today);
  if (data.weekFreezeGiven !== currentWeek) {
    data.freezes = 3;
    data.weekFreezeGiven = currentWeek;
  }

  if (!data.lastStudyDate) {
    data.streak = 1;
  } else {
    const gap = daysBetween(data.lastStudyDate, today);
    const missedDays = gap - 1;

    if (missedDays === 0) {
      data.streak += 1;
    } else if (missedDays <= data.freezes) {
      data.freezes -= missedDays;
      data.streak += gap;
    } else {
      data.streak = 1;
      data.freezes = 0;
    }
  }

  data.lastStudyDate = today;
  save(data);
  return { ...data };
};
