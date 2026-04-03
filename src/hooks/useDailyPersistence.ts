import { useCallback } from 'react';
import { Puzzle, Guess, GameMode } from '../types/game';
import { saveDailyGameState } from '../utils/storage';

interface PersistData {
  puzzle: Puzzle;
  guesses: Guess[];
  currentGuess: string;
  gameStatus: 'playing' | 'won' | 'lost';
  hint: string | null;
  hintUsed: boolean;
  vowelRevealed: string | null;
  vowelUsed: boolean;
  consonantRevealed: string | null;
  consonantUsed: boolean;
}

export function useDailyPersistence(gameMode: GameMode) {
  const persistIfDaily = useCallback((data: PersistData) => {
    if (gameMode !== 'daily') return;
    saveDailyGameState({
      mode: 'daily',
      puzzle: data.puzzle,
      guesses: data.guesses,
      currentGuess: data.currentGuess,
      gameStatus: data.gameStatus,
      maxGuesses: 6,
      hint: data.hint,
      hintUsed: data.hintUsed,
      vowelRevealed: data.vowelRevealed,
      vowelUsed: data.vowelUsed,
      consonantRevealed: data.consonantRevealed,
      consonantUsed: data.consonantUsed,
    });
  }, [gameMode]);

  return { persistIfDaily };
}
