"use client";

import { useEffect, useRef, useState } from "react";

const MAX_MESSAGE_LENGTH = 300;

const quickReplies = [
  "What phones are available today?",
  "Do you have accessories for iPhone?",
  "What are your store hours?",
];

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatWall() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! Welcome to ABC Mobile Shop. How can we help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setError(`Message must be under ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }

    setError(null);
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }

      const data = (await response.json()) as { reply: string };
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await sendMessage(input);
  };

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
      <header className="flex items-center gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-lg font-semibold text-white">
          ABC
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">ABC Mobile Shop</p>
          <p className="text-sm text-slate-500">
            Friendly experts • Fast replies
          </p>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="chat-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-5"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                message.role === "user"
                  ? "bg-brand-500 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 bg-white px-6 py-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => sendMessage(reply)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-500 hover:text-brand-600"
            >
              {reply}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your message..."
            maxLength={MAX_MESSAGE_LENGTH}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={isSending}
            className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </form>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>{input.length}/{MAX_MESSAGE_LENGTH}</span>
          {error ? <span className="text-rose-500">{error}</span> : null}
        </div>
      </div>
    </section>
  );
}
