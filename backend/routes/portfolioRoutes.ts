import express from "express";
import groq from "../config/groq.js";
import prisma from "../db/prisma.ts";
import { cleanJSON } from "../utils/cleanJSON.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { firebaseUid, url } = req.body;
    if (!firebaseUid || !url) return res.status(400).json({ error: "firebaseUid and URL required" });

    const user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are analyzing a developer portfolio website for interview preparation. URL: ${url}. Return ONLY valid JSON — no markdown. Schema:
{
  "performanceScore": <1-10>,
  "designScore": <1-10>,
  "contentScore": <1-10>,
  "seoScore": <1-10>,
  "accessibilityScore": <1-10>,
  "overallScore": <1-10>,
  "strengths": ["<strength1>", "<strength2>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "suggestions": ["<actionable suggestion1>", "<suggestion2>"],
  "projectQuality": "<assessment of projects shown>",
  "interviewQuestions": [
    { "question": "<question about their portfolio>", "focus": "<what it tests>" }
  ],
  "summary": "<overall assessment>"
}
Generate 3-5 interview questions based on portfolio content. Be constructive.`,
        },
        { role: "user", content: `Analyze portfolio at URL: ${url}` },
      ],
      temperature: 0.4,
      max_tokens: 2048,
    });

    const reply = response.choices[0].message.content;
    const analysis = cleanJSON(reply);
    if (!analysis) return res.status(500).json({ error: "AI returned invalid format" });

    const saved = await prisma.portfolioAnalysis.create({
      data: {
        userId: user.id,
        url,
        performanceScore: analysis.performanceScore,
        seoScore: analysis.seoScore,
        accessibilityScore: analysis.accessibilityScore,
        projects: JSON.stringify(analysis.projectQuality || ""),
        uiScore: analysis.designScore,
        suggestions: JSON.stringify(analysis.suggestions || []),
      },
    });

    res.json({ analysis: { ...analysis, id: saved.id } });
  } catch (error: any) {
    console.error("Portfolio analysis error:", error.message);
    res.status(500).json({ error: "Failed to analyze portfolio" });
  }
});

router.get("/analysis/:firebaseUid", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.params.firebaseUid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const analyses = await prisma.portfolioAnalysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    res.json({
      analyses: analyses.map((a) => ({
        ...a,
        projects: JSON.parse(a.projects || "{}"),
        suggestions: JSON.parse(a.suggestions || "[]"),
      })),
    });
  } catch (error: any) {
    console.error("Get portfolio analysis error:", error.message);
    res.status(500).json({ error: "Failed to get analyses" });
  }
});

export default router;
