const LABD_URL = "https://agent.thedevlabs.io/v1/api/chat";

function createLabdError(status) {
  const messages = {
    401: "The Labd API key is invalid or revoked.",
    402: "The Labd allowance has been used up.",
    403: "The Labd API is currently switched off.",
    429: "Labd is rate-limiting requests. Please wait a moment and try again.",
  };
  const error = new Error(messages[status] || "Labd could not analyze the resume.");
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
    throw new Error("Labd returned an invalid analysis format.");
  }
}

function normalizeAnalysis(data) {
  const score = Number(data.score);
  const presentSkills = Array.isArray(data.presentSkills) ? data.presentSkills : null;
  const missingSkills = Array.isArray(data.missingSkills) ? data.missingSkills : null;

  if (!Number.isFinite(score) || score < 0 || score > 100 || !presentSkills || !missingSkills) {
    throw new Error("Labd returned an incomplete analysis.");
  }

  return {
    score: Math.round(score),
    summary: typeof data.summary === "string" && data.summary.trim() ? data.summary.trim() : "Analysis complete.",
    presentSkills: presentSkills.map(String),
    missingSkills: missingSkills.map(String),
  };
}

async function analyzeWithLabd({ resumeText, jobDescription }) {
  const apiKey = process.env.LABD_API_KEY;

  if (!apiKey) {
    const error = new Error("LABD_API_KEY is not configured on the backend.");
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

  const response = await fetch(LABD_URL, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw createLabdError(response.status);
  }

  const payload = await response.json();
  if (!payload.message || typeof payload.message.content !== "string") {
    throw new Error("Labd returned no analysis content.");
  }

  return normalizeAnalysis(parseJsonContent(payload.message.content));
}

module.exports = { analyzeWithLabd };
