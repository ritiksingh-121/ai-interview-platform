import express from "express";
import groq from "../config/groq.js";
import prisma from "../db/prisma.ts";
import { cleanJSON } from "../utils/cleanJSON.js";

const router = express.Router();

const STARTER_CODES: Record<string, string> = {
  javascript: `function solution(...args) {\n  // Write your code here\n  \n}`,
  typescript: `function solution(...args: any[]): any {\n  // Write your code here\n  \n}`,
  python: `def solution(*args):\n    # Write your code here\n    pass`,
  java: `public class Solution {\n    public static Object solution(Object... args) {\n        // Write your code here\n        return null;\n    }\n}`,
  cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nauto solution(auto... args) {\n    // Write your code here\n    \n}`,
  csharp: `using System;\n\nclass Solution {\n    static object SolutionMethod(params object[] args) {\n        // Write your code here\n        return null;\n    }\n}`,
  go: `package main\n\nfunc solution(args ...interface{}) interface{} {\n    // Write your code here\n    return nil\n}`,
  rust: `fn solution(args: &[&dyn std::any::Any]) -> Box<dyn std::any::Any> {\n    // Write your code here\n    todo!()\n}`,
  swift: `func solution(_ args: Any...) -> Any {\n    // Write your code here\n    \n}`,
  kotlin: `fun solution(vararg args: Any): Any {\n    // Write your code here\n    TODO()\n}`,
};

const TOPICS = [
  "arrays", "strings", "hashmaps", "two-pointers", "sliding-window",
  "stacks", "queues", "linked-lists", "trees", "graphs",
  "dynamic-programming", "greedy", "recursion", "sorting", "searching",
  "math", "bit-manipulation", "design", "concurrency",
];

router.get("/languages", (_req, res) => {
  res.json({
    languages: [
      { id: "javascript", label: "JavaScript" },
      { id: "typescript", label: "TypeScript" },
      { id: "python", label: "Python" },
      { id: "java", label: "Java" },
      { id: "cpp", label: "C++" },
      { id: "csharp", label: "C#" },
      { id: "go", label: "Go" },
      { id: "rust", label: "Rust" },
      { id: "swift", label: "Swift" },
      { id: "kotlin", label: "Kotlin" },
    ],
  });
});

router.get("/topics", (_req, res) => {
  res.json({ topics: TOPICS });
});

router.post("/generate", async (req, res) => {
  try {
    const { firebaseUid, company = "GENERAL", difficulty, topic } = req.body;
    if (!firebaseUid) return res.status(400).json({ error: "firebaseUid required" });

    const user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const diff = difficulty || (company === "GENERAL" ? "MEDIUM" : "HARD");
    const selectedTopic = topic || TOPICS[Math.floor(Math.random() * TOPICS.length)];

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert coding interview question setter for ${company} level interviews. Generate a ${diff} difficulty coding problem about ${selectedTopic}. Return ONLY valid JSON — no markdown. Schema:
{
  "title": "<problem title>",
  "description": "<detailed problem description>",
  "difficulty": "${diff}",
  "topic": "${selectedTopic}",
  "examples": [
    { "input": "<example input>", "output": "<expected output>", "explanation": "<brief explanation>" }
  ],
  "constraints": ["<constraint1>", "<constraint2>"],
  "edgeCases": ["<edge case 1>", "<edge case 2>"],
  "testCases": [
    { "input": "<test input>", "output": "<expected output>" }
  ],
  "functionSignature": "<function signature stub>",
  "hints": ["<hint1>", "<hint2>"],
  "followUp": "<optional follow-up question>"
}
Generate 5-8 test cases including edge cases. Make it realistic for ${company}.`,
        },
        {
          role: "user",
          content: `Generate a ${diff} difficulty coding problem about ${selectedTopic} for a ${company} interview.`,
        },
      ],
      temperature: 0.4,
      max_tokens: 4096,
    });

    const reply = response.choices[0].message.content;
    const parsed = cleanJSON(reply);
    if (!parsed || !parsed.title) {
      return res.status(500).json({ error: "AI returned invalid format" });
    }

    const session = await prisma.codingSession.create({
      data: {
        userId: user.id,
        company: company as any,
        title: parsed.title,
        language: "javascript",
        code: STARTER_CODES["javascript"],
        problem: JSON.stringify({
          description: parsed.description,
          difficulty: parsed.difficulty,
          topic: parsed.topic,
          examples: parsed.examples || [],
          constraints: parsed.constraints || [],
          edgeCases: parsed.edgeCases || [],
          functionSignature: parsed.functionSignature || "",
          hints: parsed.hints || [],
          followUp: parsed.followUp || "",
        }),
        testCases: JSON.stringify(parsed.testCases || []),
      },
    });

    res.json({
      session: {
        id: session.id,
        title: session.title,
        problem: JSON.parse(session.problem),
        testCases: JSON.parse(session.testCases),
        language: session.language,
        code: session.code,
        company,
      },
    });
  } catch (error: any) {
    console.error("Generate coding error:", error.message);
    res.status(500).json({ error: "Failed to generate coding problem" });
  }
});

router.post("/evaluate", async (req, res) => {
  try {
    const { sessionId, code, language, firebaseUid } = req.body;
    if (!sessionId || !code || !firebaseUid) {
      return res.status(400).json({ error: "sessionId, code, and firebaseUid required" });
    }

    const user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const session = await prisma.codingSession.findUnique({ where: { id: sessionId } });
    if (!session) return res.status(404).json({ error: "Session not found" });

    const testCases = JSON.parse(session.testCases || "[]");
    const problem = JSON.parse(session.problem || "{}");

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert coding interview evaluator. Evaluate the submitted ${language} solution. Return ONLY valid JSON — no markdown. Schema:
{
  "overallScore": <1-10>,
  "correctness": <1-10>,
  "efficiency": <1-10>,
  "codeQuality": <1-10>,
  "timeComplexity": "<Big O>",
  "spaceComplexity": "<Big O>",
  "testResults": [
    {
      "testCase": <index>,
      "input": "<input>",
      "expected": "<expected>",
      "actual": "<actual output>",
      "passed": true/false,
      "notes": "<optional>"
    }
  ],
  "passedCount": <number>,
  "totalCount": <number>,
  "feedback": "<detailed overall feedback>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"],
  "optimizedCode": "<optimized version>",
  "keyTakeaways": ["<takeaway1>", "<takeaway2>"]
}
Simulate running the code against each test case. Be thorough about edge cases and performance.`,
        },
        {
          role: "user",
          content: `Problem: ${session.title}\n${problem.description || ""}\n\nLanguage: ${language}\n\nTest Cases:\n${JSON.stringify(testCases, null, 2)}\n\nSubmitted Code:\n\`\`\`${language}\n${code}\n\`\`\``,
        },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    });

    const reply = response.choices[0].message.content;
    const evaluation = cleanJSON(reply);
    if (!evaluation || evaluation.overallScore === undefined) {
      return res.status(500).json({ error: "AI returned invalid format" });
    }

    await prisma.codingSession.update({
      where: { id: sessionId },
      data: {
        code,
        language,
        results: JSON.stringify(evaluation),
        score: evaluation.overallScore,
        feedback: evaluation.feedback,
        completed: true,
      },
    });

    res.json({ evaluation });
  } catch (error: any) {
    console.error("Evaluate coding error:", error.message);
    res.status(500).json({ error: "Failed to evaluate code" });
  }
});

router.post("/save", async (req, res) => {
  try {
    const { sessionId, code, language, firebaseUid, timeSpent } = req.body;
    if (!sessionId || !firebaseUid) return res.status(400).json({ error: "sessionId and firebaseUid required" });

    const user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const data: any = {};
    if (code !== undefined) data.code = code;
    if (language !== undefined) data.language = language;
    if (timeSpent !== undefined) data.timeSpent = timeSpent;
    data.autoSaved = true;

    await prisma.codingSession.update({ where: { id: sessionId }, data });
    res.json({ saved: true });
  } catch (error: any) {
    console.error("Save coding error:", error.message);
    res.status(500).json({ error: "Failed to save" });
  }
});

router.get("/session/:sessionId", async (req, res) => {
  try {
    const session = await prisma.codingSession.findUnique({ where: { id: req.params.sessionId } });
    if (!session) return res.status(404).json({ error: "Session not found" });

    res.json({
      session: {
        ...session,
        problem: JSON.parse(session.problem || "{}"),
        testCases: JSON.parse(session.testCases || "[]"),
        results: session.results ? JSON.parse(session.results) : null,
      },
    });
  } catch (error: any) {
    console.error("Get session error:", error.message);
    res.status(500).json({ error: "Failed to get session" });
  }
});

router.get("/history/:firebaseUid", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.params.firebaseUid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const sessions = await prisma.codingSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json({
      sessions: sessions.map((s) => ({
        id: s.id, title: s.title, language: s.language,
        score: s.score, completed: s.completed,
        timeSpent: s.timeSpent, createdAt: s.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Coding history error:", error.message);
    res.status(500).json({ error: "Failed to get history" });
  }
});

export default router;
