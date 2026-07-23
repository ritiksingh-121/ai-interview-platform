import express from "express";
import groq from "../config/groq.js";
import prisma from "../db/prisma.ts";
import { cleanJSON } from "../utils/cleanJSON.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { email, name, company } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    let recruiter = await prisma.recruiter.findUnique({ where: { email } });
    if (!recruiter) {
      recruiter = await prisma.recruiter.create({ data: { email, name, company } });
    } else {
      recruiter = await prisma.recruiter.update({ where: { email }, data: { name, company } });
    }

    res.json({ recruiter });
  } catch (error: any) {
    console.error("Recruiter create error:", error.message);
    res.status(500).json({ error: "Failed to create recruiter" });
  }
});

router.post("/invite", async (req, res) => {
  try {
    const { recruiterEmail, candidateEmail, candidateName, message } = req.body;
    if (!recruiterEmail || !candidateEmail) {
      return res.status(400).json({ error: "Recruiter and candidate emails required" });
    }

    const recruiter = await prisma.recruiter.findUnique({ where: { email: recruiterEmail } });
    if (!recruiter) return res.status(404).json({ error: "Recruiter not found. Create profile first." });

    const invite = await prisma.interviewInvite.create({
      data: { recruiterId: recruiter.id, candidateEmail, candidateName, message },
    });

    res.json({ invite });
  } catch (error: any) {
    console.error("Invite error:", error.message);
    res.status(500).json({ error: "Failed to send invite" });
  }
});

router.get("/invites/:email", async (req, res) => {
  try {
    const invites = await prisma.interviewInvite.findMany({
      where: { candidateEmail: req.params.email },
      include: { recruiter: true, interview: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ invites });
  } catch (error: any) {
    console.error("Get invites error:", error.message);
    res.status(500).json({ error: "Failed to get invites" });
  }
});

router.patch("/invite/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const invite = await prisma.interviewInvite.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ invite });
  } catch (error: any) {
    console.error("Update invite error:", error.message);
    res.status(500).json({ error: "Failed to update invite" });
  }
});

router.get("/dashboard/:email", async (req, res) => {
  try {
    const recruiter = await prisma.recruiter.findUnique({ where: { email: req.params.email } });
    if (!recruiter) return res.status(404).json({ error: "Recruiter not found" });

    const invites = await prisma.interviewInvite.findMany({
      where: { recruiterId: recruiter.id },
      include: { interview: true },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: invites.length,
      pending: invites.filter((i) => i.status === "PENDING").length,
      accepted: invites.filter((i) => i.status === "ACCEPTED").length,
      completed: invites.filter((i) => i.status === "COMPLETED").length,
      declined: invites.filter((i) => i.status === "DECLINED").length,
    };

    res.json({ recruiter, invites, stats });
  } catch (error: any) {
    console.error("Recruiter dashboard error:", error.message);
    res.status(500).json({ error: "Failed to get dashboard" });
  }
});

export default router;
