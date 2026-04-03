/*
  # Create Puzzles Table

  1. New Tables
    - `puzzles`
      - `id` (text, primary key) - Unique puzzle identifier
      - `answer` (text, not null) - The answer without spaces/punctuation (lowercase)
      - `display` (text, not null) - The formatted display text
      - `category` (text, not null) - One of: celebrity, sports, geography, other, general
      - `theme_category` (text, nullable) - Optional theme: music, videogames, movies, sports, history, science, currentevents
      - `hint` (text, nullable) - Optional hint text for the puzzle
      - `source` (text, not null) - Either 'static' or 'generated'
      - `created_at` (timestamptz) - When the puzzle was created
      - `difficulty` (text, nullable) - Optional difficulty rating
  
  2. Security
    - Enable RLS on `puzzles` table
    - Add policy for anyone to read puzzles (public game data)
    
  3. Indexes
    - Index on theme_category for faster filtering
    - Index on category for faster filtering
    - Index on source for faster queries
*/

CREATE TABLE IF NOT EXISTS puzzles (
  id text PRIMARY KEY,
  answer text NOT NULL,
  display text NOT NULL,
  category text NOT NULL,
  theme_category text,
  hint text,
  source text NOT NULL DEFAULT 'static',
  created_at timestamptz DEFAULT now(),
  difficulty text,
  CHECK (category IN ('celebrity', 'sports', 'geography', 'other', 'general')),
  CHECK (theme_category IS NULL OR theme_category IN ('music', 'videogames', 'movies', 'sports', 'history', 'science', 'currentevents')),
  CHECK (source IN ('static', 'generated'))
);

ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read puzzles"
  ON puzzles
  FOR SELECT
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_puzzles_theme_category ON puzzles(theme_category);
CREATE INDEX IF NOT EXISTS idx_puzzles_category ON puzzles(category);
CREATE INDEX IF NOT EXISTS idx_puzzles_source ON puzzles(source);