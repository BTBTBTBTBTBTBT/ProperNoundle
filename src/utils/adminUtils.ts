import { generatePuzzles } from './puzzleDatabase';
import { ThemeCategory } from '../types/game';

export async function generatePuzzlesForCategory(
  themeCategory: ThemeCategory,
  count: number = 10
): Promise<void> {
  try {
    console.log(`Generating ${count} puzzles for ${themeCategory}...`);
    const puzzles = await generatePuzzles(themeCategory, count);
    console.log('Generated puzzles:', puzzles);
    console.log(`Successfully generated ${puzzles.length} new puzzles!`);
  } catch (error) {
    console.error('Failed to generate puzzles:', error);
    throw error;
  }
}

export async function generateMixedPuzzles(count: number = 10): Promise<void> {
  try {
    console.log(`Generating ${count} mixed puzzles...`);
    const puzzles = await generatePuzzles(undefined, count);
    console.log('Generated puzzles:', puzzles);
    console.log(`Successfully generated ${puzzles.length} new puzzles!`);
  } catch (error) {
    console.error('Failed to generate puzzles:', error);
    throw error;
  }
}
