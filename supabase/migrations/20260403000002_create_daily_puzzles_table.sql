/*
  # Create daily_puzzles table

  Locks each calendar date to a specific puzzle ID permanently.
  Once a date is assigned a puzzle, it never changes.

  1. New Tables
    - `daily_puzzles`
      - `date` (text, primary key) - Calendar date in YYYY-MM-DD format
      - `puzzle_id` (text, not null) - References puzzles(id)
      - `created_at` (timestamptz) - When the assignment was created

  2. Security
    - Enable RLS
    - Anyone can read daily puzzle assignments
    - Only service role can write (handled by default RLS deny)
*/

CREATE TABLE IF NOT EXISTS daily_puzzles (
  date text PRIMARY KEY,
  puzzle_id text NOT NULL REFERENCES puzzles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_puzzles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily puzzles"
  ON daily_puzzles
  FOR SELECT
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_daily_puzzles_puzzle_id ON daily_puzzles(puzzle_id);
