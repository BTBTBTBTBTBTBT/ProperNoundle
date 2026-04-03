import { Stats, GameState, Settings, ThemeCategory, CategoryStats } from '../types/game';
import { getTodayString } from './dailyPuzzle';

const STATS_KEY = 'propernoundle_stats';
const DAILY_GAME_KEY = 'propernoundle_daily_game';
const SETTINGS_KEY = 'propernoundle_settings';
const MIGRATION_KEY = 'propernoundle_migrated';

const OLD_STATS_KEY = 'pronoundle_stats';
const OLD_DAILY_GAME_KEY = 'pronoundle_daily_game';
const OLD_SETTINGS_KEY = 'pronoundle_settings';

function migrateFromOldKeys(): void {
  if (localStorage.getItem(MIGRATION_KEY)) {
    return;
  }

  const oldStats = localStorage.getItem(OLD_STATS_KEY);
  if (oldStats && !localStorage.getItem(STATS_KEY)) {
    localStorage.setItem(STATS_KEY, oldStats);
  }

  const oldDailyGame = localStorage.getItem(OLD_DAILY_GAME_KEY);
  if (oldDailyGame && !localStorage.getItem(DAILY_GAME_KEY)) {
    localStorage.setItem(DAILY_GAME_KEY, oldDailyGame);
  }

  const oldSettings = localStorage.getItem(OLD_SETTINGS_KEY);
  if (oldSettings && !localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(SETTINGS_KEY, oldSettings);
  }

  localStorage.setItem(MIGRATION_KEY, 'true');
}

migrateFromOldKeys();

export function getStats(): Stats {
  const stored = localStorage.getItem(STATS_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (!parsed.categories) {
      parsed.categories = {};
    }
    return parsed;
  }

  return {
    daily: {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: {},
      lastPlayedDate: null,
    },
    practice: {
      gamesPlayed: 0,
      gamesWon: 0,
    },
    sequence: {
      sequencesPlayed: 0,
      sequencesCompleted: 0,
    },
    categories: {},
    history: [],
  };
}

export function saveStats(stats: Stats): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function updateDailyStats(won: boolean, guesses: number): void {
  const stats = getStats();
  const today = getTodayString();

  stats.daily.gamesPlayed++;

  if (won) {
    stats.daily.gamesWon++;
    stats.daily.guessDistribution[guesses] = (stats.daily.guessDistribution[guesses] || 0) + 1;

    if (stats.daily.lastPlayedDate) {
      const lastDate = new Date(stats.daily.lastPlayedDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        stats.daily.currentStreak++;
      } else if (daysDiff > 1) {
        stats.daily.currentStreak = 1;
      }
    } else {
      stats.daily.currentStreak = 1;
    }

    if (stats.daily.currentStreak > stats.daily.maxStreak) {
      stats.daily.maxStreak = stats.daily.currentStreak;
    }
  } else {
    if (stats.daily.lastPlayedDate) {
      const lastDate = new Date(stats.daily.lastPlayedDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff > 0) {
        stats.daily.currentStreak = 0;
      }
    }
  }

  stats.daily.lastPlayedDate = today;
  saveStats(stats);
}

export function updatePracticeStats(won: boolean): void {
  const stats = getStats();
  stats.practice.gamesPlayed++;
  if (won) {
    stats.practice.gamesWon++;
  }
  saveStats(stats);
}

export function updateSequenceStats(completed: boolean): void {
  const stats = getStats();
  stats.sequence.sequencesPlayed++;
  if (completed) {
    stats.sequence.sequencesCompleted++;
  }
  saveStats(stats);
}

export function addGameHistory(date: string, puzzleId: string, category: string, guesses: number, won: boolean): void {
  const stats = getStats();
  stats.history.unshift({
    date,
    puzzleId,
    category: category as any,
    guesses,
    won,
  });

  if (stats.history.length > 100) {
    stats.history = stats.history.slice(0, 100);
  }

  saveStats(stats);
}

export function getDailyGameState(): GameState | null {
  const stored = localStorage.getItem(DAILY_GAME_KEY);
  if (!stored) return null;

  const state = JSON.parse(stored);
  const today = getTodayString();

  if (state.date !== today) {
    localStorage.removeItem(DAILY_GAME_KEY);
    return null;
  }

  return state.gameState;
}

export function saveDailyGameState(gameState: GameState): void {
  const today = getTodayString();
  localStorage.setItem(DAILY_GAME_KEY, JSON.stringify({
    date: today,
    gameState,
  }));
}

export function getSettings(): Settings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    return {
      highContrast: parsed.highContrast || false,
      reduceMotion: parsed.reduceMotion || false,
      soundEnabled: parsed.soundEnabled || false,
    };
  }

  return {
    highContrast: false,
    reduceMotion: false,
    soundEnabled: false,
  };
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getCategoryStats(category: ThemeCategory): CategoryStats {
  const stats = getStats();
  if (!stats.categories[category]) {
    stats.categories[category] = {
      gamesPlayed: 0,
      gamesWon: 0,
    };
    saveStats(stats);
  }
  return stats.categories[category]!;
}

export function updateCategoryStats(category: ThemeCategory, won: boolean): void {
  const stats = getStats();
  if (!stats.categories[category]) {
    stats.categories[category] = {
      gamesPlayed: 0,
      gamesWon: 0,
    };
  }
  stats.categories[category]!.gamesPlayed++;
  if (won) {
    stats.categories[category]!.gamesWon++;
  }
  saveStats(stats);
}

export function getAllCategoryStats(): Record<ThemeCategory, CategoryStats> {
  const stats = getStats();
  const categories: ThemeCategory[] = ['music', 'videogames', 'movies', 'sports', 'history', 'science', 'currentevents'];
  const result: Record<string, CategoryStats> = {};

  categories.forEach(cat => {
    result[cat] = stats.categories[cat] || {
      gamesPlayed: 0,
      gamesWon: 0,
    };
  });

  return result as Record<ThemeCategory, CategoryStats>;
}
