export const cleanJSON = (text) => {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      score: 5,
      strengths: "Parsing failed",
      weaknesses: "Invalid AI format",
      improvedAnswer: "Try again"
    };
  }
};