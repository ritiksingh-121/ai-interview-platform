import express from "express";
import { handleInterview } from "../controllers/interviewController.js";
import prisma from "../db/prisma.ts";

const router = express.Router();

router.post("/", handleInterview);

router.post("/save", async (req, res) => {
  try {
    const { userId, role, company, personality, messages, duration } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const user = await prisma.user.findUnique({ where: { firebaseUid: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const interview = await prisma.interview.create({
      data: {
        userId: user.id,
        role: role || "FRONTEND",
        company: company || "GENERAL",
        personality: personality || "STRICT",
        status: "COMPLETED",
        duration: duration || 0,
        messages: {
          create: messages?.map((m) => ({
            role: m.role,
            content: m.content,
          })) || [],
        },
      },
      include: { messages: true },
    });

    res.json({ interview });
  } catch (error) {
    console.error("Save interview error:", error.message);
    res.status(500).json({ error: "Failed to save interview" });
  }
});

router.get("/history/:firebaseUid", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.params.firebaseUid },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const interviews = await prisma.interview.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        feedback: true,
        _count: { select: { messages: true } },
      },
    });

    res.json({ interviews });
  } catch (error) {
    console.error("Get history error:", error.message);
    res.status(500).json({ error: "Failed to get history" });
  }
});

router.get("/analytics/:firebaseUid", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.params.firebaseUid },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const interviews = await prisma.interview.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      include: { feedback: true },
      orderBy: { createdAt: "desc" },
    });

    const totalInterviews = interviews.length;
    const averageScore = interviews.reduce((acc, i) => {
      const fb = i.feedback?.[0];
      return acc + (fb?.overallScore || 0);
    }, 0) / (totalInterviews || 1);

    const scoresByRole = {};
    interviews.forEach((i) => {
      const fb = i.feedback?.[0];
      if (fb) {
        if (!scoresByRole[i.role]) scoresByRole[i.role] = { total: 0, count: 0 };
        scoresByRole[i.role].total += fb.overallScore;
        scoresByRole[i.role].count += 1;
      }
    });

    const recentTrend = interviews.slice(0, 10).reverse().map((i) => ({
      date: i.createdAt,
      score: i.feedback?.[0]?.overallScore || null,
    }));

    res.json({
      totalInterviews,
      averageScore: Math.round(averageScore),
      scoresByRole: Object.entries(scoresByRole).map(([role, data]) => ({
        role,
        average: Math.round(data.total / data.count),
        count: data.count,
      })),
      recentTrend,
    });
  } catch (error) {
    console.error("Analytics error:", error.message);
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

export default router;
