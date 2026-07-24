import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import prisma from "../db/prisma";

let io: Server;

export function initSocket(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:4173", "https://ai-interview-platform-dusky.vercel.app", process.env.FRONTEND_URL].filter(Boolean),
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on("join-session", (sessionId: string) => {
      socket.join(`session:${sessionId}`);
      console.log(`Socket ${socket.id} joined session:${sessionId}`);
    });

    socket.on("leave-session", (sessionId: string) => {
      socket.leave(`session:${sessionId}`);
    });

    socket.on("violation", async (data: {
      sessionId: string;
      type: string;
      severity: string;
      message: string;
      metadata?: any;
    }) => {
      try {
        const violation = await prisma.violation.create({
          data: {
            sessionId: data.sessionId,
            type: data.type as any,
            severity: data.severity as any,
            message: data.message,
            metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          },
        });

        await prisma.proctoringSession.update({
          where: { id: data.sessionId },
          data: { violationCount: { increment: 1 } },
        });

        io.to(`session:${data.sessionId}`).emit("new-violation", violation);
        io.to(`admin`).emit("admin-violation", {
          ...violation,
          sessionId: data.sessionId,
        });
      } catch (err) {
        console.error("Violation save error:", err);
      }
    });

    socket.on("snapshot", async (data: {
      sessionId: string;
      type: string;
      imageUrl?: string;
      data?: string;
    }) => {
      try {
        await prisma.proctoringSnapshot.create({
          data: {
            sessionId: data.sessionId,
            type: data.type,
            imageUrl: data.imageUrl,
            data: data.data,
          },
        });
      } catch (err) {
        console.error("Snapshot save error:", err);
      }
    });

    socket.on("session-terminate", async (data: {
      sessionId: string;
      reason: string;
    }) => {
      try {
        await prisma.proctoringSession.update({
          where: { id: data.sessionId },
          data: {
            status: "TERMINATED",
            terminatedAt: new Date(),
            terminationReason: data.reason,
          },
        });
        io.to(`session:${data.sessionId}`).emit("session-terminated", data);
      } catch (err) {
        console.error("Session terminate error:", err);
      }
    });

    socket.on("face-capture", async (data: {
      sessionId: string;
      imageData: string;
    }) => {
      try {
        await prisma.proctoringSession.update({
          where: { id: data.sessionId },
          data: { faceCapture: data.imageData },
        });
      } catch (err) {
        console.error("Face capture error:", err);
      }
    });

    socket.on("integrity-update", async (data: {
      sessionId: string;
      integrityScore: number;
      cheatingProbability: number;
    }) => {
      try {
        await prisma.proctoringSession.update({
          where: { id: data.sessionId },
          data: {
            integrityScore: data.integrityScore,
            cheatingProbability: data.cheatingProbability,
          },
        });
      } catch (err) {
        console.error("Integrity update error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
