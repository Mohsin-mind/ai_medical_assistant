import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
import { PROVIDERS } from "../../../constants/appConstants";

// In-memory session store for server-side history
const sessions = new Map();

const systemPrompt = `You are a helpful AI Medical Assistant. Your role is to help users understand their symptoms.
Follow these rules strictly:
1. Whenever a user reports a symptom (e.g., "I have a fever", "My head hurts"), you MUST first ask for their Name, Age, and Gender if you don't know it yet. Ask for them all at once.
2. Once you have their Name, Age, and Gender, ask 1 or 2 relevant follow-up questions to understand the condition better (e.g., "Do you have a cough?", "How long have you had the fever?").
3. After gathering sufficient information (symptom + demographics + follow-up info), provide general advice or suggest over-the-counter medicine based on public medical knowledge.
4. Keep your responses concise and empathetic.
5. ALWAYS include a disclaimer at the end of your final recommendation stating: "Disclaimer: I am an AI, not a doctor. Please consult a healthcare professional for medical advice."`;

function getModel() {
  //groq is set in env as it has free limit
  const provider = process.env.AI_PROVIDER;

  if (provider === PROVIDERS.GOOGLE) {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");
    const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
    return google("gemini-2.0-flash");
  }

  if (provider === PROVIDERS.OPENAI) {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai("gpt-4o-mini");
  }

  if (provider === PROVIDERS.GROQ) {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY missing");
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
    return groq("llama-3.3-70b-versatile");
  }

  throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
}

export async function POST(req) {
  try {
    const { messages, sessionId = "default" } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages are required" }), { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.content?.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Message too long. Please shorten it." }),
        { status: 400 }
      );
    }

    const model = getModel();

    const coreMessages = messages.map((msg) => {
      let content = msg.content;
      if (!content && msg.parts) {
        content = msg.parts
          .filter(p => p.type === "text")
          .map(p => p.text)
          .join("");
      }
      return {
        role: msg.role,
        content: content || "",
      };
    });

    const result = streamText({
      model,
      system: systemPrompt,
      messages: coreMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("AI API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId && sessions.has(sessionId)) {
      sessions.delete(sessionId);
    }

    return new Response(JSON.stringify({ success: true, message: "Session cleared." }));
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to reset session" }), { status: 500 });
  }
}
