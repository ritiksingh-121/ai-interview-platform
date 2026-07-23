import express from "express";
import groq from "../config/groq.js";
import { cleanJSON } from "../utils/cleanJSON.js";

const router = express.Router();

router.post("/advice", async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) return res.status(400).json({ error: "Question required" });

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert AI career coach. Provide personalized career advice. Return ONLY valid JSON — no markdown. Schema:
{
  "advice": "<detailed, actionable advice in 3-5 sentences>",
  "actionItems": ["<action1>", "<action2>", "<action3>"],
  "resources": ["<resource suggestion>"],
  "confidenceScore": <1-10>
}`,
        },
        { role: "user", content: `Question: ${question}\n${context ? `Context: ${context}` : ""}` },
      ],
      temperature: 0.4,
      max_tokens: 2048,
    });

    const reply = response.choices[0].message.content;
    const result = cleanJSON(reply);
    res.json({ coaching: result || { advice: "Considered your question.", actionItems: [], confidenceScore: 5 } });
  } catch (error: any) {
    console.error("Coach advice error:", error.message);
    res.status(500).json({ error: "Failed to get advice" });
  }
});

router.post("/skill-gap", async (req, res) => {
  try {
    const { role, currentSkills, experience } = req.body;
    if (!role || !currentSkills) return res.status(400).json({ error: "Role and currentSkills required" });

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert career coach analyzing skill gaps. Return ONLY valid JSON — no markdown. Schema:
{
  "analysis": "<brief analysis of current skill set>",
  "gaps": [
    { "skill": "<skill name>", "importance": "critical|important|nice_to_have", "learningResource": "<suggestion>" }
  ],
  "strengths": ["<strength1>", "<strength2>"],
  "roadmap": "<3-4 sentence recommended learning path>",
  "marketDemand": "<assessment of job market for this role>"
}`,
        },
        { role: "user", content: `Target Role: ${role}\nCurrent Skills: ${currentSkills}\nExperience Level: ${experience || "Not specified"}` },
      ],
      temperature: 0.4,
      max_tokens: 2048,
    });

    const reply = response.choices[0].message.content;
    const result = cleanJSON(reply);
    res.json({ skillGap: result || { analysis: "Analysis completed.", gaps: [], strengths: [] } });
  } catch (error: any) {
    console.error("Skill gap error:", error.message);
    res.status(500).json({ error: "Failed to analyze skill gaps" });
  }
});

router.post("/jobs", async (req, res) => {
  try {
    const { role, location, skills } = req.body;
    if (!role) return res.status(400).json({ error: "Role required" });

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert career coach recommending jobs. Return ONLY valid JSON — no markdown. Schema:
{
  "recommendations": [
    {
      "title": "<job title>",
      "company": "<company>",
      "matchScore": <1-10>,
      "whyMatch": "<why this fits>",
      "skillsNeeded": ["<skill1>", "<skill2>"],
      "salaryRange": "<estimated range>"
    }
  ],
  "marketInsight": "<brief market insight>",
  "tips": ["<tip1>", "<tip2>"]
}
Recommend 4-6 realistic job opportunities.`,
        },
        { role: "user", content: `Role: ${role}\n${location ? `Location: ${location}` : ""}\n${skills ? `Skills: ${skills}` : ""}` },
      ],
      temperature: 0.5,
      max_tokens: 2048,
    });

    const reply = response.choices[0].message.content;
    const result = cleanJSON(reply);
    res.json({ jobs: result || { recommendations: [], marketInsight: "", tips: [] } });
  } catch (error: any) {
    console.error("Job recommendations error:", error.message);
    res.status(500).json({ error: "Failed to get job recommendations" });
  }
});

export default router;
