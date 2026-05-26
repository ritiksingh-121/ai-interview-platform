import groq from "../config/groq.js";

export const handleInterview = async (req, res) => {
  try {
    const { role, message, history = [] } = req.body;

    const messages = [
      {
        role: "system",
content: `
You are a strict technical interviewer.

Role: ${role}

STRICT RULES:
- Ask ONLY ONE question at a time
- NEVER give hints, keywords, or partial answers
- NEVER list items like "Markup language", "Hoisting", etc.
- NEVER guide the candidate
- NEVER break question into parts

INTERVIEW FLOW:
1. Ask ONE clean question only
2. After answer:
   - Give short feedback (1-2 lines)
   - Ask NEXT question

BEHAVIOR:
- If answer is weak → say it directly
- If user says "next" → respond "Answer properly"
- Be strict, realistic, and slightly critical

OUTPUT:
- Plain text only
- No bullet points
- No hints
- No explanation unless evaluating answer

IMPORTANT:
If you give hints or keywords, your response is WRONG.
`
      },
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
    console.log("GROQ ERROR:", error.message);

    res.json({
      reply: "Something went wrong. Let's continue the interview. Explain time complexity of binary search."
    });
  }
};