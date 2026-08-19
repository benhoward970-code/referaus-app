"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What do I need for NDIS worker screening?",
  "How do I handle a flagged review?",
  "What's required under the Spam Act for marketing emails?",
  "Do I need a Privacy Policy for my listing?",
];

export function Copilot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content: text.trim() }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data: { session } } = await supabase!.auth.getSession();
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ message: text.trim(), history: next.slice(0, -1) }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 503) setUnavailable(true);
        setMessages((m) => [...m, { role: "assistant", content: data.error || "Something went wrong — try again shortly." }]);
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Couldn't reach Copilot — check your connection and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close Copilot" : "Open ReferAus Copilot"}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
      >
        {open ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-24 right-6 z-40 w-[min(380px,calc(100vw-2rem))] h-[min(560px,calc(100vh-8rem))] bg-white rounded-2xl shadow-2xl border border-line-200 flex flex-col overflow-hidden"
          >
            <div className="bg-blue-600 px-4 py-3.5 flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">ReferAus Copilot</p>
                <p className="text-[11px] text-blue-100 leading-tight">Compliance & ops advisor</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-ink-500">
                    Ask about NDIS compliance, privacy, screening checks, or anything about running your listing.
                  </p>
                  <div className="space-y-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="block w-full text-left text-xs px-3 py-2 rounded-lg border border-line-200 hover:border-blue-300 hover:bg-blue-50 text-ink-700 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user" ? "bg-orange-500 text-white rounded-br-sm" : "bg-gray-100 text-ink-900 rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-ink-400" />
                    <span className="text-xs text-ink-400">Thinking…</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-line-100 p-3 shrink-0">
              {unavailable ? (
                <p className="text-xs text-ink-400 text-center py-1">Copilot isn't set up yet on this server.</p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(input);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Copilot…"
                    className="flex-1 text-sm px-3 py-2 rounded-lg border border-line-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    aria-label="Send"
                    className="h-9 w-9 shrink-0 rounded-lg bg-blue-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
