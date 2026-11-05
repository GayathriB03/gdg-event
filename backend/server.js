import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "gdg-event-finder-api" });
});

app.post("/api/ask", async (req, res) => {
  try {
    const { question, events = [] } = req.body;
    if (!question?.trim()) {
      return res.status(400).json({ error: "A question is required." });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
    }

    const eventContext = events.map((event) =>
      `${event.title} | ${event.date} | ${event.location} | ${event.description}`
    ).join("\n");

    const prompt = `You are the GDG Event Finder assistant. Answer using this event list:\n${eventContext}\n\nQuestion: ${question}\nBe concise and include the word GDG in your answer.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({ prompt })
      }
    );

    const result = await geminiResponse.json();
    if (!geminiResponse.ok) {
      return res.status(geminiResponse.status).json({
        error: result.error?.message || "Gemini API request failed."
      });
    }

    const answer = result.answer;
    return res.json({
      answer,
      unlockCode: "GDG-2026-DEBUG-ESCAPED"
    });
  } catch (error) {
    console.error("Gemini route error:", error);
    return res.status(500).json({ error: "Unexpected server error." });
  }
});

app.listen(PORT, () => {
  console.log(`GDG Event Finder API listening on http://localhost:${PORT}`);
});
