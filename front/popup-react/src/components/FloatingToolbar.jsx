import { useState } from "react";
import { Sparkles, MessageSquare, Edit, Lightbulb } from "lucide-react";
import { cn } from "../lib/utils";


const FloatingToolbar = ({ onAction, position }) => {
  const [activeAction, setActiveAction] = useState(null);

  const actions = [
    {
      id: "explain",
      icon: Lightbulb,
      label: "Explain",
      color: "text-yellow-400"
    },
    {
      id: "summarize",
      icon: MessageSquare,
      label: "Summarize",
      color: "text-green-400"
    },
    {
      id: "reply",
      icon: Sparkles,
      label: "reply",
      color: "text-purple-400"
    },
    {
      id: "more",
      icon: MessageSquare,
      label: "More",
      color: "text-green-400"
    }
  ];

  const handleAction = (actionId) => {
    setActiveAction(actionId);
    onAction(actionId);
    setTimeout(() => setActiveAction(null), 300);
  };

  return (
    <div className="animate-toolbar-slide">
      <div className="bg-toolbar-bg border border-toolbar-border rounded-xl p-2 shadow-toolbar backdrop-blur-sm">
        <div className="flex items-center gap-1">
          {actions.map((action) => {
            const Icon = action.icon;
            const isActive = activeAction === action.id;
            
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                  "hover:bg-toolbar-hover hover:scale-105",
                  isActive && "bg-primary/20 scale-95"
                )}
                title={action.label}
              >
                <Icon className={cn("w-4 h-4", action.color)} />
                <span className="text-white">{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Toolbar Arrow */}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-toolbar-bg border-r border-b border-toolbar-border rotate-45" />
      </div>
    </div>
  );
};

export default FloatingToolbar;