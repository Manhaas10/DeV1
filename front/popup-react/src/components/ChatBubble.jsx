import { useState, useEffect } from "react";
import { X, Copy, Check } from "lucide-react";
import { cn } from "../lib/utils";

const ChatBubble = ({ text, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200); // smooth exit
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100000]">
      <div
        className={cn(
          "relative bg-[#128C47] text-white rounded-2xl p-5 max-w-sm shadow-lg border border-[#0F6A36] transition-all duration-300",
          isVisible
            ? "animate-bubble-pop animate-bubble-float"
            : "scale-0 opacity-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-white/70 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-white/90">AI Assistant</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200"
              title="Copy text"
            >
              {copied ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Copy className="w-4 h-4 text-white/80 hover:text-white" />
              )}
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200"
              title="Close"
            >
              <X className="w-4 h-4 text-white/80 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Message Content */}
        <div className="text-sm leading-relaxed text-white/90">{text}</div>

        {/* Bubble Tail */}
        <div className="absolute -bottom-2 right-8 w-4 h-4 bg-[#128C47] rotate-45 border-b border-r border-[#0F6A36]" />
      </div>
    </div>
  );
};

export default ChatBubble;
