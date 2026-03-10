import { NextResponse } from "next/server";
import { generateAIResponse, sessions } from "../../../lib/ai";

export async function POST(req) {
  try {
    const { message, sessionId = "default" } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ reply: "I'm sorry, your message is a bit too long. Could you please shorten it?" });
    }

    const reply = await generateAIResponse(message, sessionId);

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId && sessions.has(sessionId)) {
      sessions.delete(sessionId);
    }

    return NextResponse.json({ success: true, message: "Session cleared." });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reset session" }, { status: 500 });
  }
}
