import { createClient } from '@supabase/supabase-js';
import { Puzzle, ThemeCategory } from '../types/game';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

interface DatabasePuzzle {
  id: string;
  answer: string;
  display: string;
  category: string;
  theme_category: string | null;
  hint: string | null;
  source: string;
  created_at: string;
}

function mapDatabasePuzzle(dbPuzzle: DatabasePuzzle): Puzzle {
  return {
    id: dbPuzzle.id,
    answer: dbPuzzle.answer,
    display: dbPuzzle.display,
    category: dbPuzzle.category as Puzzle['category'],
    themeCategory: dbPuzzle.theme_category as ThemeCategory | undefined,
    hint: dbPuzzle.hint || undefined,
  };
}

export async function getAllPuzzles(): Promise<Puzzle[]> {
  const { data, error } = await supabase
    .from('puzzles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching puzzles:', error);
    return [];
  }

  return data.map(mapDatabasePuzzle);
}

export async function getPuzzlesByTheme(themeCategory: ThemeCategory): Promise<Puzzle[]> {
  const { data, error } = await supabase
    .from('puzzles')
    .select('*')
    .eq('theme_category', themeCategory)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching theme puzzles:', error);
    return [];
  }

  return data.map(mapDatabasePuzzle);
}

export async function generatePuzzles(themeCategory?: string, count: number = 5): Promise<Puzzle[]> {
  try {
    const apiUrl = `${supabaseUrl}/functions/v1/generate-puzzles`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ themeCategory, count }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate puzzles');
    }

    const result = await response.json();
    return result.puzzles.map(mapDatabasePuzzle);
  } catch (error) {
    console.error('Error generating puzzles:', error);
    throw error;
  }
}

export async function seedStaticPuzzles(puzzles: Puzzle[]): Promise<void> {
  const puzzlesToInsert = puzzles.map(puzzle => ({
    id: puzzle.id,
    answer: puzzle.answer,
    display: puzzle.display,
    category: puzzle.category,
    theme_category: puzzle.themeCategory || null,
    hint: puzzle.hint || null,
    source: 'static',
  }));

  const { error } = await supabase
    .from('puzzles')
    .upsert(puzzlesToInsert, { onConflict: 'id' });

  if (error) {
    console.error('Error seeding puzzles:', error);
    throw error;
  }
}
