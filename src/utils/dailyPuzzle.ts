import { PUZZLES } from '../data/dataset';
import { Puzzle, ThemeCategory } from '../types/game';
import { getAllPuzzles, getPuzzlesByTheme, seedStaticPuzzles } from './puzzleDatabase';

const EPOCH_DATE = new Date('2024-01-01');

let cachedPuzzles: Puzzle[] = [...PUZZLES];
let lastFetch: number = 0;
const CACHE_DURATION = 5 * 60 * 1000;

async function ensurePuzzlesLoaded(): Promise<Puzzle[]> {
  const now = Date.now();

  if (cachedPuzzles.length > PUZZLES.length || (now - lastFetch) < CACHE_DURATION) {
    console.log(`Using cached puzzles (${cachedPuzzles.length} puzzles)`);
    return cachedPuzzles;
  }

  try {
    console.log('Fetching puzzles from Supabase database...');
    const dbPuzzles = await getAllPuzzles();

    if (dbPuzzles.length === 0) {
      console.log('No puzzles in database, seeding static puzzles...');
      await seedStaticPuzzles(PUZZLES);
      cachedPuzzles = [...PUZZLES];
    } else {
      console.log(`Loaded ${dbPuzzles.length} puzzles from database`);
      cachedPuzzles = dbPuzzles;
    }

    lastFetch = now;
  } catch (error) {
    console.error('Failed to load puzzles from database:', error);
    console.log('Falling back to static puzzles');
    cachedPuzzles = [...PUZZLES];
  }

  return cachedPuzzles;
}

export function getTodayString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export function getDaysSinceEpoch(dateString?: string): number {
  const targetDate = dateString ? new Date(dateString) : new Date();
  const timeDiff = targetDate.getTime() - EPOCH_DATE.getTime();
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
}

export async function getDailyPuzzle(dateString?: string): Promise<Puzzle> {
  const puzzles = await ensurePuzzlesLoaded();
  const dayNumber = getDaysSinceEpoch(dateString);
  const index = dayNumber % puzzles.length;
  return puzzles[index];
}

export function getDailyPuzzleNumber(dateString?: string): number {
  return getDaysSinceEpoch(dateString) + 1;
}

export async function getRandomPuzzle(excludeIds: string[] = []): Promise<Puzzle> {
  const puzzles = await ensurePuzzlesLoaded();
  const available = puzzles.filter(p => !excludeIds.includes(p.id));
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

export async function getRandomPuzzles(count: number): Promise<Puzzle[]> {
  const puzzles = await ensurePuzzlesLoaded();
  const shuffled = [...puzzles].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function getPuzzlesByThemeCategory(themeCategory: ThemeCategory): Promise<Puzzle[]> {
  try {
    const dbPuzzles = await getPuzzlesByTheme(themeCategory);
    if (dbPuzzles.length > 0) {
      return dbPuzzles;
    }
  } catch (error) {
    console.error('Failed to fetch theme puzzles:', error);
  }

  const puzzles = await ensurePuzzlesLoaded();
  return puzzles.filter(p => p.themeCategory === themeCategory);
}

export async function getCategoryPuzzles(themeCategory: ThemeCategory, count: number = 5): Promise<Puzzle[]> {
  const categoryPuzzles = await getPuzzlesByThemeCategory(themeCategory);
  const shuffled = [...categoryPuzzles].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, categoryPuzzles.length));
}
