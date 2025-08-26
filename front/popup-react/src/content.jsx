// src/content.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css"; // Ensure styles are imported

const mount = document.createElement("div");
mount.id = "ai-study-copilot-root";
document.body.appendChild(mount);
console.log("🧠 StudyCopilot content script loaded");

const root = createRoot(mount);
root.render(<App />);
