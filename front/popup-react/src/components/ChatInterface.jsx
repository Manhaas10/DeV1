import { useState, useRef, useEffect } from "react";
import { X, Send, Copy, Check } from "lucide-react";
import { cn } from "../lib/utils";
import { marked } from "marked";

const ChatInterface = ({ selectedText, onClose }) => {
  const BACKEND_URL = "http://localhost:8000/chat";
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [pendingMessage, setPendingMessage] = useState(null); // 🆕 for controlled backend send
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // On mount, send initial selected text to backend
  useEffect(() => {
    if (selectedText) {
      const initialMessage = {
        id: "init-" + Date.now(),
        text: selectedText,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
      setPendingMessage(initialMessage); // triggers backend
    }
  }, [selectedText]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message to backend when `pendingMessage` is set
  useEffect(() => {
    if (pendingMessage) {
      callBackend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingMessage]);

  // Triggered when user hits Enter or presses Send
  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setPendingMessage(userMessage); // backend trigger
  };

  // Send full conversation history to backend
  const callBackend = async () => {
    try {
      const payload = {
        messages: [...messages, pendingMessage].map(({ isUser, text }) => ({
          role: isUser ? "user" : "assistant",
          content: text,
        })),
      };

      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const aiResponse = {
        id: Date.now().toString() + "-ai",
        text: data.reply || "⚠️ AI did not respond.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("❌ Error contacting backend:", error);
    } finally {
      setPendingMessage(null); // reset trigger
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111] border border-green-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col transition-all duration-300 text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-green-800">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-md shadow-green-500/40" />
            <h2 className="text-base font-semibold text-green-300">AI Chat Assistant</h2>
            {selectedText && (
              <span className="text-sm text-gray-400">• discussing selected text</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            title="Close chat"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {selectedText && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Selected text:</p>
              <p className="text-sm italic text-white">"{selectedText}"</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex gap-3", message.isUser ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-xl p-4 text-sm leading-relaxed",
                  message.isUser
                    ? "bg-green-700 text-white"
                    : "bg-zinc-900 text-gray-100 border border-zinc-700"
                )}
              >
                <div
  className="prose prose-sm prose-invert max-w-none"
  dangerouslySetInnerHTML={{ __html: marked.parse(message.text) }}
/>
                {!message.isUser && (
                  <button
                    onClick={() => handleCopy(message.text, message.id)}
                    className="mt-2 p-1 hover:bg-white/10 rounded transition-colors duration-200"
                    title="Copy message"
                  >
                    {copiedId === message.id ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400 hover:text-white" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-5 border-t border-green-800">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Continue the conversation..."
              className="flex-1 px-4 py-3 bg-zinc-800 border border-green-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-white placeholder-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={cn(
                "px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                inputValue.trim()
                  ? "bg-green-600 text-white hover:bg-green-500"
                  : "bg-zinc-700 text-gray-400 cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
