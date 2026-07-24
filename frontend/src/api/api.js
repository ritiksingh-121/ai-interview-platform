const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  if (!json.reply) throw new Error("Empty response from server");
  return json;
}

function stripFences(text) {
  return text.replace(/^```[\w]*\n?/gm, "").replace(/```$/gm, "").trim();
}

export function safeParseJSON(text) {
  const cleaned = stripFences(text);
  try { return JSON.parse(cleaned); } catch { return null; }
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

export const syncUser = async (user) => {
  try {
    const res = await fetch(`${BASE_URL}/users/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebaseUid: user.uid,
        email: user.email,
        name: user.displayName,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error("User sync error:", err);
    return null;
  }
};

export const getUserData = async (firebaseUid) => {
  try {
    const res = await fetch(`${BASE_URL}/users/${firebaseUid}`);
    return await res.json();
  } catch (err) {
    console.error("Get user error:", err);
    return null;
  }
};

export const getInterviewFeedback = async (data) => {
  try {
    const res = await fetch(`${BASE_URL}/feedback/interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error("Interview feedback error:", err);
    return null;
  }
};

export const saveInterview = async (data) => {
  try {
    const res = await fetch(`${BASE_URL}/interview/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error("Save interview error:", err);
    return null;
  }
};

export const getInterviewHistory = async (firebaseUid) => {
  try {
    const res = await fetch(`${BASE_URL}/interview/history/${firebaseUid}`);
    return await res.json();
  } catch (err) {
    console.error("Get history error:", err);
    return null;
  }
};

export const getInterviewAnalytics = async (firebaseUid) => {
  try {
    const res = await fetch(`${BASE_URL}/interview/analytics/${firebaseUid}`);
    return await res.json();
  } catch (err) {
    console.error("Get analytics error:", err);
    return null;
  }
};

export const generateRoadmap = async (data) => {
  try {
    const res = await fetch(`${BASE_URL}/roadmap/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error("Roadmap error:", err);
    return null;
  }
};

export const getRoadmaps = async (firebaseUid) => {
  try {
    const res = await fetch(`${BASE_URL}/roadmap/${firebaseUid}`);
    return await res.json();
  } catch (err) {
    console.error("Get roadmaps error:", err);
    return null;
  }
};

export const updateRoadmapItem = async (itemId, completed) => {
  try {
    const res = await fetch(`${BASE_URL}/roadmap/item/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    return await res.json();
  } catch (err) {
    console.error("Update roadmap item error:", err);
    return null;
  }
};

export const getTodayChallenge = async (firebaseUid) => {
  try {
    const res = await fetch(`${BASE_URL}/challenge/today/${firebaseUid}`);
    return await res.json();
  } catch (err) {
    console.error("Get challenge error:", err);
    return null;
  }
};

export const submitChallenge = async (data) => {
  try {
    const res = await fetch(`${BASE_URL}/challenge/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error("Submit challenge error:", err);
    return null;
  }
};

export const getChallengeStreak = async (firebaseUid) => {
  try {
    const res = await fetch(`${BASE_URL}/challenge/streak/${firebaseUid}`);
    return await res.json();
  } catch (err) {
    console.error("Get streak error:", err);
    return null;
  }
};

export const getChallengeHistory = async (firebaseUid) => {
  try {
    const res = await fetch(`${BASE_URL}/challenge/history/${firebaseUid}`);
    return await res.json();
  } catch (err) {
    console.error("Get challenge history error:", err);
    return null;
  }
};

export const getUserProgress = async (firebaseUid) => {
  try {
    const res = await fetch(`${BASE_URL}/progress/${firebaseUid}`);
    return await res.json();
  } catch (err) {
    console.error("Get progress error:", err);
    return null;
  }
};

export const analyzeResume = async (data) => {
  try {
    const res = await fetch(`${BASE_URL}/resume/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error("Resume analysis error:", err);
    return null;
  }
};
