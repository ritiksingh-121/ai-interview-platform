import { Request, Response } from "express";
import prisma from "../db/prisma";

export async function createProctoringSession(req: Request, res: Response) {
  try {
    const { interviewId, userId, strictMode = "MEDIUM", maxViolations = 10 } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }
    const user = await prisma.user.findUnique({ where: { firebaseUid: userId } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const session = await prisma.proctoringSession.create({
      data: {
        ...(interviewId ? { interviewId } : {}),
        userId: user.id,
        strictMode,
        maxViolations,
      },
    });
    res.json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getProctoringSession(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const session = await prisma.proctoringSession.findUnique({
      where: { id },
      include: {
        violations: { orderBy: { timestamp: "desc" } },
        snapshots: { orderBy: { timestamp: "desc" }, take: 50 },
      },
    });
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSessionByInterview(req: Request, res: Response) {
  try {
    const { interviewId } = req.params;
    const session = await prisma.proctoringSession.findFirst({
      where: { interviewId },
      include: {
        violations: { orderBy: { timestamp: "desc" } },
        snapshots: { orderBy: { timestamp: "desc" }, take: 50 },
      },
    });
    res.json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getViolations(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    const violations = await prisma.violation.findMany({
      where: { sessionId },
      orderBy: { timestamp: "desc" },
    });
    res.json({ violations });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAllSessions(req: Request, res: Response) {
  try {
    const sessions = await prisma.proctoringSession.findMany({
      include: {
        violations: { orderBy: { timestamp: "desc" }, take: 10 },
        interview: { select: { role: true, company: true, id: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ sessions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSessionReport(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const session = await prisma.proctoringSession.findUnique({
      where: { id },
      include: {
        violations: { orderBy: { timestamp: "asc" } },
        snapshots: { orderBy: { timestamp: "asc" } },
        interview: {
          include: { messages: { orderBy: { createdAt: "asc" } } },
        },
        user: { select: { name: true, email: true } },
      },
    });
    if (!session) return res.status(404).json({ error: "Session not found" });

    const totalViolations = session.violations.length;
    const severityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    const typeCounts: Record<string, number> = {};
    session.violations.forEach((v) => {
      severityCounts[v.severity as keyof typeof severityCounts]++;
      typeCounts[v.type] = (typeCounts[v.type] || 0) + 1;
    });

    const severityWeight = { LOW: 1, MEDIUM: 3, HIGH: 7, CRITICAL: 15 };
    const weightedScore = session.violations.reduce(
      (sum, v) => sum + (severityWeight[v.severity as keyof typeof severityWeight] || 0),
      0
    );
    const maxPossible = session.maxViolations * 15;
    const cheatingProbability = Math.min(100, Math.round((weightedScore / Math.max(maxPossible, 1)) * 100));
    const integrityScore = Math.max(0, 100 - cheatingProbability);

    const timeline = session.violations.map((v) => ({
      time: v.timestamp,
      type: v.type,
      severity: v.severity,
      message: v.message,
    }));

    let recommendation: string;
    if (integrityScore >= 80) recommendation = "PASS";
    else if (integrityScore >= 50) recommendation = "REVIEW";
    else recommendation = "REJECT";

    res.json({
      report: {
        sessionId: session.id,
        userId: session.userId,
        userName: session.user?.name || "Unknown",
        userEmail: session.user?.email || "Unknown",
        role: session.interview?.role || "N/A",
        company: session.interview?.company || "N/A",
        duration: session.interview?.duration || 0,
        strictMode: session.strictMode,
        status: session.status,
        terminatedAt: session.terminatedAt,
        terminationReason: session.terminationReason,
        totalViolations,
        severityCounts,
        typeCounts,
        integrityScore,
        cheatingProbability,
        timeline,
        recommendation,
        maxViolations: session.maxViolations,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateStrictMode(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { strictMode, maxViolations } = req.body;
    const session = await prisma.proctoringSession.update({
      where: { id },
      data: {
        ...(strictMode && { strictMode }),
        ...(maxViolations && { maxViolations }),
      },
    });
    res.json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function dismissViolation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const violation = await prisma.violation.update({
      where: { id },
      data: { dismissed: true },
    });
    res.json({ violation });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
