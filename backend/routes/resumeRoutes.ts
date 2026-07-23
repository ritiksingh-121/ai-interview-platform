import express from "express";
import groq from "../config/groq.js";
import prisma from "../db/prisma.ts";
import { cleanJSON } from "../utils/cleanJSON.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { resumeText, jobDescription, userId } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Resume text and job description are required" });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert ATS resume analyst and career coach. Analyze the resume against the job description and return ONLY valid JSON — no markdown, no code fences. Use this exact schema:
{
  "atsScore": <0-100>,
  "matchScore": <0-100>,
  "skillsFound": [<strings>],
  "skillsMissing": [<strings>],
  "skillGap": [<strings>],
  "bulletRewrites": [{ "original": "...", "optimized": "..." }],
  "suggestions": [<strings>],
  "improvementPlan": "<string>",
  "predictedDifficulty": "EASY|MEDIUM|HARD|EXPERT",
  "interviewQuestions": [<5-10 personalized interview questions based on the JD and resume gaps>]
}`,
        },
        {
          role: "user",
          content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const reply = response.choices[0].message.content;
    const parsed = cleanJSON(reply);

    if (!parsed || !parsed.atsScore) {
      return res.status(500).json({ error: "AI returned invalid response format" });
    }

    if (userId) {
      const user = await prisma.user.findUnique({ where: { firebaseUid: userId } });
      if (user) {
        await prisma.jobDescription.create({
          data: {
            userId: user.id,
            content: jobDescription,
            extractedSkills: JSON.stringify(parsed.skillsFound || []),
            extractedRequirements: JSON.stringify(parsed.skillsMissing || []),
          },
        });

        if (resumeText) {
          const resume = await prisma.resume.create({
            data: {
              userId: user.id,
              fileName: "pasted-resume.txt",
              content: resumeText,
              parsedData: JSON.stringify(parsed),
            },
          });

          await prisma.resumeAnalysis.create({
            data: {
              resumeId: resume.id,
              atsScore: parsed.atsScore,
              matchScore: parsed.matchScore,
              skillsFound: JSON.stringify(parsed.skillsFound || []),
              skillsMissing: JSON.stringify(parsed.skillsMissing || []),
              suggestions: JSON.stringify(parsed.suggestions || []),
              bulletRewrites: JSON.stringify(parsed.bulletRewrites || []),
              skillGap: JSON.stringify(parsed.skillGap || []),
              improvementPlan: parsed.improvementPlan || null,
              interviewQuestions: JSON.stringify(parsed.interviewQuestions || []),
              predictedDifficulty: parsed.predictedDifficulty || null,
            },
          });
        }
      }
    }

    res.json(parsed);
  } catch (error: any) {
    console.error("Resume analysis error:", error.message);
    res.status(500).json({ error: "Analysis failed", details: error.message });
  }
});

export default router;
