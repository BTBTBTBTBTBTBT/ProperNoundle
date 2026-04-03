import { useState, useCallback } from 'react';
import { Puzzle, SequenceState } from '../types/game';
import { getRandomPuzzles } from '../utils/dailyPuzzle';

export function useSequence() {
  const [sequenceState, setSequenceState] = useState<SequenceState | null>(null);

  const startSequence = useCallback(async (): Promise<Puzzle> => {
    const puzzles = await getRandomPuzzles(5);
    setSequenceState({
      currentPuzzleIndex: 0,
      totalPuzzles: 5,
      puzzles,
      results: [],
    });
    return puzzles[0];
  }, []);

  const handleSequenceResult = useCallback((
    puzzle: Puzzle,
    won: boolean,
    guessCount: number,
  ): { done: boolean; nextPuzzle?: Puzzle } => {
    if (!sequenceState) return { done: true };

    const newResults = [
      ...sequenceState.results,
      { puzzle, guesses: guessCount, won },
    ];

    if (!won || sequenceState.currentPuzzleIndex >= sequenceState.totalPuzzles - 1) {
      setSequenceState(null);
      return { done: true };
    }

    const nextIndex = sequenceState.currentPuzzleIndex + 1;
    const nextPuzzle = sequenceState.puzzles[nextIndex];
    setSequenceState({
      ...sequenceState,
      currentPuzzleIndex: nextIndex,
      results: newResults,
    });
    return { done: false, nextPuzzle };
  }, [sequenceState]);

  return {
    sequenceState,
    startSequence,
    handleSequenceResult,
  };
}
