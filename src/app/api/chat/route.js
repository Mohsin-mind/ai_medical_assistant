import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

// Store conversation history in memory for this simple implementation
// Note: In production, consider a database or session storage.
const sessions = new Map();

const systemPrompt = `You are a helpful AI Medical Assistant. Your role is to help users understand their symptoms.
Follow these rules strictly:
1. Whenever a user reports a symptom (e.g., "I have a fever", "My head hurts"), you MUST first ask for their Name, Age, and Gender if you don't know it yet. Ask for them all at once.
2. Once you have their Name, Age, and Gender, ask 1 or 2 relevant follow-up questions to understand the condition better (e.g., "Do you have a cough?", "How long have you had the fever?").
3. After gathering sufficient information (symptom + demographics + follow-up info), provide general advice or suggest over-the-counter medicine based on public medical knowledge.
4. Keep your responses concise and empathetic.
5. ALWAYS include a disclaimer at the end of your final recommendation stating: "Disclaimer: I am an AI, not a doctor. Please consult a healthcare professional for medical advice."`;

export async function POST(req) {
  try {
    const { message, sessionId = "default" } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!process.env.GEMINI_API_KEY) {
         console.warn("GEMINI_API_KEY is missing. Using a dummy response for development.");
         return new Response(JSON.stringify({
             reply: "Error: AI API Key is not configured on the server. Please add GEMINI_API_KEY to your .env file."
         }), {
             status: 200, // Return 200 so the chatbot can show the message
             headers: { "Content-Type": "application/json" },
         });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Retrieve or initialize chat history
    let chatHistory = sessions.get(sessionId) || [
      {
        role: "user",
        parts: [{ text: "System prompt: " + systemPrompt }]
      },
      {
         role: "model",
         parts: [{ text: "Understood. I will act as the Medical Assistant according to those rules." }]
      }
    ];

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(message);
    const textResponse = result.response.text();

    // Update history (Google's SDK handles this internally for the active chat instance, 
    // but we might need to manually sync if we were saving to DB. For memory, we rebuild next time.)
    
    // We update the session map with the new history state
    const newHistory = await chat.getHistory();
    sessions.set(sessionId, newHistory);

    return new Response(JSON.stringify({ reply: textResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
