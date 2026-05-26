const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const sendInterviewMessage = async (data) => {
  const res = await fetch(`${BASE_URL}/interview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const getFeedback = async (data) => {
  const res = await fetch(`${BASE_URL}/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};