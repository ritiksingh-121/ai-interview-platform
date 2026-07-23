import express from "express";
import groq from "../config/groq.js";
import prisma from "../db/prisma.ts";
import { cleanJSON } from "../utils/cleanJSON.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { firebaseUid, username } = req.body;
    if (!firebaseUid || !username) return res.status(400).json({ error: "firebaseUid and username required" });

    const user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are analyzing a GitHub profile for interview preparation. Based on the username "${username}", estimate their likely tech stack and project experience. Return ONLY valid JSON — no markdown. Schema:
{
  "profileScore": <1-10>,
  "estimatedLanguages": ["<language1>", "<language2>"],
  "estimatedRepos": "<count estimate>",
  "strengths": ["<likely strength based on username>", "<strength2>"],
  "weaknesses": ["<area to improve>"],
  "projectQualityScore": <1-10>,
  "interviewQuestions": [
    { "question": "<question about their likely projects>", "focus": "<what it tests>" }
  ],
  "suggestions": ["<suggestion1>", "<suggestion2>"],
  "summary": "<overall assessment>"
}
Generate 5-7 interview questions based on the assumed tech stack. Be realistic about what you can infer.`,
        },
        { role: "user", content: `Analyze GitHub profile for username: ${username}` },
      ],
      temperature: 0.4,
      max_tokens: 2048,
    });

    const reply = response.choices[0].message.content;
    const analysis = cleanJSON(reply);
    if (!analysis) return res.status(500).json({ error: "AI returned invalid format" });

    const saved = await prisma.githubAnalysis.create({
      data: {
        userId: user.id,
        username,
        repositories: JSON.stringify(analysis.estimatedRepos || ""),
        languages: JSON.stringify(analysis.estimatedLanguages || []),
        projectQuality: analysis.projectQualityScore?.toString() || "",
        interviewQuestions: JSON.stringify(analysis.interviewQuestions || []),
        score: analysis.profileScore,
        suggestions: JSON.stringify(analysis.suggestions || []),
      },
    });

    res.json({ analysis: { ...analysis, id: saved.id } });
  } catch (error: any) {
    console.error("GitHub analysis error:", error.message);
    res.status(500).json({ error: "Failed to analyze GitHub profile" });
  }
});

router.get("/analysis/:firebaseUid", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.params.firebaseUid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const analyses = await prisma.githubAnalysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    res.json({
      analyses: analyses.map((a) => ({
        ...a,
        repositories: JSON.parse(a.repositories || "{}"),
        languages: JSON.parse(a.languages || "[]"),
        interviewQuestions: JSON.parse(a.interviewQuestions || "[]"),
        suggestions: JSON.parse(a.suggestions || "[]"),
      })),
    });
  } catch (error: any) {
    console.error("Get GitHub analysis error:", error.message);
    res.status(500).json({ error: "Failed to get analyses" });
  }
});

export default router;
