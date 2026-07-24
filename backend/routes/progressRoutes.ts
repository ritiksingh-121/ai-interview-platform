import express from "express";
import prisma from "../db/prisma.ts";

const router = express.Router();

router.get("/:firebaseUid", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.params.firebaseUid },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const progress = await prisma.progress.findMany({
      where: { userId: user.id, year: now.getFullYear() },
      orderBy: [{ week: "desc" }, { month: "desc" }],
      take: 12,
    });

    const achievements = await prisma.achievement.findMany({
      where: { userId: user.id },
      orderBy: { unlockedAt: "desc" },
    });

    const totalInterviews = await prisma.interview.count({
      where: { userId: user.id },
    });

    const totalChallenges = await prisma.dailyChallenge.count({
      where: { userId: user.id, completed: true },
    });

    const totalRoadmaps = await prisma.roadmap.count({
      where: { userId: user.id },
    });

    res.json({
      progress,
      achievements,
      stats: { totalInterviews, totalChallenges, totalRoadmaps },
    });
  } catch (error: any) {
    console.error("Get progress error:", error.message);
    res.status(500).json({ error: "Failed to get progress" });
  }
});

export default router;
