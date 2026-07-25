import { Request, Response } from "express";
import prisma from "../db/prisma";

const SEVERITY_WEIGHTS: Record<string, number> = {
  LOW: 1, MEDIUM: 3, HIGH: 7, CRITICAL: 15,
};

const VIOLATION_SCORES: Record<string, number> = {
  PHONE_DETECTED: 10, MULTIPLE_FACES: 8, FULLSCREEN_EXIT: 4,
  DEVELOPER_TOOLS: 8, TAB_SWITCH: 5, MIC_DISCONNECTED: 6,
  CAMERA_DISCONNECTED: 7, IDENTITY_MISMATCH: 10, AUTOMATION_DETECTED: 10,
  CAMERA_BLOCKED: 6, SECOND_PERSON: 8, BOOK_DETECTED: 5,
  COPY_PASTE: 4, CONSOLE_OPEN: 7, DEBUGGER_PAUSE: 7,
  NO_FACE: 4, PERSON_LEFT: 6, EYE_GAZE_AWAY: 3,
  HEAD_POSE_DOWN: 3, CAMERA_FREEZE: 5, PRINT_SCREEN: 3,
  NETWORK_OFFLINE: 3, NETWORK_LATENCY: 1, LOW_LIGHT: 2,
  EARPHONE_DETECTED: 6, SMARTWATCH_DETECTED: 4,
  UNKNOWN_OBJECT: 3, HEAD_POSE_LEFT: 3, HEAD_POSE_RIGHT: 3,
  TABLET_DETECTED: 6, SECOND_VOICE: 6, BACKGROUND_SPEECH: 3,
};

function getAuthUserId(req: Request): string | null {
  return (req as any).userId || null;
}

export async function createProctoringSession(req: Request, res: Response) {
  try {
    const { interviewId, userId, strictMode = "MEDIUM", maxViolations = 10 } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }
    if (!["EASY", "MEDIUM", "STRICT"].includes(strictMode)) {
      return res.status(400).json({ error: "Invalid strictMode" });
    }
    if (typeof maxViolations !== "number" || maxViolations < 1 || maxViolations > 100) {
      return res.status(400).json({ error: "maxViolations must be 1-100" });
    }
    const user = await prisma.user.findUnique({ where: { firebaseUid: userId } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const session = await prisma.proctoringSession.create({
      data: {
        ...(interviewId ? { interviewId } : {}),
        userId: user.id,
        strictMode: strictMode as any,
        maxViolations,
        startTimestamp: Math.floor(Date.now() / 1000),
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
        violations: { orderBy: { timestamp: "desc" }, take: 100 },
        snapshots: { orderBy: { timestamp: "desc" }, take: 50 },
        candidatePhotos: { orderBy: { capturedAt: "desc" }, take: 1 },
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

export async function recordViolation(req: Request, res: Response) {
  try {
    const { sessionId, type, severity, message, metadata, screenshot, faceImage } = req.body;
    if (!sessionId || !type || !severity || !message) {
      return res.status(400).json({ error: "sessionId, type, severity, message required" });
    }
    const score = VIOLATION_SCORES[type] || SEVERITY_WEIGHTS[severity] || 1;
    const violation = await prisma.violation.create({
      data: {
        sessionId,
        type,
        severity,
        message,
        screenshot,
        faceImage,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
    await prisma.proctoringSession.update({
      where: { id: sessionId },
      data: {
        violationCount: { increment: 1 },
        ...(severity === "CRITICAL" && type === "PHONE_DETECTED" ? {} : {}),
      },
    });
    res.json({ violation, score });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function uploadCandidatePhoto(req: Request, res: Response) {
  try {
    const { sessionId, imageData } = req.body;
    if (!sessionId || !imageData) {
      return res.status(400).json({ error: "sessionId and imageData required" });
    }
    const session = await prisma.proctoringSession.findUnique({ where: { id: sessionId } });
    if (!session) return res.status(404).json({ error: "Session not found" });
    const photo = await prisma.candidatePhoto.create({
      data: { sessionId, imageData },
    });
    await prisma.proctoringSession.update({
      where: { id: sessionId },
      data: { faceCapture: imageData },
    });
    res.json({ photo });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getCandidatePhoto(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    const photo = await prisma.candidatePhoto.findFirst({
      where: { sessionId },
      orderBy: { capturedAt: "desc" },
    });
    if (!photo) return res.status(404).json({ error: "No photo found" });
    res.json({ photo });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function saveCameraSnapshot(req: Request, res: Response) {
  try {
    const { sessionId, imageData, trigger } = req.body;
    if (!sessionId || !imageData) {
      return res.status(400).json({ error: "sessionId and imageData required" });
    }
    const snapshot = await prisma.cameraSnapshot.create({
      data: { sessionId, imageData, trigger: trigger || "manual" },
    });
    res.json({ snapshot });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function saveObjectDetection(req: Request, res: Response) {
  try {
    const { sessionId, objectLabel, confidence, box } = req.body;
    if (!sessionId || !objectLabel) {
      return res.status(400).json({ error: "sessionId and objectLabel required" });
    }
    const detection = await prisma.objectDetection.create({
      data: {
        sessionId,
        objectLabel,
        confidence: confidence || 0,
        boxX: box?.x || null,
        boxY: box?.y || null,
        boxWidth: box?.width || null,
        boxHeight: box?.height || null,
      },
    });
    res.json({ detection });
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
        objectDetections: { orderBy: { timestamp: "asc" }, take: 50 },
        candidatePhotos: { orderBy: { capturedAt: "asc" } },
        interview: {
          include: { messages: { orderBy: { createdAt: "asc" } } },
        },
        user: { select: { name: true, email: true, firebaseUid: true } },
      },
    });
    if (!session) return res.status(404).json({ error: "Session not found" });

    const totalViolations = session.violations.length;
    const severityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    const typeCounts: Record<string, number> = {};
    let totalScore = 0;

    session.violations.forEach((v) => {
      severityCounts[v.severity as keyof typeof severityCounts]++;
      typeCounts[v.type] = (typeCounts[v.type] || 0) + 1;
      totalScore += VIOLATION_SCORES[v.type] || SEVERITY_WEIGHTS[v.severity] || 1;
    });

    const maxPossible = Math.max(session.maxViolations * 10, 1);
    const cheatingProbability = Math.min(100, Math.round((totalScore / maxPossible) * 100));
    const integrityScore = Math.max(0, 100 - cheatingProbability);

    const timeline = session.violations.map((v) => ({
      time: v.timestamp,
      type: v.type,
      severity: v.severity,
      message: v.message,
      score: VIOLATION_SCORES[v.type] || SEVERITY_WEIGHTS[v.severity] || 1,
    }));

    const objectTimeline = session.objectDetections.map((o) => ({
      time: o.timestamp,
      object: o.objectLabel,
      confidence: o.confidence,
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
        userFirebaseUid: session.user?.firebaseUid || null,
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
        totalScore,
        integrityScore,
        cheatingProbability,
        timeline,
        objectTimeline,
        recommendation,
        maxViolations: session.maxViolations,
        hasCandidatePhoto: session.candidatePhotos.length > 0,
        totalSnapshots: session.snapshots.length,
        totalDetections: session.objectDetections.length,
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
