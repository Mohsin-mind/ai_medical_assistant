import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Groq from "groq-sdk";
import { PROVIDERS } from "../constants/appConstants";

const systemPrompt = `You are a helpful AI Medical Assistant. Your role is to help users understand their symptoms.
Follow these rules strictly:
1. Whenever a user reports a symptom (e.g., "I have a fever", "My head hurts"), you MUST first ask for their Name, Age, and Gender if you don't know it yet. Ask for them all at once.
2. Once you have their Name, Age, and Gender, ask 1 or 2 relevant follow-up questions to understand the condition better (e.g., "Do you have a cough?", "How long have you had the fever?").
3. After gathering sufficient information (symptom + demographics + follow-up info), provide general advice or suggest over-the-counter medicine based on public medical knowledge.
4. Keep your responses concise and empathetic.
5. ALWAYS include a disclaimer at the end of your final recommendation stating: "Disclaimer: I am an AI, not a doctor. Please consult a healthcare professional for medical advice."`;

export const sessions = new Map();

export function initializeHistory() {
  return [
    {
      role: "user",
      parts: [{ text: "System prompt: " + systemPrompt }]
    },
    {
      role: "model",
      parts: [{ text: "Understood. I will act as the Medical Assistant according to those rules." }]
    }
  ];
}

export async function generateWithGemini(message, sessionId) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  let chatHistory = sessions.get(sessionId) || initializeHistory();

  const chat = model.startChat({
    history: chatHistory,
  });

  const result = await chat.sendMessage(message);
  const textResponse = result.response.text();

  const newHistory = await chat.getHistory();
  sessions.set(sessionId, newHistory);

  return textResponse;
}

export async function generateWithOpenAI(message, sessionId) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing from environment variables.");
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  let chatHistory = sessions.get(sessionId) || [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "assistant",
      content: "Understood. I will act as the Medical Assistant according to those rules."
    }
  ];

  const formattedHistory = chatHistory.map(msg => {
     if (msg.role === "user" || msg.role === "model" || msg.role === "assistant" || msg.role === "system") {
         return {
             role: msg.role === "model" ? "assistant" : msg.role,
             content: msg.parts ? msg.parts[0].text : (msg.content || "")
         };
     }
     return msg;
  });

  formattedHistory.push({ role: "user", content: message });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: formattedHistory,
  });

  const textResponse = completion.choices[0].message.content;

  formattedHistory.push({ role: "assistant", content: textResponse });
  sessions.set(sessionId, formattedHistory);

  return textResponse;
}

export async function generateWithGroq(message, sessionId) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing from environment variables.");
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  let chatHistory = sessions.get(sessionId) || [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "assistant",
      content: "Understood. I will act as the Medical Assistant according to those rules."
    }
  ];

  const formattedHistory = chatHistory.map(msg => {
     if (msg.role === "user" || msg.role === "model" || msg.role === "assistant" || msg.role === "system") {
         return {
             role: msg.role === "model" ? "assistant" : msg.role,
             content: msg.parts ? msg.parts[0].text : (msg.content || "")
         };
     }
     return msg;
  });

  formattedHistory.push({ role: "user", content: message });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: formattedHistory,
  });

  const textResponse = completion.choices[0].message.content;

  formattedHistory.push({ role: "assistant", content: textResponse });
  sessions.set(sessionId, formattedHistory);

  return textResponse;
}

export async function generateAIResponse(message, sessionId) {
  const provider = process.env.AI_PROVIDER || PROVIDERS.GOOGLE;

  try {
    if (provider === PROVIDERS.GOOGLE) {
      return await generateWithGemini(message, sessionId);
    } else if (provider === PROVIDERS.OPENAI) { 
      return await generateWithOpenAI(message, sessionId);
    } else if (provider === PROVIDERS.GROQ) {
      return await generateWithGroq(message, sessionId);
    } else {
      throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
    }
  } catch (error) {
    console.error(`Error in ${provider} AI call:`, error);
    return "I'm sorry, I am currently facing technical difficulties and cannot connect to my medical knowledge base. Please try again later.";
  }
}
