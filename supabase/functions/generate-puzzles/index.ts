import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GeneratePuzzlesRequest {
  themeCategory?: string;
  count?: number;
}

interface GeneratedPuzzle {
  answer: string;
  display: string;
  category: "celebrity" | "sports" | "geography" | "other" | "general";
  themeCategory?: string;
  hint: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicKey) {
      return new Response(
        JSON.stringify({
          error: "ANTHROPIC_API_KEY not configured. Please add your Anthropic API key to generate puzzles."
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { themeCategory, count = 5 }: GeneratePuzzlesRequest = await req.json();

    const prompt = `Generate ${count} puzzle words/phrases for a Wordle-style game${themeCategory ? ` in the "${themeCategory}" theme` : ''}.

Requirements:
- Each puzzle should be a popular, recognizable term (celebrity name, place, movie, game, etc.)
- Answer: remove all spaces, punctuation, and convert to lowercase (e.g., "Taylor Swift" → "taylorswift")
- Display: the formatted version with proper capitalization and spacing
- Category: choose from: celebrity, sports, geography, other, general
- ThemeCategory: ${themeCategory || 'choose from: music, videogames, movies, sports, history, science, currentevents'}
- Hint: a clever, helpful hint that doesn't give away the answer directly (2-3 sentences)

Return ONLY a valid JSON array with this exact structure:
[
  {
    "answer": "taylorswift",
    "display": "Taylor Swift",
    "category": "celebrity",
    "themeCategory": "music",
    "hint": "She's known for shaking it off and has won more Grammy Awards than any other artist in history. Her albums are often named after her age at the time of writing."
  }
]`;

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      throw new Error(`Anthropic API error: ${errorText}`);
    }

    const anthropicData = await anthropicResponse.json();
    const generatedText = anthropicData.content[0].text;

    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from Claude response");
    }

    const puzzles: GeneratedPuzzle[] = JSON.parse(jsonMatch[0]);

    const puzzlesToInsert = puzzles.map((puzzle, index) => ({
      id: `gen_${themeCategory || 'misc'}_${Date.now()}_${index}`,
      answer: puzzle.answer,
      display: puzzle.display,
      category: puzzle.category,
      theme_category: puzzle.themeCategory || themeCategory,
      hint: puzzle.hint,
      source: "generated",
    }));

    const { data, error } = await supabase
      .from("puzzles")
      .insert(puzzlesToInsert)
      .select();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        puzzles: data,
        message: `Generated ${data.length} new puzzles`
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating puzzles:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate puzzles"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
