import express from "express";
import groq from "../config/groq.js";
import { cleanJSON } from "../utils/cleanJSON.js";

const router = express.Router();

const HR_CATEGORIES: Record<string, string> = {
  leadership: "Leadership & Delegation",
  teamwork: "Teamwork & Collaboration",
  conflict: "Conflict Resolution",
  problem_solving: "Problem-Solving & Critical Thinking",
  communication: "Communication & Presentation",
  adaptability: "Adaptability & Flexibility",
  time_management: "Time Management & Prioritization",
  career: "Career Goals & Motivation",
  failure: "Handling Failure & Feedback",
  ethics: "Ethics & Integrity",
};

router.get("/categories", (_req, res) => {
  res.json({ categories: HR_CATEGORIES });
});

router.post("/questions", async (req, res) => {
  try {
    const { category = "general", count = 5 } = req.body;
    const categoryLabel = HR_CATEGORIES[category] || "General Behavioral";

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert HR interviewer. Generate ${count} behavioral interview questions for the category "${categoryLabel}". Return ONLY valid JSON array — no markdown. Schema:
[
  {
    "id": "q1",
    "question": "<question text>",
    "category": "${category}",
    "difficulty": "easy|medium|hard",
    "focusArea": "<what this question evaluates>",
    "starTip": "<tip on how to structure answer using STAR>"
  }
]
Make questions realistic, varied in difficulty, and relevant to ${categoryLabel}.`,
        },
        {
          role: "user",
          content: `Generate ${count} ${categoryLabel} behavioral interview questions for a tech professional.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const reply = response.choices[0].message.content;
    const questions = cleanJSON(reply);
    if (!Array.isArray(questions)) {
      return res.status(500).json({ error: "AI returned invalid format" });
    }

    res.json({ questions });
  } catch (error: any) {
    console.error("HR questions error:", error.message);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

router.post("/analyze-star", async (req, res) => {
  try {
    const { situation, task, action, result, question } = req.body;
    if (!situation || !task || !action || !result) {
      return res.status(400).json({ error: "All STAR fields required" });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert HR coach evaluating STAR method answers. Return ONLY valid JSON — no markdown. Schema:
{
  "overallScore": <1-10>,
  "situationScore": <1-10>,
  "taskScore": <1-10>,
  "actionScore": <1-10>,
  "resultScore": <1-10>,
  "feedback": "<detailed overall feedback>",
  "situationFeedback": "<feedback on situation>",
  "taskFeedback": "<feedback on task>",
  "actionFeedback": "<feedback on action>",
  "resultFeedback": "<feedback on result>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"],
  "improvedAnswer": "<rewritten STAR answer incorporating improvements>"
}
Be constructive. Score each STAR component on clarity, relevance, specificity, impact.`,
        },
        {
          role: "user",
          content: `Question: ${question || "Tell me about a time you handled a challenging situation."}\n\nSituation: ${situation}\nTask: ${task}\nAction: ${action}\nResult: ${result}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const reply = response.choices[0].message.content;
    const analysis = cleanJSON(reply);

    res.json({
      analysis: analysis || {
        overallScore: 5,
        situationScore: 5,
        taskScore: 5,
        actionScore: 5,
        resultScore: 5,
        feedback: "Analysis completed.",
        strengths: [],
        improvements: [],
      },
    });
  } catch (error: any) {
    console.error("STAR analysis error:", error.message);
    res.status(500).json({ error: "Failed to analyze STAR answer" });
  }
});

router.post("/feedback", async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "Answers array required" });
    }

    const transcript = answers
      .map((a: any, i: number) => `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer}`)
      .join("\n\n");

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert HR interview coach. Evaluate the following HR interview transcript. Return ONLY valid JSON — no markdown. Schema:
{
  "communicationScore": <1-10>,
  "confidenceScore": <1-10>,
  "starUsageScore": <1-10>,
  "relevanceScore": <1-10>,
  "overallScore": <1-10>,
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>", "<weakness3>"],
  "improvementPlan": "<2-3 sentence improvement plan>",
  "hiringProbability": "<Low|Medium|High>",
  "keyTakeaways": ["<takeaway1>", "<takeaway2>"]
}
Evaluate: communication clarity, confidence, STAR method usage, relevance of answers.`,
        },
        {
          role: "user",
          content: `HR Interview Transcript:\n${transcript}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const reply = response.choices[0].message.content;
    const feedback = cleanJSON(reply);

    res.json({
      feedback: feedback || {
        overallScore: 5,
        communicationScore: 5,
        confidenceScore: 5,
        starUsageScore: 5,
        relevanceScore: 5,
        strengths: [],
        weaknesses: [],
        hiringProbability: "Medium",
        keyTakeaways: [],
      },
    });
  } catch (error: any) {
    console.error("HR feedback error:", error.message);
    res.status(500).json({ error: "Failed to generate feedback" });
  }
});

router.post("/competency", async (req, res) => {
  try {
    const { role = "Software Engineer", competencies } = req.body;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert HR consultant. Generate a competency assessment for a ${role} position. Return ONLY valid JSON — no markdown. Schema:
{
  "competencies": [
    {
      "name": "<competency name>",
      "description": "<what this competency means>",
      "importance": "critical|important|good_to_have",
      "questions": ["<sample question>", "<sample question>"],
      "assessmentCriteria": ["<criterion1>", "<criterion2>"]
    }
  ],
  "overallSummary": "<brief summary of what makes a strong candidate>"
}
Include 8-10 key competencies for a ${role} role.`,
        },
        {
          role: "user",
          content: `Role: ${role}\n${competencies ? `Focus areas: ${competencies.join(", ")}` : "Cover all key competencies."}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 2048,
    });

    const reply = response.choices[0].message.content;
    const result = cleanJSON(reply);

    res.json({
      competencyFramework: result || { competencies: [], overallSummary: "" },
    });
  } catch (error: any) {
    console.error("Competency error:", error.message);
    res.status(500).json({ error: "Failed to generate competency framework" });
  }
});

export default router;
