"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import { SendHorizonal, RotateCcw, Stethoscope, Bot, User } from "lucide-react";

import { Chat } from "@/components/chat/chat";
import {
  ChatHeader,
  ChatHeaderAddon,
  ChatHeaderAvatar,
  ChatHeaderMain,
  ChatHeaderButton,
} from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import {
  ChatEvent,
  ChatEventAddon,
  ChatEventAvatar,
  ChatEventBody,
  ChatEventContent,
  ChatEventTime,
  ChatEventTitle,
} from "@/components/chat/chat-event";
import {
  ChatToolbar,
  ChatToolbarAddon,
  ChatToolbarButton,
  ChatToolbarTextarea,
} from "@/components/chat/chat-toolbar";

// Static initial messages
const INITIAL_MESSAGES = [
  {
    id: "welcome",
    role: "assistant",
    content: "Hello! I am your **AI Medical Assistant** 🩺\n\nHow can I help you today? Please tell me about your symptoms.",
    createdAt: new Date(0),
  },
];

export default function ChatbotWidget() {
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    let currentSession = localStorage.getItem("ai_medical_session");
    if (!currentSession) {
      currentSession = crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(7);
      localStorage.setItem("ai_medical_session", currentSession);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionId(currentSession);
  }, []);

  if (!sessionId) {
    return (
      <div className="h-[600px] w-full border rounded-xl shadow-sm bg-background flex items-center justify-center text-muted-foreground">
        Initializing...
      </div>
    );
  }

  return <Chatbot sessionId={sessionId} onSessionChange={setSessionId} />;
}

function Chatbot({ sessionId, onSessionChange }) {
  const [inputText, setInputText] = useState("");
  const textareaRef = useRef(null);

  // Read displayable text from a message (Vercel AI SDK robust handling)
  function getMessageText(msg) {
    if (msg.parts && msg.parts.length > 0) {
      return msg.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("");
    }
    return msg.content || "";
  }

  // The chat hook is only initialized ONCE with the valid session ID.
  const { messages, sendMessage, status, setMessages } = useChat({
    api: "/api/chat",
    id: sessionId,
    body: { sessionId },
    initialMessages: INITIAL_MESSAGES,
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Focus textarea when session is ready
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Vercel AI SDK v6 workaround: when an explicit `id` is provided, 
  // the hook sometimes bypasses initialMessages assuming history will be fetched.
  useEffect(() => {
    if (messages.length === 0 && setMessages) {
      setMessages(INITIAL_MESSAGES);
    }
  }, [messages.length, setMessages]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    sendMessage({ text: inputText.trim() });
    setInputText("");
    textareaRef.current?.focus();
  };

  const handleStartFresh = async () => {
    try {
      await fetch(`/api/chat?sessionId=${sessionId}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
    const newSession = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(7);
    localStorage.setItem("ai_medical_session", newSession);

    // Changing the session ID unmounts this Chatbot and remounts a new one with the new ID,
    // which automatically resets the messages explicitly.
    onSessionChange(newSession);
  };

  return (
    <Chat className="h-[600px] w-full border rounded-xl shadow-sm bg-background">
      {/* ── Header ── */}
      <ChatHeader className="border-b px-3 py-2">
        <ChatHeaderAddon>
          <ChatHeaderAvatar
            fallback={<Stethoscope className="size-4" />}
            className="text-primary-foreground size-9"
          />
        </ChatHeaderAddon>

        <ChatHeaderMain>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight">
              AI Medical Assistant
            </span>
            <span className="text-xs text-muted-foreground">
              {isLoading ? "Typing..." : "Online"}
            </span>
          </div>
        </ChatHeaderMain>

        <ChatHeaderAddon>
          <ChatHeaderButton
            onClick={handleStartFresh}
            title="Reset session"
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-4" />
          </ChatHeaderButton>
        </ChatHeaderAddon>
      </ChatHeader>

      {/* ── Messages ── */}
      <ChatMessages>
        {/* Typing indicator */}
        {isLoading && (
          <ChatEvent className="py-1">
            <ChatEventAddon>
              <ChatEventAvatar
                fallback={<Bot className="size-4" />}
                className="bg-muted size-8"
              />
            </ChatEventAddon>
            <ChatEventBody>
              <div className="flex items-center gap-1 py-2 px-1">
                <span className="size-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                <span className="size-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                <span className="size-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
              </div>
            </ChatEventBody>
          </ChatEvent>
        )}

        {/* Reverse messages for flex-col-reverse display */}
        {[...messages].reverse().map((msg) => {
          const isUser = msg.role === "user";
          const text = getMessageText(msg);

          return (
            <ChatEvent key={msg.id} className="py-1">
              {!isUser && (
                <ChatEventAddon>
                  <ChatEventAvatar
                    fallback={<Bot className="size-4" />}
                    className="bg-muted size-8"
                  />
                </ChatEventAddon>
              )}

              <ChatEventBody className={isUser ? "items-end" : "items-start"}>
                <ChatEventTitle>
                  <span className="font-medium text-xs">
                    {isUser ? "You" : "AI Assistant"}
                  </span>
                </ChatEventTitle>

                <ChatEventContent
                  className={`mt-0.5 max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${isUser
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown>{text}</ReactMarkdown>
                  </div>
                </ChatEventContent>
              </ChatEventBody>

              {isUser && (
                <ChatEventAddon className="justify-center">
                  <ChatEventAvatar
                    fallback={<User className="size-4" />}
                    className="text-primary-foreground size-8"
                  />
                </ChatEventAddon>
              )}
            </ChatEvent>
          );
        })}
      </ChatMessages>

      {/* ── Toolbar ── */}
      <ChatToolbar>
        <ChatToolbarTextarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onSubmit={handleSend}
          disabled={isLoading}
        />
        <ChatToolbarAddon align="inline-end">
          <ChatToolbarButton
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            title="Send message"
          >
            <SendHorizonal className="size-4" />
          </ChatToolbarButton>
        </ChatToolbarAddon>
      </ChatToolbar>
    </Chat>
  );
}
