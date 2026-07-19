const OPENAI_URL = "https://api.openai.com/v1/responses";

export function requirePost(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed." });
    return false;
  }
  return true;
}

export function cleanText(value, maxLength = 24000) {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim().slice(0, maxLength);
}

function outputText(payload) {
  if (typeof payload.output_text === "string") return payload.output_text;
  return (payload.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text || "")
    .join("");
}

export async function createStructuredResponse({ instructions, input, schema, name }) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("The server is missing its OpenAI API key.");
    error.status = 500;
    throw error;
  }

  const apiResponse = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-5.6",
      store: false,
      reasoning: { effort: "medium" },
      instructions,
      input,
      text: {
        format: {
          type: "json_schema",
          name,
          strict: true,
          schema
        }
      }
    })
  });

  const payload = await apiResponse.json();
  if (!apiResponse.ok) {
    const error = new Error(payload?.error?.message || "OpenAI could not complete the request.");
    error.status = apiResponse.status;
    throw error;
  }

  const text = outputText(payload);
  if (!text) {
    const error = new Error("The model returned no usable analysis.");
    error.status = 502;
    throw error;
  }

  return { data: JSON.parse(text), responseId: payload.id };
}

export function sendApiError(response, error) {
  console.error(error);
  const status = Number.isInteger(error.status) ? error.status : 500;
  const safeMessage = status === 429
    ? "The AI service is busy or the account has reached its usage limit. Please try again shortly."
    : status >= 500
      ? "We could not complete the analysis. Please try again."
      : error.message;
  response.status(status).json({ error: safeMessage });
}
