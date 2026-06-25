import { Question } from '../types';

const STORAGE_KEY = 'seenQuestions';

// Map of pool key -> ids already shown in the current cycle through that pool.
type SeenMap = Record<string, number[]>;

const loadSeen = (): SeenMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SeenMap;
  } catch {}
  return {};
};

const saveSeen = (map: SeenMap): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
};

// Fisher-Yates shuffle: produces a uniform permutation, unlike sort(() => Math.random() - 0.5).
const shuffle = <T,>(arr: T[]): T[] => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Picks `count` questions from `pool`, cycling through the whole pool before any
// question repeats. The set of already-shown ids is persisted per pool key so the
// cycle survives across lessons (and app restarts).
export const selectLessonQuestions = (
  pool: Question[],
  poolKey: string,
  count: number
): Question[] => {
  if (pool.length === 0) return [];
  const target = Math.min(count, pool.length);

  const seenMap = loadSeen();
  const seen = seenMap[poolKey] ?? [];
  const seenSet = new Set(seen);

  const unseen = shuffle(pool.filter(q => !seenSet.has(q.id)));

  let picked: Question[];
  let nextSeen: number[];

  if (unseen.length >= target) {
    picked = unseen.slice(0, target);
    const accumulated = [...seen, ...picked.map(q => q.id)];
    // If this lesson exhausts the pool, start a fresh cycle but keep this batch
    // as "seen" so the questions just shown don't reappear in the next lesson.
    nextSeen = accumulated.length >= pool.length ? picked.map(q => q.id) : accumulated;
  } else {
    // Not enough unseen questions to fill the lesson: finish the current cycle with
    // what's left, then start a new cycle for the remainder (excluding the questions
    // we just picked so they don't repeat immediately).
    picked = [...unseen];
    const need = target - picked.length;
    const pickedSet = new Set(picked.map(q => q.id));
    const fresh = shuffle(pool.filter(q => !pickedSet.has(q.id)));
    picked = [...picked, ...fresh.slice(0, need)];
    nextSeen = picked.map(q => q.id);
  }

  saveSeen({ ...seenMap, [poolKey]: nextSeen });
  return picked;
};
