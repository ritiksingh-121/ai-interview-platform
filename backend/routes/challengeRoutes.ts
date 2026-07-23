import express from "express";
import groq from "../config/groq.js";
import prisma from "../db/prisma.ts";
import { cleanJSON } from "../utils/cleanJSON.js";

const router = express.Router();

router.get("/today/:firebaseUid", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.params.firebaseUid },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let challenge = await prisma.dailyChallenge.findFirst({
      where: {
        userId: user.id,
        date: { gte: today, lt: tomorrow },
      },
      include: { submissions: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (challenge) {
      return res.json({ challenge, isNew: false });
    }

    const types: string[] = ["INTERVIEW", "CODING", "HR", "CS_FUNDAMENTALS"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const typeLabels: Record<string, string> = {
      INTERVIEW: "technical interview question",
      CODING: "coding challenge",
      HR: "HR/behavioral question",
      CS_FUNDAMENTALS: "computer science fundamentals question",
    };

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You generate daily ${typeLabels[randomType]}s for interview prep. Return ONLY valid JSON — no markdown. Schema:
{
  "title": "<short challenge title>",
  "description": "<detailed question/challenge description>"
}
Make it concise but meaningful. Difficulty: medium.`,
        },
        {
          role: "user",
          content: `Generate a ${typeLabels[randomType]} for today's daily challenge. The user is preparing for tech interviews.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = response.choices[0].message.content;
    const parsed = cleanJSON(reply);

    if (!parsed || !parsed.title) {
      return res.status(500).json({ error: "AI returned invalid format" });
    }

    const lastChallenge = await prisma.dailyChallenge.findFirst({
      where: { userId: user.id, completed: true },
      orderBy: { date: "desc" },
    });

    let streak = 1;
    if (lastChallenge) {
      const lastDate = new Date(lastChallenge.date);
      lastDate.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate.getTime() === yesterday.getTime()) {
        streak = (lastChallenge.streak || 0) + 1;
      } else if (lastDate.getTime() < yesterday.getTime()) {
        streak = 1;
      } else {
        streak = lastChallenge.streak || 1;
      }
    }

    challenge = await prisma.dailyChallenge.create({
      data: {
        userId: user.id,
        date: today,
        type: randomType as any,
        title: parsed.title,
        description: parsed.description || "",
        streak,
      },
      include: { submissions: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    res.json({ challenge, isNew: true });
  } catch (error: any) {
    console.error("Daily challenge error:", error.message);
    res.status(500).json({ error: "Failed to get daily challenge" });
  }
});

router.post("/submit", async (req, res) => {
  try {
    const { challengeId, firebaseUid, answer } = req.body;
    if (!challengeId || !firebaseUid || !answer) {
      return res.status(400).json({ error: "challengeId, firebaseUid, and answer required" });
    }

    const user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const challenge = await prisma.dailyChallenge.findUnique({ where: { id: challengeId } });
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });

    const typeLabels: Record<string, string> = {
      INTERVIEW: "technical interview",
      CODING: "coding",
      HR: "HR/behavioral",
      CS_FUNDAMENTALS: "CS fundamentals",
    };

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert interview coach evaluating a ${typeLabels[challenge.type] || "challenge"} answer. Return ONLY valid JSON — no markdown. Schema:
{
  "score": <1-10>,
  "feedback": "<detailed constructive feedback>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"]
}
Be honest but constructive. Score based on: correctness, clarity, depth, structure.`,
        },
        {
          role: "user",
          content: `Challenge: ${challenge.title}\n${challenge.description || ""}\n\nUser's answer:\n${answer}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const reply = response.choices[0].message.content;
    const parsed = cleanJSON(reply);
    const score = parsed?.score || 5;
    const feedback = parsed?.feedback || "Evaluation completed.";

    const submission = await prisma.challengeSubmission.create({
      data: {
        challengeId,
        userId: user.id,
        answer,
        score,
        feedback: JSON.stringify(parsed),
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = challenge.streak || 1;
    if (!challenge.completed) {
      const lastCompleted = await prisma.dailyChallenge.findFirst({
        where: { userId: user.id, id: { not: challengeId }, completed: true },
        orderBy: { date: "desc" },
      });

      if (lastCompleted) {
        const lastDate = new Date(lastCompleted.date);
        lastDate.setHours(0, 0, 0, 0);
        if (lastDate.getTime() === yesterday.getTime()) {
          newStreak = (lastCompleted.streak || 0) + 1;
        } else if (lastDate.getTime() < yesterday.getTime()) {
          newStreak = 1;
        } else {
          newStreak = lastCompleted.streak || 1;
        }
      }

      await prisma.dailyChallenge.update({
        where: { id: challengeId },
        data: { completed: true, score, streak: newStreak },
      });
    }

    res.json({
      submission,
      score,
      feedback,
      strengths: parsed?.strengths || [],
      improvements: parsed?.improvements || [],
      streak: newStreak,
    });
  } catch (error: any) {
    console.error("Submit challenge error:", error.message);
    res.status(500).json({ error: "Failed to submit challenge" });
  }
});

router.get("/streak/:firebaseUid", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.params.firebaseUid },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const lastChallenge = await prisma.dailyChallenge.findFirst({
      where: { userId: user.id, completed: true },
      orderBy: { date: "desc" },
    });

    const totalCompleted = await prisma.dailyChallenge.count({
      where: { userId: user.id, completed: true },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayChallenge = await prisma.dailyChallenge.findFirst({
      where: { userId: user.id, date: { gte: today }, completed: true },
    });

    res.json({
      currentStreak: lastChallenge?.streak || 0,
      totalCompleted,
      completedToday: !!todayChallenge,
      lastChallengeDate: lastChallenge?.date || null,
    });
  } catch (error: any) {
    console.error("Streak error:", error.message);
    res.status(500).json({ error: "Failed to get streak" });
  }
});

router.get("/history/:firebaseUid", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.params.firebaseUid },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const challenges = await prisma.dailyChallenge.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 30,
      include: { submissions: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    res.json({ challenges });
  } catch (error: any) {
    console.error("Challenge history error:", error.message);
    res.status(500).json({ error: "Failed to get challenge history" });
  }
});

export default router;
