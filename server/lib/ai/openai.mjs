import { sanitize } from "./fallbacks.mjs";

const responsesUrl = "https://api.openai.com/v1/responses";

export async function generateStructured({ instructions, input, schema, fallback }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      source: "server-fallback",
      reason: "OPENAI_API_KEY is not configured",
      data: fallback(),
    };
  }

  try {
    const response = await fetch(responsesUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        instructions,
        input: [
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: schema.name,
            strict: true,
            schema: schema.schema,
          },
        },
      }),
    });

    if (!response.ok) {
      return {
        source: "server-fallback",
        reason: `OpenAI request failed with ${response.status}`,
        data: fallback(),
      };
    }

    const payload = await response.json();
    const text = extractOutputText(payload);

    if (!text) {
      return {
        source: "server-fallback",
        reason: "OpenAI response did not include output text",
        data: fallback(),
      };
    }

    return {
      source: "openai",
      data: sanitize(JSON.parse(text)),
    };
  } catch (error) {
    return {
      source: "server-fallback",
      reason: error instanceof Error ? error.message : "Unknown OpenAI error",
      data: fallback(),
    };
  }
}

function extractOutputText(payload) {
  if (typeof payload.output_text === "string") {
    return payload.output_text;
  }

  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return "";
}

