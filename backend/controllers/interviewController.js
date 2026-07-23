import groq from "../config/groq.js";
import { COMPANY_CONFIGS, PERSONALITY_CONFIGS } from "../config/companies.ts";

export const handleInterview = async (req, res) => {
  try {
    const {
      role = "Frontend Developer",
      message,
      history = [],
      company = "GENERAL",
      personality = "STRICT",
      resumeContext = "",
      difficulty = "",
    } = req.body;

    const companyConfig = COMPANY_CONFIGS[company] || COMPANY_CONFIGS.GENERAL;
    const personalityConfig = PERSONALITY_CONFIGS[personality] || PERSONALITY_CONFIGS.STRICT;
    const effectiveDifficulty = difficulty || companyConfig.difficulty;

    const systemPrompt = `
You are a strict technical interviewer conducting a ${companyConfig.label} interview.

COMPANY CONTEXT:
${companyConfig.systemPrompt}

INTERVIEWER PERSONALITY:
${personalityConfig.systemPrompt}

ROLE: ${role}
DIFFICULTY: ${effectiveDifficulty}

${resumeContext ? `CANDIDATE CONTEXT:\n${resumeContext}\n` : ""}

STRICT RULES:
- Ask ONLY ONE question at a time
- NEVER give hints, keywords, or partial answers
- NEVER list items or break questions into parts
- NEVER guide the candidate

INTERVIEW FLOW:
1. Ask ONE clean question
2. After answer: give short feedback (1-2 lines), then ask NEXT question

BEHAVIOR:
- If answer is weak, say it directly
- If user says "next", respond "Answer properly"
- Adapt difficulty based on performance

OUTPUT:
- Plain text only
- No bullet points
- No hints
- No explanations unless evaluating answer
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.log("INTERVIEW ERROR:", error.message);
    res.json({
      reply: "Something went wrong. Let's continue the interview. Explain time complexity of binary search.",
    });
  }
};
