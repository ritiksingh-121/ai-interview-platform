import express from "express";
import { handleInterview } from "../controllers/interviewController.js";

const router = express.Router();


router.post("/", handleInterview);

export default router;