/*
  # Add public read access to puzzles table

  1. Changes
    - Add policy to allow public role to read puzzles
    - This ensures unauthenticated users can load puzzles

  2. Security
    - Read-only access for everyone
    - No write permissions for unauthenticated users
*/

-- Drop existing policy if it exists and recreate with both anon and public roles
DROP POLICY IF EXISTS "Anyone can read puzzles" ON puzzles;

CREATE POLICY "Anyone can read puzzles"
  ON puzzles
  FOR SELECT
  USING (true);
