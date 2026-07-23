import express from "express";
import groq from "../config/groq.js";
import { cleanJSON } from "../utils/cleanJSON.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { transcript, question } = req.body;
    if (!transcript) return res.status(400).json({ error: "Transcript required" });

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are analyzing a voice interview response. Evaluate the spoken answer. Return ONLY valid JSON — no markdown. Schema:
{
  "contentScore": <1-10>,
  "clarityScore": <1-10>,
  "confidenceScore": <1-10>,
  "overallScore": <1-10>,
  "feedback": "<detailed feedback on the answer>",
  "fillerWordCount": <count of "um", "uh", "like", "you know">,
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"],
  "suggestedAnswer": "<a more polished version of the answer>"
}`,
        },
        { role: "user", content: `Question: ${question || "Tell me about yourself"}\n\nTranscript: ${transcript}` },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const reply = response.choices[0].message.content;
    const analysis = cleanJSON(reply);
    res.json({ analysis: analysis || { overallScore: 5, feedback: "Analysis completed.", fillerWordCount: 0, strengths: [], improvements: [] } });
  } catch (error: any) {
    console.error("Voice analysis error:", error.message);
    res.status(500).json({ error: "Failed to analyze voice response" });
  }
});

router.post("/questions", async (_req, res) => {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Generate 5 voice interview practice questions for engineers. Return ONLY valid JSON array — no markdown. Schema:
[{ "id": "q1", "question": "<question>", "category": "behavioral|technical|hr", "tip": "<brief tip>" }]
Include a mix of: tell me about yourself, behavioral STAR questions, technical explanations, career goals, and problem-solving.`,
        },
        { role: "user", content: "Generate 5 voice interview practice questions." },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = response.choices[0].message.content;
    const questions = cleanJSON(reply);
    res.json({ questions: Array.isArray(questions) ? questions : [] });
  } catch (error: any) {
    console.error("Voice questions error:", error.message);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

router.post("/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text required" });

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "Rewrite the following text to be spoken aloud in a natural, conversational tone. Make it concise and easy to speak. Return ONLY the rewritten text, no markdown or JSON.",
        },
        { role: "user", content: text },
      ],
      temperature: 0.3,
      max_tokens: 512,
    });

    res.json({ spoken: response.choices[0].message.content });
  } catch (error: any) {
    console.error("TTS error:", error.message);
    res.status(500).json({ error: "Failed to process text" });
  }
});

export default router;
