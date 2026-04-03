import { useReducer, useCallback } from 'react';
import { Puzzle, Guess, TileState } from '../types/game';
import { evaluateGuess, normalizeString, checkWin } from '../utils/gameLogic';

const MAX_GUESSES = 6;

interface GameState {
  puzzle: Puzzle | null;
  guesses: Guess[];
  currentGuess: string;
  gameStatus: 'playing' | 'won' | 'lost';
  letterStates: Record<string, TileState>;
  shouldShake: boolean;
}

type GameAction =
  | { type: 'SET_PUZZLE'; puzzle: Puzzle }
  | { type: 'SET_CURRENT_GUESS'; value: string }
  | { type: 'ADD_GUESS'; guess: Guess }
  | { type: 'UPDATE_LETTER_STATES'; states: Record<string, TileState> }
  | { type: 'SET_STATUS'; status: 'playing' | 'won' | 'lost' }
  | { type: 'SHAKE' }
  | { type: 'STOP_SHAKE' }
  | { type: 'RESET'; puzzle: Puzzle }
  | { type: 'RESTORE'; state: Partial<GameState> };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PUZZLE':
      return { ...state, puzzle: action.puzzle };
    case 'SET_CURRENT_GUESS':
      return { ...state, currentGuess: action.value };
    case 'ADD_GUESS':
      return { ...state, guesses: [...state.guesses, action.guess], currentGuess: '' };
    case 'UPDATE_LETTER_STATES':
      return { ...state, letterStates: action.states };
    case 'SET_STATUS':
      return { ...state, gameStatus: action.status };
    case 'SHAKE':
      return { ...state, shouldShake: true };
    case 'STOP_SHAKE':
      return { ...state, shouldShake: false };
    case 'RESET':
      return {
        puzzle: action.puzzle,
        guesses: [],
        currentGuess: '',
        gameStatus: 'playing',
        letterStates: {},
        shouldShake: false,
      };
    case 'RESTORE':
      return { ...state, ...action.state };
    default:
      return state;
  }
}

const initialState: GameState = {
  puzzle: null,
  guesses: [],
  currentGuess: '',
  gameStatus: 'playing',
  letterStates: {},
  shouldShake: false,
};

function buildLetterStates(guesses: Guess[]): Record<string, TileState> {
  const states: Record<string, TileState> = {};
  guesses.forEach(guess => {
    const letters = normalizeString(guess.word).split('');
    letters.forEach((letter, index) => {
      const key = letter.toUpperCase();
      const current = states[key];
      const next = guess.tiles[index];
      if (next === 'correct') {
        states[key] = 'correct';
      } else if (next === 'present' && current !== 'correct') {
        states[key] = 'present';
      } else if (!current) {
        states[key] = next;
      }
    });
  });
  return states;
}

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const answerLength = state.puzzle ? normalizeString(state.puzzle.answer).length : 0;

  const resetGame = useCallback((puzzle: Puzzle) => {
    dispatch({ type: 'RESET', puzzle });
  }, []);

  const restoreGame = useCallback((data: {
    puzzle: Puzzle;
    guesses: Guess[];
    currentGuess: string;
    gameStatus: 'playing' | 'won' | 'lost';
  }) => {
    const letterStates = buildLetterStates(data.guesses);
    dispatch({
      type: 'RESTORE',
      state: {
        puzzle: data.puzzle,
        guesses: data.guesses,
        currentGuess: data.currentGuess,
        gameStatus: data.gameStatus,
        letterStates,
      },
    });
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (state.gameStatus !== 'playing' || !state.puzzle) return;
    const normalized = normalizeString(state.currentGuess + key);
    if (normalized.length <= answerLength) {
      dispatch({ type: 'SET_CURRENT_GUESS', value: state.currentGuess + key });
    }
  }, [state.gameStatus, state.currentGuess, state.puzzle, answerLength]);

  const handleBackspace = useCallback(() => {
    if (state.gameStatus !== 'playing') return;
    dispatch({ type: 'SET_CURRENT_GUESS', value: state.currentGuess.slice(0, -1) });
  }, [state.gameStatus, state.currentGuess]);

  const handleEnter = useCallback((): { won: boolean; lost: boolean; guesses: Guess[] } | null => {
    if (state.gameStatus !== 'playing' || !state.puzzle) return null;

    const normalizedGuess = normalizeString(state.currentGuess);
    if (normalizedGuess.length !== answerLength) {
      dispatch({ type: 'SHAKE' });
      setTimeout(() => dispatch({ type: 'STOP_SHAKE' }), 500);
      return null;
    }

    const tiles = evaluateGuess(state.currentGuess, state.puzzle.answer);
    const newGuess: Guess = { word: state.currentGuess, tiles };
    const newGuesses = [...state.guesses, newGuess];

    dispatch({ type: 'ADD_GUESS', guess: newGuess });

    // Update letter states
    const newLetterStates = { ...state.letterStates };
    normalizedGuess.split('').forEach((letter, index) => {
      const key = letter.toUpperCase();
      const current = newLetterStates[key];
      const next = tiles[index];
      if (next === 'correct') {
        newLetterStates[key] = 'correct';
      } else if (next === 'present' && current !== 'correct') {
        newLetterStates[key] = 'present';
      } else if (!current) {
        newLetterStates[key] = next;
      }
    });
    dispatch({ type: 'UPDATE_LETTER_STATES', states: newLetterStates });

    const won = checkWin(tiles);
    const lost = !won && newGuesses.length >= MAX_GUESSES;

    if (won) dispatch({ type: 'SET_STATUS', status: 'won' });
    else if (lost) dispatch({ type: 'SET_STATUS', status: 'lost' });

    return { won, lost, guesses: newGuesses };
  }, [state.gameStatus, state.puzzle, state.currentGuess, state.guesses, state.letterStates, answerLength]);

  const addHintGuess = useCallback((guess: Guess) => {
    dispatch({ type: 'ADD_GUESS', guess });
    const newGuesses = [...state.guesses, guess];
    if (newGuesses.length >= MAX_GUESSES) {
      dispatch({ type: 'SET_STATUS', status: 'lost' });
      return true; // indicates loss
    }
    return false;
  }, [state.guesses]);

  return {
    ...state,
    answerLength,
    maxGuesses: MAX_GUESSES,
    resetGame,
    restoreGame,
    handleKeyPress,
    handleBackspace,
    handleEnter,
    addHintGuess,
  };
}
