const WIKI_API = 'https://en.wikipedia.org/api/rest_v1/page/summary';

interface WikiSummary {
  extract: string;
  title: string;
  description?: string;
  thumbnail?: { source: string; width: number; height: number };
}

/**
 * Fetches a hint from Wikipedia's free REST API.
 * Returns the first 1-2 sentences of the article summary,
 * with the subject's name redacted so it doesn't spoil the answer.
 */
export async function fetchWikipediaHint(
  displayName: string,
  wikiTitle?: string
): Promise<string> {
  const title = encodeURIComponent(
    (wikiTitle || displayName).replace(/\s+/g, '_')
  );

  const response = await fetch(`${WIKI_API}/${title}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Wikipedia API returned ${response.status}`);
  }

  const data: WikiSummary = await response.json();

  if (!data.extract) {
    throw new Error('No summary available');
  }

  return sanitizeHint(data.extract, displayName);
}

/**
 * Takes the raw Wikipedia extract and:
 * 1. Trims to first 2 sentences
 * 2. Replaces occurrences of the answer name with "this subject" / "they" etc.
 */
/**
 * Fetches the Wikipedia thumbnail image URL for a puzzle answer.
 */
export async function fetchWikipediaImage(
  displayName: string,
  wikiTitle?: string
): Promise<string | null> {
  const title = encodeURIComponent(
    (wikiTitle || displayName).replace(/\s+/g, '_')
  );

  try {
    const response = await fetch(`${WIKI_API}/${title}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return null;

    const data: WikiSummary = await response.json();
    return data.thumbnail?.source || null;
  } catch {
    return null;
  }
}

function sanitizeHint(extract: string, displayName: string): string {
  // Get first 2 sentences
  const sentences = extract.match(/[^.!?]+[.!?]+/g) || [extract];
  let hint = sentences.slice(0, 2).join(' ').trim();

  // Build patterns to redact: full name, each individual word (>2 chars)
  const nameParts = displayName.split(/\s+/).filter(p => p.length > 2);
  const patterns = [displayName, ...nameParts];

  for (const pattern of patterns) {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    hint = hint.replace(regex, '______');
  }

  // Collapse consecutive redactions
  hint = hint.replace(/(______\s*)+/g, '______');

  return hint;
}
