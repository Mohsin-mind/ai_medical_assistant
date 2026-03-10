"use client";

import React, { useState, useEffect } from "react";
import ChatBot from "react-chatbotify";
import { Button } from "./ui/Button";

export default function ChatbotWidget() {
  const [sessionId, setSessionId] = useState("");
  const [key, setKey] = useState(0);

  useEffect(() => {
    let currentSession = localStorage.getItem("ai_medical_session");
    if (!currentSession) {
      currentSession = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7);
      localStorage.setItem("ai_medical_session", currentSession);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionId(currentSession);
  }, []);

  const handleStartFresh = async () => {
    if (!sessionId) return;

    try {
      await fetch(`/api/chat?sessionId=${sessionId}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }

    localStorage.removeItem("ai_medical_assistant_history");

    const newSession = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7);
    localStorage.setItem("ai_medical_session", newSession);
    setSessionId(newSession);

    setKey(prev => prev + 1);
  };

  const flow = {
    start: {
      message: "Hello! I am your AI Medical Assistant. How can I help you today? Please tell me about your symptoms.",
      path: "handle_message",
    },
    handle_message: {
      message: async (params) => {
        if (!sessionId) return "Session initializing, please try again.";

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: params.userInput,
              sessionId: sessionId
            }),
          });

          if (!response.ok) {
            return "I'm sorry, I'm having trouble connecting to my medical database right now. Please try again later.";
          }

          const data = await response.json();
          if (data.error) {
            return "I'm sorry, an error occurred: " + data.error;
          }
          return data.reply;
        } catch (error) {
          return "I'm sorry, an error occurred while processing your message. Please try again.";
        }
      },
      path: "handle_message",
    },
  };

  const settings = {
    general: {
      embedded: false,
      primaryColor: "#0070f3",
      secondaryColor: "#0070f3",
      fontFamily: "Inter, sans-serif",
    },
    chatHistory: {
      storageKey: "ai_medical_assistant_history",
    },
    header: {
      title: "AI Medical Assistant",
      showAvatar: true,
      avatar: "https://cdn-icons-png.flaticon.com/512/387/387561.png"
    },
    botBubble: {
      simStream: true,
    }
  };

  if (!sessionId) {
    return <div className="h-full w-full flex items-center justify-center">Initializing...</div>;
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={handleStartFresh}
          className="bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
        >
          Reset Session
        </Button>
      </div>
      <ChatBot key={key} settings={settings} flow={flow} />
    </div>
  );
}
