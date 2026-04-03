import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface HintRequest {
  answer: string;
  category: string;
  displayName?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { answer, category, displayName }: HintRequest = await req.json();

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicKey || anthropicKey.trim() === "") {
      return new Response(
        JSON.stringify({
          error: "API key not configured",
          details: "ANTHROPIC_API_KEY environment variable is missing"
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Generate hint using Anthropic API
    const nameToUse = displayName || answer;
    const prompt = `Generate a clever, helpful hint for the word/phrase "${nameToUse}" (category: ${category}) in a Wordle-style guessing game.

Requirements:
- The hint should be 2-3 sentences
- DO NOT mention the answer directly
- Provide interesting facts or characteristics that help identify it
- Make it engaging and informative
- Be accurate and factual

Return ONLY the hint text, nothing else.`;

    const requestBody = {
      model: "claude-3-5-haiku-20241022",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    };

    const cleanKey = anthropicKey.trim();

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cleanKey}`,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    });

    if (!anthropicResponse.ok) {
      const errorBody = await anthropicResponse.text();
      return new Response(
        JSON.stringify({
          error: "Anthropic API error",
          status: anthropicResponse.status,
          details: errorBody
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const anthropicData = await anthropicResponse.json();
    const hint = anthropicData.content[0].text.trim();

    return new Response(
      JSON.stringify({ hint }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to generate hint",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
