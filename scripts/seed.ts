/**
 * Seed script: pushes all puzzles from dataset.ts to Supabase
 * and backfills the daily_puzzles table for historical dates.
 *
 * Usage: npx tsx scripts/seed.ts
 *
 * Requires env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 * (reads from .env automatically via dotenv-like manual parsing)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Load env vars from .env ──────────────────────────────────────────
const envPath = resolve(import.meta.dirname!, '..', '.env');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // .env may not exist if vars are set in the environment
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Import dataset (dynamic import of TS file via tsx) ───────────────
const { PUZZLES } = await import('../src/data/dataset.js');

console.log(`Loaded ${PUZZLES.length} puzzles from dataset`);

// ── 1. Upsert all puzzles ────────────────────────────────────────────
const BATCH_SIZE = 50;
let upserted = 0;

for (let i = 0; i < PUZZLES.length; i += BATCH_SIZE) {
  const batch = PUZZLES.slice(i, i + BATCH_SIZE).map((p: any) => ({
    id: p.id,
    answer: p.answer,
    display: p.display,
    category: p.category,
    theme_category: p.themeCategory || null,
    hint: p.hint || null,
    wiki_title: p.wikiTitle || null,
    source: 'static',
  }));

  const { error } = await supabase
    .from('puzzles')
    .upsert(batch, { onConflict: 'id' });

  if (error) {
    console.error(`Error upserting batch at index ${i}:`, error);
    process.exit(1);
  }

  upserted += batch.length;
  console.log(`  Upserted ${upserted}/${PUZZLES.length} puzzles`);
}

console.log(`✓ All ${PUZZLES.length} puzzles seeded`);

// ── 2. Backfill daily_puzzles ────────────────────────────────────────
const EPOCH = new Date('2024-01-01');
const today = new Date();
today.setHours(0, 0, 0, 0);

const totalDays = Math.floor((today.getTime() - EPOCH.getTime()) / (1000 * 60 * 60 * 24));
console.log(`\nBackfilling ${totalDays + 1} daily puzzle assignments (${EPOCH.toISOString().slice(0, 10)} → ${today.toISOString().slice(0, 10)})...`);

const dailyRows: { date: string; puzzle_id: string }[] = [];

for (let d = 0; d <= totalDays; d++) {
  const date = new Date(EPOCH);
  date.setDate(date.getDate() + d);
  const dateStr = date.toISOString().slice(0, 10);
  const puzzleIndex = d % PUZZLES.length;
  dailyRows.push({ date: dateStr, puzzle_id: PUZZLES[puzzleIndex].id });
}

// Upsert in batches
let dailyUpserted = 0;
for (let i = 0; i < dailyRows.length; i += BATCH_SIZE) {
  const batch = dailyRows.slice(i, i + BATCH_SIZE);
  const { error } = await supabase
    .from('daily_puzzles')
    .upsert(batch, { onConflict: 'date' });

  if (error) {
    console.error(`Error upserting daily_puzzles batch at index ${i}:`, error);
    process.exit(1);
  }

  dailyUpserted += batch.length;
  console.log(`  Backfilled ${dailyUpserted}/${dailyRows.length} daily assignments`);
}

console.log(`✓ All ${dailyRows.length} daily puzzle assignments seeded`);
console.log('\nDone!');
