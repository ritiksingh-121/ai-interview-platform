const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Request failed");
  }

  if (!json.reply) {
    throw new Error("Empty response from server");
  }

  return json;
}

function stripFences(text) {
  return text.replace(/^```[\w]*\n?/gm, "").replace(/```$/gm, "").trim();
}

export function safeParseJSON(text) {
  const cleaned = stripFences(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export const sendInterviewMessage = async (data) => {
  const res = await fetch(`${BASE_URL}/interview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const getFeedback = async (data) => {
  const res = await fetch(`${BASE_URL}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const getCompletion = async (data) => {
  const json = await request(`${BASE_URL}/completion`, data);
  return { reply: stripFences(json.reply) };
};