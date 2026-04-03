export type TileState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd' | 'hint-used';

export type Category = 'celebrity' | 'sports' | 'geography' | 'other' | 'general';

export type ThemeCategory = 'music' | 'videogames' | 'movies' | 'sports' | 'history' | 'science' | 'currentevents';

export type GameMode = 'daily' | 'practice' | 'sequence' | 'category';

export interface Puzzle {
  id: string;
  answer: string;
  display: string;
  category: Category;
  themeCategory?: ThemeCategory;
  hint?: string;
  wikiTitle?: string;
}

export interface Guess {
  word: string;
  tiles: TileState[];
}

export interface GameState {
  mode: GameMode;
  puzzle: Puzzle;
  guesses: Guess[];
  currentGuess: string;
  gameStatus: 'playing' | 'won' | 'lost';
  maxGuesses: number;
  hint?: string | null;
  hintUsed?: boolean;
  vowelRevealed?: string | null;
  vowelUsed?: boolean;
  consonantRevealed?: string | null;
  consonantUsed?: boolean;
}

export interface SequenceState {
  currentPuzzleIndex: number;
  totalPuzzles: number;
  puzzles: Puzzle[];
  results: {
    puzzle: Puzzle;
    guesses: number;
    won: boolean;
  }[];
}

export interface DailyStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>;
  lastPlayedDate: string | null;
}

export interface GameHistory {
  date: string;
  puzzleId: string;
  category: Category;
  guesses: number;
  won: boolean;
}

export interface CategoryStats {
  gamesPlayed: number;
  gamesWon: number;
}

export interface Stats {
  daily: DailyStats;
  practice: {
    gamesPlayed: number;
    gamesWon: number;
  };
  sequence: {
    sequencesPlayed: number;
    sequencesCompleted: number;
  };
  categories: {
    [key in ThemeCategory]?: CategoryStats;
  };
  history: GameHistory[];
}

export interface Settings {
  highContrast: boolean;
  reduceMotion: boolean;
  soundEnabled: boolean;
}
