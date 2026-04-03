/*
  # Add wiki_title column to puzzles table

  Adds an optional wiki_title field used when the Wikipedia article title
  differs from the puzzle's display name (e.g. "COVID-19" → "COVID-19_pandemic").
*/

ALTER TABLE puzzles ADD COLUMN IF NOT EXISTS wiki_title text;
