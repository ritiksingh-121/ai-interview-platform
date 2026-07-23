import express from "express";
import groq from "../config/groq.js";
import { cleanJSON } from "../utils/cleanJSON.js";

const router = express.Router();

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "csharp",
  "go",
  "rust",
  "swift",
  "kotlin",
  "ruby",
  "php",
];

router.get("/languages", (_req, res) => {
  res.json({ languages: LANGUAGES });
});

router.post("/analyze", async (req, res) => {
  try {
    const { code, language = "javascript", context } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ error: "Code is required" });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert code reviewer. Analyze the following ${language} code. Return ONLY valid JSON — no markdown. Schema:
{
  "overallScore": <1-10>,
  "qualityScore": <1-10>,
  "readabilityScore": <1-10>,
  "performanceScore": <1-10>,
  "securityScore": <1-10>,
  "maintainabilityScore": <1-10>,
  "timeComplexity": "<Big O notation>",
  "spaceComplexity": "<Big O notation>",
  "summary": "<2-3 sentence overall assessment>",
  "issues": [
    {
      "type": "error|warning|suggestion",
      "line": <line number or null>,
      "severity": "critical|major|minor",
      "message": "<description>",
      "suggestion": "<how to fix>"
    }
  ],
  "bestPractices": ["<practice1>", "<practice2>"],
  "securityConcerns": ["<concern1>"] or [],
  "optimizedCode": "<improved version of the code with key fixes>",
  "keyTakeaways": ["<takeaway1>", "<takeaway2>"]
}
Be thorough but constructive. Focus on: logic errors, performance bottlenecks, security vulnerabilities, code style, best practices, and potential bugs.`,
        },
        {
          role: "user",
          content: `Language: ${language}\n${context ? `Context: ${context}\n` : ""}Code:\n\`\`\`${language}\n${code}\n\`\`\``,
        },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    });

    const reply = response.choices[0].message.content;
    const analysis = cleanJSON(reply);

    if (!analysis || !analysis.overallScore) {
      return res.status(500).json({ error: "AI returned invalid format" });
    }

    res.json({ analysis });
  } catch (error: any) {
    console.error("Code review error:", error.message);
    res.status(500).json({ error: "Failed to analyze code" });
  }
});

router.post("/compare", async (req, res) => {
  try {
    const { code1, code2, language = "javascript" } = req.body;
    if (!code1 || !code2) {
      return res.status(400).json({ error: "Both code snippets required" });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert code reviewer comparing two ${language} implementations. Return ONLY valid JSON — no markdown. Schema:
{
  "betterImplementation": "first|second",
  "differences": ["<diff1>", "<diff2>"],
  "firstScore": <1-10>,
  "secondScore": <1-10>,
  "recommendation": "<which is better and why>"
}`,
        },
        {
          role: "user",
          content: `Language: ${language}\n\nFirst implementation:\n\`\`\`${language}\n${code1}\n\`\`\`\n\nSecond implementation:\n\`\`\`${language}\n${code2}\n\`\`\``,
        },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    });

    const reply = response.choices[0].message.content;
    const comparison = cleanJSON(reply);

    res.json({ comparison: comparison || { betterImplementation: "first", differences: [], recommendation: "Comparison completed." } });
  } catch (error: any) {
    console.error("Code comparison error:", error.message);
    res.status(500).json({ error: "Failed to compare code" });
  }
});

export default router;
