"use client";

import ChatBot from "react-chatbotify";

export default function ChatbotWidget() {

  const flow = {
    start: {
      message: "Hello! I am your AI Medical Assistant. How can I help you today? Please tell me about your symptoms.",
      path: "handle_message",
    },
    handle_message: {
      message: async (params) => {
        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: params.userInput }),
          });

          if (!response.ok) {
            console.error("API error status:", response.status);
            return "I'm sorry, I'm having trouble connecting to my medical database right now. Please try again later.";
          }

          const data = await response.json();
          return data.reply;
        } catch (error) {
          console.error("Error communicating with AI API:", error);
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
      avatar: "https://cdn-icons-png.flaticon.com/512/387/387561.png" // placeholder medical icon
    },
    botBubble: {
      simStream: true,
    }
  };


  return (
    <div className="relative">
      <ChatBot settings={settings} flow={flow} />
    </div>
  );
}
