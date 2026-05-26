import groq from "../config/groq.js";

export const handleFeedback = async (req, res) => {
  try {
    const { question, answer } = req.body;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `
Question: ${question}
Answer: ${answer}

Give:
- Score (0-10)
- Strengths
- Weaknesses
- Improved Answer
`,
        },
      ],
    });

    res.json({
      feedback: response.choices[0].message.content,
    });

  } catch (error) {
    console.log("FEEDBACK ERROR:", error.message);

    res.json({
      feedback: "Unable to generate feedback",
    });
  }
};