import { Guess, Category } from '../types/game';
import { getDailyPuzzleNumber } from './dailyPuzzle';

export function generateShareText(
  guesses: Guess[],
  puzzleNumber: number,
  category: Category,
  gameStatus: 'won' | 'lost',
  maxGuesses: number
): string {
  const guessCount = gameStatus === 'won' ? guesses.length : 'X';

  let text = `ProperNoundle #${puzzleNumber} (${capitalizeCategory(category)}) ${guessCount}/${maxGuesses}\n\n`;

  guesses.forEach(guess => {
    const row = guess.tiles.map(tileStateToEmoji).join('');
    text += row + '\n';
  });

  return text.trim();
}

export function generateDailyShareText(
  guesses: Guess[],
  category: Category,
  gameStatus: 'won' | 'lost',
  maxGuesses: number,
  currentStreak?: number
): string {
  const puzzleNumber = getDailyPuzzleNumber();
  let text = generateShareText(guesses, puzzleNumber, category, gameStatus, maxGuesses);

  if (currentStreak && currentStreak > 1) {
    text += `\n🔥 ${currentStreak} day streak!`;
  }

  return text;
}

export function tileStateToEmoji(state: string): string {
  switch (state) {
    case 'correct':
      return '🟩';
    case 'present':
      return '🟨';
    case 'absent':
      return '⬜';
    default:
      return '⬜';
  }
}

export function capitalizeCategory(category: Category): string {
  switch (category) {
    case 'celebrity':
      return 'Celebrity';
    case 'sports':
      return 'Sports';
    case 'geography':
      return 'Geography';
    default:
      return 'Other';
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
