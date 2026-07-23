import groq from "../config/groq.js";
import prisma from "../db/prisma.ts";
import { cleanJSON } from "../utils/cleanJSON.js";

export const handleFeedback = async (req, res) => {
  try {
    const { question, answer } = req.body;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert interview feedback analyst. Evaluate the candidate's answer and return structured JSON only — no markdown, no explanation. Use this schema:
{
  "score": <0-10>,
  "strengths": [<strings>],
  "weaknesses": [<strings>],
  "improvedAnswer": "<string>",
  "feedback": "<short 1-2 line feedback>"
}`,
        },
        {
          role: "user",
          content: `Question: ${question}\n\nAnswer: ${answer}`,
        },
      ],
      temperature: 0.3,
    });

    const reply = response.choices[0].message.content;
    const parsed = cleanJSON(reply);

    res.json({ feedback: parsed?.feedback || reply, details: parsed });
  } catch (error) {
    console.log("FEEDBACK ERROR:", error.message);
    res.json({ feedback: "Unable to generate feedback" });
  }
};

export const handleInterviewFeedback = async (req, res) => {
  try {
    const { interviewId, userId, messages } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "No messages to analyze" });
    }

    const conversation = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert interview feedback analyst. Analyze the entire interview conversation and return structured JSON only — no markdown, no code fences. Use this exact schema:
{
  "overallScore": <0-100>,
  "technicalScore": <0-100>,
  "communicationScore": <0-100>,
  "confidenceScore": <0-100>,
  "problemSolvingScore": <0-100>,
  "dsaScore": <0-100>,
  "systemDesignScore": <0-100>,
  "codingScore": <0-100>,
  "projectsScore": <0-100>,
  "hrScore": <0-100>,
  "softSkillsScore": <0-100>,
  "hiringProbability": <0-100>,
  "strengths": [<strings>],
  "weaknesses": [<strings>],
  "improvementPlan": "<string>",
  "detailedFeedback": "<string>"
}`,
        },
        {
          role: "user",
          content: `INTERVIEW TRANSCRIPT:\n${conversation}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const reply = response.choices[0].message.content;
    const parsed = cleanJSON(reply);

    if (!parsed || !parsed.overallScore) {
      return res.status(500).json({ error: "Failed to generate valid feedback" });
    }

    if (interviewId && userId) {
      try {
        const user = await prisma.user.findUnique({ where: { firebaseUid: userId } });
        if (user) {
          await prisma.feedback.create({
            data: {
              interviewId,
              userId: user.id,
              overallScore: parsed.overallScore,
              technicalScore: parsed.technicalScore,
              communicationScore: parsed.communicationScore,
              confidenceScore: parsed.confidenceScore,
              problemSolvingScore: parsed.problemSolvingScore,
              dsaScore: parsed.dsaScore,
              systemDesignScore: parsed.systemDesignScore,
              codingScore: parsed.codingScore,
              projectsScore: parsed.projectsScore,
              hrScore: parsed.hrScore,
              softSkillsScore: parsed.softSkillsScore,
              hiringProbability: parsed.hiringProbability,
              strengths: JSON.stringify(parsed.strengths || []),
              weaknesses: JSON.stringify(parsed.weaknesses || []),
              improvementPlan: parsed.improvementPlan || null,
              detailedFeedback: parsed.detailedFeedback || null,
            },
          });
        }
      } catch (dbErr) {
        console.error("Failed to save feedback:", dbErr);
      }
    }

    res.json(parsed);
  } catch (error) {
    console.error("INTERVIEW FEEDBACK ERROR:", error.message);
    res.status(500).json({ error: "Failed to generate interview feedback" });
  }
};
