// Minimal server-side OpenAI client. No SDK dependency — a single fetch call
// keeps this module self-contained. Never import this from client components.

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

export class AIError extends Error {}

export async function callOpenAIJson(params: {
  system: string;
  user: string;
}): Promise<Record<string, unknown>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AIError("OPENAI_API_KEY is not configured on the server.");
  }

  let res: Response;
  try {
    res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: params.system },
          { role: "user", content: params.user },
        ],
      }),
      // AI generation should not hang the request forever
      signal: AbortSignal.timeout(45_000),
    });
  } catch (err) {
    throw new AIError(
      `Could not reach OpenAI: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new AIError(`OpenAI request failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new AIError("OpenAI returned an empty response.");
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new AIError("OpenAI returned a response that wasn't valid JSON.");
  }
}
