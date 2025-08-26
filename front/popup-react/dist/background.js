// background.js

// Fires once when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ StudyCopilot Extension Installed");
});

// Optional: Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📩 Message received in background:", message);

  if (message.type === "ping") {
    sendResponse({ reply: "pong from background!" });
  }

  // You can handle more types here...
  return true; // Needed for async sendResponse
});
