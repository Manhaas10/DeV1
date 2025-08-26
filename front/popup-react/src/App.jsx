// src/App.jsx
import React, { useState, useEffect } from "react";
import FloatingToolbar from "./components/FloatingToolbar";
import ChatBubble from "./components/ChatBubble";
import ChatInterface from "./components/ChatInterface";
import "./index.css"; // Ensure styles are imported

const App = () => {
  const [showChat, setShowChat] = useState(false);
  const [chatText, setChatText] = useState("");
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [selectedTextForChat, setSelectedTextForChat] = useState("");

  useEffect(() => {
    const handleMouseUp = (e) => {
      const selectedText = window.getSelection()?.toString().trim();
      if (!selectedText) {
        setShowToolbar(false);
        return;
      }

      // Fallbacks for position in case pageX/pageY are undefined
      const x = e.pageX ?? e.clientX ?? 0;
      const y = e.pageY ?? e.clientY ?? 0;

      console.log("📌 Selection at:", x, y);

      setToolbarPosition({
        top: y - 40, // position toolbar above selection
        left: x,
      });

      setShowToolbar(true);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  useEffect(() => {
    console.log("📌 Toolbar position updated:", toolbarPosition);
  }, [toolbarPosition]);

 const handleAction = async (type) => {
  const selectedText = window.getSelection()?.toString().trim();
  if (!selectedText) {
    alert("Select some text first.");
    return;
  }

  if (type === "more") {
    setSelectedTextForChat(selectedText);
    setShowChatInterface(true);
    setShowToolbar(false);
    return;
  }

  try {
    const response = await fetch(`http://localhost:8000/${type}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: selectedText }),
    });

    const data = await response.json();
    const firstKey = Object.keys(data)[0];
    const resultText = data[firstKey] || JSON.stringify(data);

    setChatText(resultText);
    setShowChat(true);
    setShowToolbar(false);
  } catch (error) {
    console.error("❌ API Error:", error);
    setChatText("❌ Failed to fetch from backend.");
    setShowChat(true);
    setShowToolbar(false);
  }
};

  return (
       <>
      {showToolbar && (
        <div
          style={{
            position: "absolute",
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
            zIndex: 999999,
          }}
        >
          <FloatingToolbar onAction={handleAction} position={toolbarPosition} />
        </div>
      )}

      {showChat && (
        <ChatBubble text={chatText} onClose={() => setShowChat(false)} />
      )}

      {showChatInterface && (
        <ChatInterface
          selectedText={selectedTextForChat}
          onClose={() => setShowChatInterface(false)}
        />
      )}
    </>
  );
};

export default App;
