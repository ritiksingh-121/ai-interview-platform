import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

let firebaseInitialized = false;

function initFirebase() {
  if (firebaseInitialized) return;
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      });
      firebaseInitialized = true;
    } catch (e) {
      console.warn("Firebase admin init failed, auth disabled:", (e as Error).message);
    }
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT not set, auth middleware disabled");
  }
}

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  initFirebase();
  if (!firebaseInitialized) {
    req.userId = "dev-user";
    req.userEmail = "dev@example.com";
    return next();
  }

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "No auth token provided" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.userId = decoded.uid;
    req.userEmail = decoded.email;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
