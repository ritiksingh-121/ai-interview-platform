import express from "express";
import groq from "../config/groq.js";
import prisma from "../db/prisma.ts";
import { cleanJSON } from "../utils/cleanJSON.js";

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const { userId, duration = 30, focusArea, weaknesses } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const user = await prisma.user.findUnique({ where: { firebaseUid: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert career coach and learning path designer. Generate a ${duration}-day personalized learning roadmap for interview preparation. Return ONLY valid JSON — no markdown. Use this schema:
{
  "title": "<roadmap title>",
  "focusArea": "<primary focus area>",
  "items": [
    {
      "day": <1-${duration}>,
      "title": "<topic title>",
      "description": "<what to study/practice>",
      "topics": ["<topic1>", "<topic2>"],
      "resources": ["<resource suggestion>"]
    }
  ]
}

Generate exactly ${duration} items, one per day. Make each day focused and actionable. Include a mix of: concept learning, practice problems, system design, behavioral prep, and review days.`,
        },
        {
          role: "user",
          content: `Duration: ${duration} days\nFocus: ${focusArea || "General Interview Preparation"}\nWeaknesses to address: ${weaknesses?.join(", ") || "None specified"}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const reply = response.choices[0].message.content;
    const parsed = cleanJSON(reply);

    if (!parsed || !parsed.items) {
      return res.status(500).json({ error: "AI returned invalid format" });
    }

    const roadmap = await prisma.roadmap.create({
      data: {
        userId: user.id,
        duration,
        title: parsed.title || `${duration}-Day Roadmap`,
        focusArea: parsed.focusArea || focusArea,
        items: {
          create: parsed.items.map((item) => ({
            day: item.day,
            title: item.title,
            description: item.description || null,
            topics: JSON.stringify(item.topics || []),
            resources: JSON.stringify(item.resources || []),
          })),
        },
      },
      include: { items: { orderBy: { day: "asc" } } },
    });

    res.json({ roadmap });
  } catch (error: any) {
    console.error("Roadmap error:", error.message);
    res.status(500).json({ error: "Failed to generate roadmap" });
  }
});

router.get("/:firebaseUid", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.params.firebaseUid },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const roadmaps = await prisma.roadmap.findMany({
      where: { userId: user.id },
      include: { items: { orderBy: { day: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    res.json({ roadmaps });
  } catch (error) {
    console.error("Get roadmaps error:", error.message);
    res.status(500).json({ error: "Failed to get roadmaps" });
  }
});

router.patch("/item/:itemId", async (req, res) => {
  try {
    const { completed } = req.body;
    const item = await prisma.roadmapItem.update({
      where: { id: req.params.itemId },
      data: { completed: completed ?? false },
    });
    res.json({ item });
  } catch (error) {
    console.error("Update roadmap item error:", error.message);
    res.status(500).json({ error: "Failed to update item" });
  }
});

export default router;
