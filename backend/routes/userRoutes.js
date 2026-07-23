import express from "express";
import prisma from "../db/prisma.ts";

const router = express.Router();

router.post("/sync", async (req, res) => {
  try {
    const { firebaseUid, email, name } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: "firebaseUid and email are required" });
    }

    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: { email, name: name || undefined },
      create: { firebaseUid, email, name: name || null },
    });

    res.json({ user });
  } catch (error) {
    console.error("User sync error:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
});

router.get("/:firebaseUid", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.params.firebaseUid },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

export default router;
