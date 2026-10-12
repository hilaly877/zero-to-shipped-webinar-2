const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function createOpenAIError(status) {
  const messages = {
    401: "The OpenAI API key is invalid or revoked.",
    402: "The OpenAI account requires billing or has insufficient credits.",
    403: "The OpenAI API request was not permitted.",
    429: "OpenAI is rate-limiting requests. Please wait a moment and try again.",
  };
  const error = new Error(messages[status] || "OpenAI could not analyze the resume.");
  error.statusCode = status === 429 ? 429 : status >= 400 && status < 500 ? 502 : 502;
  return error;
}

function parseJsonContent(content) {
  const jsonContent = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    return JSON.parse(jsonContent);
  } catch {
    throw new Error("OpenAI returned an invalid analysis format.");
  }
}

function normalizeAnalysis(data) {
  const score = Number(data.score);
  const presentSkills = Array.isArray(data.presentSkills) ? data.presentSkills : null;
  const missingSkills = Array.isArray(data.missingSkills) ? data.missingSkills : null;

  if (!Number.isFinite(score) || score < 0 || score > 100 || !presentSkills || !missingSkills) {
    throw new Error("OpenAI returned an incomplete analysis.");
  }

  return {
    score: Math.round(score),
    summary: typeof data.summary === "string" && data.summary.trim() ? data.summary.trim() : "Analysis complete.",
    presentSkills: presentSkills.map(String),
    missingSkills: missingSkills.map(String),
  };
}

async function analyzeWithOpenAI({ resumeText, jobDescription }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const error = new Error("OPENAI_API_KEY is not configured on the backend.");
    error.statusCode = 503;
    throw error;
  }

  const prompt = [
    "Compare this resume against the job description.",
    "Return JSON only, with exactly these keys:",
    '{"score": number, "summary": string, "presentSkills": string[], "missingSkills": string[]}.',
    "Score the candidate from 0 to 100 based on evidence in the resume, not on skills mentioned only in the job description.",
    "",
    "RESUME:",
    resumeText,
    "",
    "JOB DESCRIPTION:",
    jobDescription,
  ].join("\n");

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a resume analysis assistant. Follow the requested JSON output format exactly.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw createOpenAIError(response.status);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("OpenAI returned no analysis content.");
  }

  return normalizeAnalysis(parseJsonContent(content));
}

module.exports = { analyzeWithOpenAI };
