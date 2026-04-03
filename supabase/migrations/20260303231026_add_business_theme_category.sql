/*
  # Add Business Theme Category

  1. Changes
    - Update the theme_category check constraint to include 'business'
    - This allows puzzles with theme_category = 'business' to be inserted
  
  2. Notes
    - Drops and recreates the constraint to add the new value
    - Existing data is not affected
*/

DO $$
BEGIN
  -- Drop the existing check constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'puzzles_theme_category_check'
  ) THEN
    ALTER TABLE puzzles DROP CONSTRAINT puzzles_theme_category_check;
  END IF;
END $$;

-- Add the updated constraint with 'business' included
ALTER TABLE puzzles 
  ADD CONSTRAINT puzzles_theme_category_check 
  CHECK (theme_category IS NULL OR theme_category IN ('music', 'videogames', 'movies', 'sports', 'history', 'science', 'currentevents', 'business'));
