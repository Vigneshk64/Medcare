"use client";

import { useState } from "react";
import { extractSeverityFromResponse, SEVERITY_COLORS } from "@/lib/designTokens";

interface AIAssistantProps {
  type?: "general" | "drugInteraction" | "prescriptionAnalysis" | "medicineInfo";
  medicines?: string[];
  initialMessage?: string;
}

type MessageType = "user" | "ai_safe" | "ai_warning" | "ai_danger" | "ai_general";

interface Message {
  role: "user" | "ai";
  content: string;
  type: MessageType;
}

export default function AIAssistant({
  type = "general",
  medicines = [],
  initialMessage = "",
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessage
      ? [{ role: "ai", content: initialMessage, type: "ai_general" }]
      : [
          {
            role: "ai",
            content:
              "👋 Welcome to MedCare AI Assistant. I'm here to help with medication information, drug interactions, and prescription guidance. How can I assist you today?",
            type: "ai_general",
          },
        ]
  );

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const determineMessageType = (text: string): Exclude<MessageType, "user"> => {
    const lowerText = text.toLowerCase();
    if (text.includes("[[RED]]") || lowerText.includes("danger")) {
      return "ai_danger";
    }
    if (text.includes("[[YELLOW]]") || lowerText.includes("warning")) {
      return "ai_warning";
    }
    if (text.includes("[[GREEN]]") || lowerText.includes("safe")) {
      return "ai_safe";
    }
    return "ai_general";
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, type: "user" },
    ]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          type,
          medicines,
        }),
      });

      const data = await res.json();
      const responseText = data?.response || "I couldn't process that request. Please try again.";
      const messageType = determineMessageType(responseText);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: responseText,
          type: messageType,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "⚠️ Network error. Please check your connection and try again.",
          type: "ai_warning",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getMessageStyling = (message: Message) => {
    if (message.type === "user") {
      return "ai-message-user";
    }
    switch (message.type) {
      case "ai_danger":
        return "ai-message-danger";
      case "ai_warning":
        return "ai-message-warning";
      case "ai_safe":
        return "ai-message-safe";
      case "ai_general":
        return "ai-message-assistant";
      default:
        return "ai-message-assistant";
    }
  };

  const getMessageIcon = (message: Message) => {
    if (message.type === "user") return null;
    switch (message.type) {
      case "ai_danger":
        return "🚨";
      case "ai_warning":
        return "⚠️";
      case "ai_safe":
        return "✅";
      case "ai_general":
        return "🏥";
      default:
        return "🤖";
    }
  };

  return (
    <div className="h-full flex flex-col bg-black/40 backdrop-blur-sm rounded-2xl border border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 flex items-center gap-3">
        <div className="text-2xl">🏥</div>
        <div>
          <h3 className="text-lg font-semibold text-white">Medical Assistant</h3>
          <p className="text-xs text-gray-400">Always verify with healthcare professionals</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex gap-3 max-w-[85%]">
              {m.role === "ai" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">
                  {getMessageIcon(m)}
                </div>
              )}
              <div className={`ai-message-bubble ${getMessageStyling(m)}`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                🏥
              </div>
              <div className="ai-message-bubble ai-message-assistant">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-sm">Analyzing...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              type === "drugInteraction"
                ? "Check interactions between medications..."
                : type === "prescriptionAnalysis"
                  ? "Describe your prescription..."
                  : type === "medicineInfo"
                    ? "Ask about a medication..."
                    : "Ask a medical question..."
            }
            className="flex-1 px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 orange-gradient text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending</span>
              </div>
            ) : (
              "Send"
            )}
          </button>
        </form>

        {/* Info Footer */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          💡 For safety information: Use [[RED]] for dangerous, [[YELLOW]] for warnings, [[GREEN]] for safe
        </div>
      </div>
    </div>
  );
}
