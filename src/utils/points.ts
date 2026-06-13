const POINTS_KEY = 'totalPoints';

export const loadPoints = (): number => {
  const raw = localStorage.getItem(POINTS_KEY);
  return raw ? parseInt(raw, 10) || 0 : 0;
};

export const addPoints = (n: number): number => {
  const total = loadPoints() + n;
  localStorage.setItem(POINTS_KEY, String(total));
  return total;
};
